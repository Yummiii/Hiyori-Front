import fetcher from "@/commons/fecther";
import { Book, Page } from "@/commons/types";
import useSWR from "swr";
import styles from "./BookView.module.scss";

export interface BookViewProps {
  book: Book;
}

export interface GetBookResponse {
  book: Book;
  pages: Page[];
}

const BookView: React.FC<BookViewProps> = (props) => {
  const { data, error } = useSWR<GetBookResponse>(
    `/books/${props.book.id}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <div className={`box ${styles.box}`}>
      <h1 className="title">{data.book.name}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {data.pages.map((page) => (
          <img
            key={page.id}
            src={`${process.env.NEXT_PUBLIC_API_URL}/books/${props.book.id}/images/${page.id}`}
            style={{ height: "8rem" }}
            onClick={() =>
              open(
                `${process.env.NEXT_PUBLIC_API_URL}/books/${props.book.id}/images/${page.id}`,
                "_blank"
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default BookView;
