"use client";

import { App } from "antd";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
};

/** Promise-based confirm backed by antd's themed Modal.confirm. */
export function useConfirm() {
  const { modal } = App.useApp();
  return (opts: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      modal.confirm({
        title: opts.title,
        content: opts.message,
        okText: opts.confirmLabel || "Confirm",
        cancelText: "Cancel",
        centered: true,
        width: 440,
        okButtonProps: opts.danger ? { danger: true, size: "middle" } : { size: "middle" },
        cancelButtonProps: { size: "middle" },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
}
