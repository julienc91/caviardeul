import { Head, Html, Main, NextScript } from "next/document";
import React from "react";

import { themeScript } from "@caviardeul/utils/theme";

const Document = () => {
  return (
    <Html lang="fr">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
