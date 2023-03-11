use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::Database;

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub thumb: Option<i64>,
    pub parent: Option<String>,
}

pub async fn create(connection: &Database, collection: Collection) -> Collection {
    sqlx::query("insert into Collections (id, name, parent) values (?, ?, ?)")
        .bind(&collection.id)
        .bind(&collection.name)
        .bind(&collection.parent)
        .execute(connection.get_pool())
        .await
        .unwrap();
    collection
}

pub async fn get(connection: &Database, id: String) -> Option<Collection> {
    let collection = sqlx::query_as::<_, Collection>("select * from Collections where id = ?")
        .bind(id)
        .fetch_one(connection.get_pool())
        .await;

    match collection {
        Ok(collection) => Some(collection),
        Err(_) => None,
    }
}

pub async fn get_all_by_parent(connection: &Database, parent: String) -> Vec<Collection> {
    sqlx::query_as::<_, Collection>("select * from Collections where parent = ?")
        .bind(parent)
        .fetch_all(connection.get_pool())
        .await
        .unwrap()
}

pub async fn get_all_without_parent(connection: &Database) -> Vec<Collection> {
    sqlx::query_as::<_, Collection>("select * from Collections where parent is null")
        .fetch_all(connection.get_pool())
        .await
        .unwrap()
}

pub async fn set_thumb(connection: &Database, id: String, thumb: i64) {
    sqlx::query("update Collections set thumb = ? where id = ?")
        .bind(thumb)
        .bind(id)
        .execute(connection.get_pool())
        .await
        .unwrap();
}

pub async fn delete(connection: &Database, id: String) {
    sqlx::query("delete from Collections where id = ?")
        .bind(id)
        .execute(connection.get_pool())
        .await
        .unwrap();
}