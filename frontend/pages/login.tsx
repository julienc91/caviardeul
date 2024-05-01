import { setCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import Loader from "@caviardeul/components/utils/loader";
import { API_URL, COOKIE_MAX_AGE } from "@caviardeul/utils/config";

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
  res,
}) => {
  const targetUserId = query.user;
  if (targetUserId) {
    await fetch(`${API_URL}/me/merge`, {
      method: "POST",
      body: JSON.stringify({ userId: targetUserId }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return { props: {} };
};

export default LoginPage;
