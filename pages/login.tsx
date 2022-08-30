import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user } = router.query;

  useEffect(() => {
    if (user) {
      setCookie("userId", user);
    }
    router.push("/");
  }, [user, router]);

  return <>Chargement...</>;
};

export default LoginPage;
