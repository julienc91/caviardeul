import Router from "next/router";
import NProgress from "nprogress";
import React from "react";

let timer: NodeJS.Timeout | null = null;
let state: "stop" | "loading" | null = null;
let activeRequests = 0;
const delay = 250;

const load = () => {
  if (state === "loading") {
    return;
  }

  state = "loading";

  timer = setTimeout(() => {
    NProgress.start();
  }, delay); // only show progress bar if it takes longer than the delay
};

const stop = () => {
  if (activeRequests > 0) {
    return;
  }

  state = "stop";

  timer && clearTimeout(timer);
  NProgress.done();
};

Router.events.on("routeChangeStart", load);
Router.events.on("routeChangeComplete", stop);
Router.events.on("routeChangeError", stop);

const originalFetch = window.fetch;
window.fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const ignoreLoading = init?.method === "POST";
  if (activeRequests === 0 && !ignoreLoading) {
    load();
  }

  if (!ignoreLoading) {
    activeRequests++;
  }

  try {
    return await originalFetch(input, init);
  } catch (error) {
    return Promise.reject(error);
  } finally {
    if (!ignoreLoading) {
      activeRequests -= 1;
      if (activeRequests === 0) {
        stop();
      }
    }
  }
};

const TopProgressBar: React.FC = () => {
  return null;
};
export default TopProgressBar;
