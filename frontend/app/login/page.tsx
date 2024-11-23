"use client";

import { redirect } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";

import Loader from "@caviardeul/components/utils/loader";
import { sendLoginRequest } from "@caviardeul/lib/queries";

const Page = (props: { searchParams: Promise<{ user?: string }> }) => {
  const searchParams = use(props.searchParams);
  const [loggedIn, setLoggedIn] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const userId = searchParams?.user ?? "";

  useEffect(() => {
    if (!userId.length || userId == userIdRef.current) {
      return;
    }

    userIdRef.current = userId;
    (async () => {
      await sendLoginRequest(userId);
      setLoggedIn(true);
    })();
  }, [userId]);

  if (loggedIn) {
    redirect("/archives");
  }

  return <Loader />;
};

export default Page;
