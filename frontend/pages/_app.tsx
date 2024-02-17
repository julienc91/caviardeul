import type { AppProps } from "next/app";

import Layout from "@caviardeul/components/layout";

import "../styles/style.scss";

const Caviardeul = ({ Component, pageProps }: AppProps) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default Caviardeul;
