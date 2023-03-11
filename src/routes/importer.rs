use std::io::Read;

use crate::database::{
    collections::{self, Collection},
    images::{self, ImageData},
    Database,
};
use actix_multipart::form::{tempfile::TempFile, MultipartForm, text::Text};
use actix_web::{post, web::Data, HttpResponse};
use cuid2::cuid;
use regex::Regex;
use xml::EventReader;
use zip::ZipArchive;

#[derive(Debug, MultipartForm)]
pub struct ImagesFromEpubDto {
    pub epub: TempFile,
    pub parent: Option<Text<String>>
}

#[post("/from_epub")]
pub async fn images_from_epub(
    database: Data<Database>,
    epub: MultipartForm<ImagesFromEpubDto>,
) -> HttpResponse {
    if let Some(content_type) = &epub.epub.content_type {
        if content_type.to_string() != "application/epub+zip" {
            return HttpResponse::BadRequest().body("File is not an epub");
        }
    }

    let parent = if let Some(parent) = &epub.parent {
        if collections::get(&database, parent.0.clone()).await.is_none() {
            return HttpResponse::BadRequest().body("Parent collection does not exist");
        }
        Some(parent.0.clone())
    } else {
        None
    };

    let mut archive = ZipArchive::new(epub.epub.file.as_file()).unwrap();
    let archive_clone = archive.clone();
    let content_file = archive_clone
        .file_names()
        .into_iter()
        .find(|x| x.contains("content.opf"))
        .unwrap();

    let mut archive_clone = archive.clone();
    let mut content = archive_clone.by_name(content_file).unwrap();
    let mut contents = String::new();
    content.read_to_string(&mut contents).unwrap();

    let parser = EventReader::from_str(&contents);
    let mut imgs = Vec::new();
    let mut index = 0;

    for e in parser {
        match e {
            Ok(xml::reader::XmlEvent::StartElement {
                name, attributes, ..
            }) => {
                if name.local_name == "item" {
                    let mut href = String::new();
                    let mut id = String::new();
                    for attr in &attributes {
                        if attr.name.local_name == "href" {
                            href = attr.value.clone();
                        }
                        if attr.name.local_name == "id" {
                            id = attr.value.clone();
                        }
                    }
                    if href != "" && id != "" {
                        let re = Regex::new(r"(.*)\.(jpg|jpeg|png|gif)").unwrap();
                        if re.is_match(&href) {
                            imgs.push((
                                href,
                                attributes
                                    .iter()
                                    .find(|x| x.name.local_name == "media-type")
                                    .unwrap()
                                    .value
                                    .clone(),
                                index
                            ));
                            index += 1;
                        }
                    }
                }
            }
            Err(e) => {
                println!("Error: {}", e);
                break;
            }
            _ => {}
        }
    }

    let c = collections::create(
        &database,
        Collection {
            id: cuid(),
            name: epub.epub.file_name.clone().unwrap().replace(".epub", ""),
            thumb: None,
            parent,
        },
    )
    .await;

    for img in imgs {
        let mut file = archive
            .by_name(&content_file.replace("content.opf", &img.0))
            .unwrap();
        let mut contents = Vec::new();
        file.read_to_end(&mut contents).unwrap();
        let d_id = images::create_image_data(
            &database,
            ImageData {
                id: 0,
                content: contents,
                mime: img.1,
            },
        )
        .await;
        images::create(
            &database,
            images::Image {
                id: cuid(),
                collection_id: c.id.clone(),
                data: d_id,
                page_index: img.2,
            },
        )
        .await;
    }
    HttpResponse::Ok().json(c)
}
