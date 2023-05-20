import { Collection } from "@/commons/types";
import styles from "./CollectionCard.module.scss";
import Link from "next/link";

export interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = (props) => {
  return (
    <Link href={`/collections/${props.collection.id}`}>
      <div className={`card ${styles.collectionCard}`}>
        <div className="card-image">
          <figure className="image is-4by3">
            <img
              className={styles.collectionImage}
              src={`${process.env.NEXT_PUBLIC_API_URL}/collections/${props.collection.id}/thumbnail`}
              alt="Placeholder image"
            />
          </figure>
        </div>
        <div className={`card-content ${styles.cardContent}`}>
          <div className="media">
            <div className="media-content">
              <p className="title is-4">{props.collection.name}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
