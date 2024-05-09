import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import Loader from "@caviardeul/components/utils/loader";
import { API_URL } from "@caviardeul/utils/config";

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return <Loader />;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const targetUserId = query.user;
  if (targetUserId) {
    await fetch(`${API_URL}/me/merge`, {
      method: "POST",
      body: JSON.stringify({ userId: targetUserId }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.cookie ?? "",
      },
    });
  }
  return { props: {} };
};

export default LoginPage;
