import React from "react";
import Router from "next/router";
import NProgress from "nprogress";

let timer: NodeJS.Timeout | null = null;
let state: "stop" | "loading" | null = null;
let activeRequests = 0;
const delay = 250;

const load = () => {
  if (state === "loading") {
    return;
  }

  state = "loading";

  timer = setTimeout(function () {
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
window.fetch = async function (...args) {
  if (activeRequests === 0) {
    load();
  }

  activeRequests++;

  try {
    return await originalFetch(...args);
  } catch (error) {
    return Promise.reject(error);
  } finally {
    activeRequests -= 1;
    if (activeRequests === 0) {
      stop();
    }
  }
};

const TopProgressBar: React.FC = () => {
  return null;
};
export default TopProgressBar;
