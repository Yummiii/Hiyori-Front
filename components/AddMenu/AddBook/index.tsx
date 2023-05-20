import { RefObject, useState } from "react";
import styles from "./AddBook.module.scss";
import fetcher from "@/commons/fecther";
import { Collection } from "@/commons/types";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface AddBookProps {
  show: boolean;
  save: RefObject<HTMLButtonElement>;
}

const NewBook: React.FC<AddBookProps> = (props) => {
  const [fileName, setFileName] = useState<string>("Select a file");
  const [collection, setCollection] = useState<string>("");
  const [books, setBooks] = useState<FileList>();

  const { data, error } = useSWR<Collection[]>(`/collections/`, fetcher);
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  function booksSelected(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const files = event.target.files;

    if (files.length == 1) {
      setFileName(files[0].name);
    } else {
      setFileName(`${files.length} files selected`);
    }

    setBooks(files);
  }

  if (!props.save.current) return (<></>);
  props.save.current.onclick = async () => {
    if (!books) return;
    if (!collection || collection == "") return;

    for (let i = 0; i < books?.length; i++) {
      const formData = new FormData();
      formData.append("collection", collection);
      formData.append("epub", books[i]);

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books/from_epub`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
        body: formData,
      });
    }
  };

  return (
    <div
      style={{ display: props.show ? "flex" : "none" }}
      className={styles.addBook}
    >
      <div className={`${styles.field}`}>
        <label className="label">Collection</label>
        <div className="control">
          <div className={`select ${styles.field}`}>
            <select className={`${styles.field}`}>
              {data?.map((collection) => (
                <option
                  key={collection.id}
                  onClick={() => setCollection(collection.id)}
                >
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`${styles.field}`}>
        <label className="label">Books(s)</label>
        <div className="file has-name is-fullwidth">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              accept=".epub"
              multiple
              onChange={booksSelected}
            />
            <span className="file-cta">
              <span className="file-icon">
                <FontAwesomeIcon icon={faUpload} />
              </span>
              <span className="file-label">Choose a file…</span>
            </span>
            <span className="file-name">{fileName}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NewBook;
