import { Fetcher } from "swr";

const fetcher: Fetcher<any, string> = async (url) => {
  url = `${process.env.API_URL}${url}`;
  const res = await fetch(url, {
    headers: {
      Authorization: localStorage.getItem("token") || "",
    },
  });
  const data = await res.json();
  return data;
};

export default fetcher;
