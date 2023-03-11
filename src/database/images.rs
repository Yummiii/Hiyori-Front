use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct Image {
    pub id: String,
    pub collection_id: String,
    pub data: i64,
    pub page_index: i32,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct ImageData {
    pub id: i64,
    pub mime: String,
    pub content: Vec<u8>,
}

pub async fn create_image_data(connection: &Database, data: ImageData) -> i64 {
    let result = sqlx::query("insert into ImagesData (mime, content) values (?, ?)")
        .bind(&data.mime)
        .bind(&data.content)
        .execute(connection.get_pool())
        .await
        .unwrap();

    result.last_insert_id() as i64
}

pub async fn get_image_data(connection: &Database, id: i64) -> Option<ImageData> {
    let data = sqlx::query_as::<_, ImageData>("select * from ImagesData where id = ?")
        .bind(id)
        .fetch_one(connection.get_pool())
        .await;

    match data {
        Ok(data) => Some(data),
        Err(_) => None,
    }
}

pub async fn create(connection: &Database, image: Image) -> String {
    let result =
        sqlx::query("insert into Images (id, collection_id, data, page_index) values (?, ?, ?, ?)")
            .bind(&image.id)
            .bind(&image.collection_id)
            .bind(&image.data)
            .bind(&image.page_index)
            .execute(connection.get_pool())
            .await
            .unwrap();

    result.last_insert_id().to_string()
}

pub async fn get_image(connection: &Database, id: String) -> Option<Image> {
    let image = sqlx::query_as::<_, Image>("select * from Images where id = ?")
        .bind(id)
        .fetch_one(connection.get_pool())
        .await;

    match image {
        Ok(image) => Some(image),
        Err(_) => None,
    }
}

pub async fn get_all_by_collection(connection: &Database, collection: String) -> Vec<Image> {
    sqlx::query_as::<_, Image>(
        "select * from Images where collection_id = ? order by page_index asc",
    )
    .bind(collection)
    .fetch_all(connection.get_pool())
    .await
    .unwrap()
}

pub async fn delete_image_data(connection: &Database, id: i64) {
    sqlx::query("delete from ImagesData where id = ?")
        .bind(id)
        .execute(connection.get_pool())
        .await
        .unwrap();
}

pub async fn delete_images_by_collection(connection: &Database, collection: String) {
    let images = get_all_by_collection(connection, collection.clone()).await;

    sqlx::query("delete from Images where collection_id = ?")
        .bind(collection)
        .execute(connection.get_pool())
        .await
        .unwrap();

    for image in images {
        delete_image_data(connection, image.data).await;
    }
}
