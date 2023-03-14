import useSWR, { Fetcher } from "swr";
import styles from "@/styles/Home.module.scss";
import { useState } from "react";
import Image from "next/image";

export interface Collection {
    id: string;
    name: string;
    parent?: string;
    thumb?: number;
}

export interface Image {
    id: string;
}

export interface ChildrenList {
    children: Collection[];
    count: number;
}

const fetcher: Fetcher<any[], string> = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

export default function Home() {
    const url = `https://api.zuraaa.com/hiyori`;
    // const url = "http://127.0.0.1:8080";

    const [images, setImages] = useState<Image[]>([]);
    const [children, setChildren] = useState<Collection[]>([]);
    const [path, setPath] = useState<string[]>(["Home"]);

    const { data, error } = useSWR<Collection[]>(
        `${url}/collections/list`,
        fetcher
    );

    async function loadCollection(id: string) {
        let images = await (
            await fetch(`${url}/collections/${id}/images`)
        ).json();
        let children = await (
            await fetch(`${url}/collections/${id}/children`)
        ).json();

        setPath((x) => [...x, id]);
        if (children.count != 0) {
            console.log(id);
            setChildren(children.children);
        }
        setImages(images);
    }

    async function nav(id: string) {
        setImages([]);

        let children = await (
            await fetch(
                id == "Home"
                    ? `${url}/collections/list`
                    : `${url}/collections/${id}/children`
            )
        ).json();

        setChildren(id == "Home" ? children : children.children);
    }

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;
    if (data && children.length == 0) {
        setChildren((x) => [...x, ...data]);
    }

    return (
        <>
            <div className={styles.navContainer}>
                <nav
                    className={`breadcrumb has-arrow-separator ${styles.pao}`}
                    aria-label="breadcrumbs"
                >
                    <ul>
                        {path.map((x) => (
                            <li key={x}>
                                <a onClick={() => nav(x)}>{x}</a>
                            </li>
                        ))}

                        {/* <li>
                            <a href="#">Documentation</a>
                        </li>
                        <li>
                            <a href="#">Components</a>
                        </li>
                        <li className="is-active">
                            <a href="#" aria-current="page">
                                Breadcrumb
                            </a>
                        </li> */}
                    </ul>
                </nav>
            </div>
            <div className={styles.collectionsList}>
                {children.map((x) => (
                    <div className={`${styles.collectionCard} card`} key={x.id}>
                        <div className="card-image">
                            <figure className="image is-4by3">
                                <Image
                                    src={`${url}/collections/${x.id}/thumb?default=true`}
                                    blurDataURL={`${url}/collections/${x.id}/thumb?default=true`}
                                    alt={x.id}
                                    fill
                                    placeholder="blur"
                                />
                            </figure>
                        </div>
                        <div className="card-content">
                            <div
                                className="content"
                                onClick={() => loadCollection(x.id)}
                            >
                                {x.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={`box ${styles.collectionsList} ${styles.imgsfodas}`}
            >
                {images.map((x) => (
                    <div className={`${styles.collectionCard} card`} key={x.id}>
                        <div className="card-image">
                            <figure className="image is-3by4">
                                <Image
                                    key={x.id}
                                    fill
                                    src={`${url}/images/${x.id}`}
                                    onClick={() => window.open(`${url}/images/${x.id}`, "_blank")}
                                    alt={x.id}
                                />
                            </figure>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
