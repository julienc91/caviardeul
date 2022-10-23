import { setCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import Loader from "@caviardeul/components/loader";
import { getUser } from "@caviardeul/utils/api";
import { BASE_URL, COOKIE_MAX_AGE } from "@caviardeul/utils/config";

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
  const user = await getUser(req, res);
  const targetUserId = query.user;
  if (user && targetUserId) {
    await fetch(`${BASE_URL}/api/me/merge`, {
      method: "POST",
      body: JSON.stringify({ userId: targetUserId }),
      headers: {
        Cookie: `userId=${user.id}`,
        "Content-Type": "application/json",
      },
    });
  }
  setCookie("userId", targetUserId, { req, res, maxAge: COOKIE_MAX_AGE });
  return { props: {} };
};

export default LoginPage;
