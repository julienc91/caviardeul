import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "nprogress/nprogress.css";
import { QueryClient, QueryClientProvider } from "react-query";

import Layout from "@caviardeul/components/layout";

import "../styles/style.scss";

const queryClient = new QueryClient();

const TopProgressBar = dynamic(
  () => {
    return import("../components/topProgressBar");
  },
  { ssr: false },
);

const Caviardeul = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <TopProgressBar />
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </>
  );
};

export default Caviardeul;
