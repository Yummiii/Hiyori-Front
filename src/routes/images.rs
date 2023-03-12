use actix_web::{
    get,
    web::{self, Data},
    HttpResponse,
};
use crate::database::{images, Database};

#[get("/{id}")]
pub async fn get_image(database: Data<Database>, path: web::Path<String>) -> HttpResponse {
    let image = match images::get_image(&database, path.into_inner()).await {
        Some(image) => image,
        None => return HttpResponse::NotFound().body("Image not found"),
    };
    let image_data = match images::get_image_data(&database, image.data).await {
        Some(image_data) => image_data,
        None => return HttpResponse::NotFound().body("Image data not found"),
    };
    HttpResponse::Ok()
        .content_type(image_data.mime)
        .body(image_data.content)
}
