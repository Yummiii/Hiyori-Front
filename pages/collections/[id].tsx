import fetcher from "@/commons/fecther";
import { Book, Collection } from "@/commons/types";
import BookView from "@/components/BookView";
import { useRouter } from "next/router";
import useSWR from "swr";
import styles from "@/styles/Collection.module.scss";

interface GetCollectionResponse {
  books: Book[];
  collection: Collection;
}

export default function Collectiona() {
  const router = useRouter();
  const { data, error } = useSWR<GetCollectionResponse>(
    `/collections/${router.query.id}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <>
      <div className={styles.bookCollection}>
        {data.books.map((book) => (
          <BookView key={book.id} book={book} />
        ))}
      </div>
    </>
  );
}
