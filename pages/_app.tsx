import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";

import Layout from "@caviardeul/components/layout";

import "../styles/style.scss";

const queryClient = new QueryClient();

const Caviardeul = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
};

export default Caviardeul;
