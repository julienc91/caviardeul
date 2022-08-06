import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import Game from "../../components/game";
import { getEncodedArticle } from "../../hooks/article";
import { EncodedArticle } from "../../types";
import { decodeArticle } from "../../utils/encryption";

const CustomGame: NextPage<{
  pageId: string;
  encodedArticle: EncodedArticle | null;
}> = ({ encodedArticle, ...props }) => {
  const article = encodedArticle ? decodeArticle(encodedArticle) : null;
  return <Game article={article} custom={true} {...props} />;
};

export default CustomGame;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const pageId = (params?.pageId || "") as string;
  try {
    const data = await getEncodedArticle(pageId, true);
    return { props: { pageId, encodedArticle: data } };
  } catch (error) {}
  return { props: { pageId, encodedArticle: null } };
};
