-- Add migration script here
create table ImagesData (
    id bigint not null auto_increment,
    mime varchar(255) not null,
    content longblob not null,
    primary key (id)
);

create table Collections (
    id varchar(24) not null,
    name varchar(255) not null,
    parent varchar(24),
    thumb bigint,
    primary key (id),
    foreign key (parent) references Collections(id),
    foreign key (thumb) references ImagesData(id)
);
create index IX_collections_parent on Collections(parent);

create table Images (
    id varchar(24) not null,
    collection_id varchar(24) not null,
    data bigint not null,
    page_index int not null,
    primary key (id),
    foreign key (collection_id) references Collections(id),
    foreign key (data) references ImagesData(id)
);
create index IX_collection_images on Images(collection_id);
create index IX_images_page_index on Images(page_index);