import React from "react";
import type { GetServerSideProps, NextPage } from "next";
import Game from "../../components/game";

const CustomGame: NextPage<{ pageId: string }> = ({ pageId }) => {
  return <Game pageId={pageId} />;
};

export default CustomGame;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: {
      pageId: params?.pageId ?? "",
    },
  };
};
