use crate::database::{
    collections::{self, Collection},
    images::{self, ImageData},
    Database,
};
use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::{
    delete, get, post,
    web::{self, Data, Json},
    HttpResponse,
};
use cuid2::cuid;
use serde::Deserialize;
use serde_json::json;
use std::io::Read;

#[derive(Debug, Deserialize)]
pub struct CreateCollectionDto {
    pub name: String,
    pub parent: Option<String>,
}

#[post("/create")]
pub async fn create_collection(
    collection: Json<CreateCollectionDto>,
    database: Data<Database>,
) -> HttpResponse {
    if let Some(parent) = &collection.parent {
        if collections::get(&database, parent.clone()).await.is_none() {
            return HttpResponse::BadRequest().body("Parent collection does not exist");
        }
    }

    let collection = collections::create(
        &database,
        Collection {
            id: cuid(),
            name: collection.name.clone(),
            parent: collection.parent.clone(),
            thumb: None,
        },
    )
    .await;
    HttpResponse::Created().json(collection)
}

#[derive(Debug, Deserialize)]
pub struct ListRequest {
    pub parent: Option<String>,
}

#[get("/list")]
pub async fn list_collections(
    database: Data<Database>,
    query: web::Query<ListRequest>,
) -> HttpResponse {
    let collections = if let Some(parent) = &query.parent {
        if parent != "" {
            collections::get_all_by_parent(&database, parent.clone()).await
        } else {
            collections::get_all_without_parent(&database).await
        }
    } else {
        collections::get_all_without_parent(&database).await
    };
    HttpResponse::Ok().json(collections)
}

#[derive(Debug, MultipartForm)]
pub struct SetCollectionThumbDto {
    pub image: TempFile,
}

#[post("/{id}/thumb")]
pub async fn set_collection_thumb(
    database: Data<Database>,
    path: web::Path<String>,
    thumb: MultipartForm<SetCollectionThumbDto>,
) -> HttpResponse {
    let collection = match collections::get(&database, path.into_inner()).await {
        Some(collection) => collection,
        None => return HttpResponse::NotFound().body("Collection not found"),
    };

    let mut content = Vec::new();
    thumb
        .image
        .file
        .as_file()
        .read_to_end(&mut content)
        .unwrap();

    let image_id = images::create_image_data(
        &database,
        ImageData {
            id: 0,
            content,
            mime: thumb.image.content_type.clone().unwrap().to_string(),
        },
    )
    .await;
    collections::set_thumb(&database, collection.id, image_id).await;

    if let Some(thumb) = collection.thumb {
        images::delete_image_data(&database, thumb).await;
    }

    HttpResponse::Ok().body("Collection thumbnail set")
}

#[get("/{id}/thumb")]
pub async fn get_collection_thumb(
    database: Data<Database>,
    path: web::Path<String>,
) -> HttpResponse {
    let collection = match collections::get(&database, path.into_inner()).await {
        Some(collection) => collection,
        None => return HttpResponse::NotFound().body("Collection not found"),
    };

    if let Some(thumb) = collection.thumb {
        let image_data = match images::get_image_data(&database, thumb).await {
            Some(image_data) => image_data,
            None => return HttpResponse::NotFound().body("Collection thumbnail not found"),
        };
        HttpResponse::Ok()
            .content_type(image_data.mime)
            .body(image_data.content)
    } else {
        HttpResponse::NotFound().body("Collection has no thumbnail")
    }
}

#[get("/{id}/images")]
pub async fn get_collection_images(
    database: Data<Database>,
    path: web::Path<String>,
) -> HttpResponse {
    let collection = match collections::get(&database, path.into_inner()).await {
        Some(collection) => collection,
        None => return HttpResponse::NotFound().body("Collection not found"),
    };

    let images = images::get_all_by_collection(&database, collection.id).await;
    HttpResponse::Ok().json(images)
}

#[delete("/{id}")]
pub async fn delete_collection(database: Data<Database>, path: web::Path<String>) -> HttpResponse {
    let collection = match collections::get(&database, path.into_inner()).await {
        Some(collection) => collection,
        None => return HttpResponse::NotFound().body("Collection not found"),
    };

    if collections::get_all_by_parent(&database, collection.id.clone())
        .await
        .len()
        > 0
    {
        return HttpResponse::BadRequest().body("Collection has children");
    }

    images::delete_images_by_collection(&database, collection.id.clone()).await;
    if let Some(thumb) = collection.thumb {
        images::delete_image_data(&database, thumb).await;
    }

    collections::delete(&database, collection.id).await;
    HttpResponse::Ok().body("Collection deleted")
}

#[get("/{id}/children")]
pub async fn get_collection_children(
    database: Data<Database>,
    path: web::Path<String>,
) -> HttpResponse {
    let collection = match collections::get(&database, path.into_inner()).await {
        Some(collection) => collection,
        None => return HttpResponse::NotFound().body("Collection not found"),
    };

    let children = collections::get_all_by_parent(&database, collection.id).await;
    HttpResponse::Ok().json(json!({
        "count": children.len(),
        "children": children
    }))
}
