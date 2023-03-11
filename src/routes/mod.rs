use actix_web::web::{self, ServiceConfig};

mod collections;
mod images;
mod importer;

pub fn init_routes(cfg: &mut ServiceConfig) {
    cfg.service(
        web::scope("/collections")
            .service(collections::create_collection)
            .service(collections::list_collections)
            .service(collections::set_collection_thumb)
            .service(collections::get_collection_thumb)
            .service(collections::get_collection_images)
            .service(collections::delete_collection)
            .service(collections::get_collection_children)
    )
    .service(web::scope("importer").service(importer::images_from_epub))
    .service(web::scope("images").service(images::get_image));
}
