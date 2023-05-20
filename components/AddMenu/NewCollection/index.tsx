import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./NewCollection.module.scss";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, RefObject, useRef, useState } from "react";
import { Collection } from "@/commons/types";
import { toast } from "bulma-toast";

export interface NewCollectionProps {
  show: boolean;
  save: RefObject<HTMLButtonElement>;
}

const NewCollection: React.FC<NewCollectionProps> = (props) => {
  const [thumb, setThumb] = useState<File | null>(null);
  const [isNameValid, setIsNameValid] = useState<boolean>(true);

  const name = useRef<HTMLInputElement>(null);

  function thumbSelected(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setThumb(e.target.files[0]);
  }

  if (props.save.current) {
    props.save.current.onclick = async () => {
      if (
        !name.current ||
        !name.current.value ||
        name.current.value.length < 1
      ) {
        setIsNameValid(false);
        return;
      }

      setIsNameValid(true);
      let resp = (await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/collections/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") || "",
          },
          body: JSON.stringify({
            name: name.current.value,
          }),
        })
      ).json()) as Collection;

      if (thumb) {
        const formData = new FormData();
        formData.append("thumbnail", thumb);
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/collections/${resp.id}/thumbnail`,
          {
            method: "POST",
            headers: {
              Authorization: localStorage.getItem("token") || "",
            },
            body: formData,
          }
        );
      }

      toast({
        message: `Collection ${resp.name} created`,
        type: "is-success",
      });

      setThumb(null);
      name.current.value = "";
    };
  }

  return (
    <div
      style={{ display: props.show ? "flex" : "none" }}
      className={styles.addCollection}
    >
      <div className={styles.field}>
        <label className="label">Collection Name</label>
        <div className="control">
          <input
            className={`input ${!isNameValid ? "is-danger" : ""}`}
            type="text"
            placeholder="Collection name"
            ref={name}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className="label">Thumbnail</label>

        <div className="file has-name">
          <label className={`file-label ${styles.field}`}>
            <input
              className="file-input"
              type="file"
              name="resume"
              onChange={thumbSelected}
            />
            <span className="file-cta">
              <span className="file-icon">
                <FontAwesomeIcon icon={faUpload} />
              </span>
              <span className="file-label">Choose a file…</span>
            </span>
            <span className={`file-name ${styles.field}`}>
              {thumb?.name || "Select a file"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NewCollection;
