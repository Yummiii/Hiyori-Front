import type { AppProps } from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "bulma/css/bulma.min.css";
import AddMenu from "@/components/AddMenu";
config.autoAddCss = false;
import "@/styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AddMenu />
      <Component {...pageProps} />
    </>
  );
}
