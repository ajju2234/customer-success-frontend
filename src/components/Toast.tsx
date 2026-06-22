"use client";

import { App } from "antd";

/** Thin wrapper over antd's themed message API. */
export function useToast() {
  const { message } = App.useApp();
  return {
    success: (text: string) => message.success(text),
    error: (text: string) => message.error(text),
    info: (text: string) => message.info(text),
  };
}
