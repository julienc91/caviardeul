import { getCookie } from "cookies-next/client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export const useUserId = (): string | null =>
  useSyncExternalStore(
    subscribe,
    () => getCookie("userId")?.toString() || null,
    () => null,
  );
