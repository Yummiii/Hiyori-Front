import fetcher from "@/commons/fecther";
import { Collection } from "@/commons/types";
import CollectionCard from "@/components/CollectionCard";
import styles from "@/styles/Home.module.scss";
import useSWR from "swr";

export default function Home() {
  if (typeof window !== "undefined" && localStorage.getItem("token") == null) {
    const sst = prompt("sst");
    if (sst) {
      localStorage.setItem("token", sst);
    }
  }

  const {data, error} = useSWR<Collection[]>(`/collections/`, fetcher);
  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return <div className={styles.collections}>
    {data.map((collection) => (
      <CollectionCard collection={collection} key={collection.id} />
    ))}
  </div>;
}
