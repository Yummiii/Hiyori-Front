import type { AppProps } from "next/app";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "bulma/css/bulma.min.css";
import AddMenu from "@/components/AddMenu";
config.autoAddCss = false;
import "@/styles/globals.scss";
import * as bulmaToast from "bulma-toast";

export default function App({ Component, pageProps }: AppProps) {
  bulmaToast.setDefaults({
    duration: 5000,
    position: "top-right",
    dismissible: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });

  return (
    <>
      <AddMenu />
      <Component {...pageProps} />
    </>
  );
}
