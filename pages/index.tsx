import useSWR, { Fetcher } from "swr";
import styles from "@/styles/Home.module.scss";
import { useEffect, useState } from "react";
import Image from "next/image";

export interface Collection {
    id: string;
    name: string;
    thumb: boolean;
}

export interface Book {
    id: string;
    title: string;
    collection: string;
}

export interface Image {
    id: string
    page: number;
}

export interface BookImages {
    book: Book;
    images: Image[]
}

const fetcher: Fetcher<any[], string> = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
};

export default function Home() {
    const url = `https://api.zuraaa.com/hiyori`;
    // const url = "http://127.0.0.1:8080";
    const fallback_img =
        "https://media.discordapp.net/attachments/708673194017423394/1062490251442008124/375.png";

    const { data, error } = useSWR<Collection[]>(`${url}/collections`, fetcher);
    const [books, setBooks] = useState<Book[]>([]);
    const [imgs, setImgs] = useState<Image[]>([])

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;

    async function loadBooks(id: string) {
        let books = await (
            await fetch(`${url}/collections/${id}/books`)
        ).json();
        setImgs([]);
        setBooks(books);
    }

    async function loadImages(id: string) {
        let book = await (
            await fetch(`${url}/books/${id}`)
        ).json();
        setImgs(book.images);
    }

    return (
        <>
            <div className={styles.collectionsList}>
                {data.map((x) => (
                    <div
                        className={`${styles.collectionCard} card`}
                        key={x.id}
                        onClick={() => loadBooks(x.id)}
                    >
                        <div className="card-image">
                            <figure className="image is-4by3">
                                <Image
                                    src={
                                        x.thumb
                                            ? `${url}/collections/${x.id}/thumb`
                                            : fallback_img
                                    }
                                    alt={x.id}
                                    fill
                                />
                            </figure>
                        </div>
                        <div className="card-content">
                            <div className="content">{x.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.collectionsList}>
                {books.map((x) => (
                    <div
                        className={`${styles.collectionCard} card`}
                        key={x.id}
                        onClick={() => loadImages(x.id)}
                    >
                        <div className="card-image">
                            <figure className="image is-4by3">
                                <Image
                                    src={`${url}/books/${x.id}/cover`}
                                    alt={x.id}
                                    fill
                                />
                            </figure>
                        </div>
                        <div className="card-content">
                            <div className="content">{x.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.collectionsList}>
                {imgs.map((x) => (
                    <div
                        className={`${styles.collectionCard} card`}
                        key={x.id}
                        onClick={() => open(`${url}/images/${x.id}`)}
                    >
                        <div className="card-image">
                            <figure className="image is-3by4">
                                <Image
                                    src={`${url}/images/${x.id}`}
                                    alt={x.id}
                                    fill
                                />
                            </figure>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
