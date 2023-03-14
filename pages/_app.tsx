import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import "bulma/css/bulma.min.css"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
