"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, DatePicker, Input, Modal, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/components/Toast";
import { customersApi } from "@/lib/api";
import { Customer } from "@/lib/types";
import { InteractionForm, interactionSchema } from "@/lib/validation";
import { createInteraction } from "@/store/interactionsSlice";
import { useAppDispatch } from "@/store/hooks";

const TYPE_OPTIONS = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
];

export function InteractionFormModal({
  open,
  onClose,
  onSaved,
  defaultCustomerId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  defaultCustomerId?: string;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InteractionForm>({ resolver: zodResolver(interactionSchema) });

  useEffect(() => {
    if (!open) return;
    customersApi.list({ limit: 100 }).then((p) => setCustomers(p.items));
    setServerError(null);
    reset({
      type: "meeting",
      customer_id: defaultCustomerId ?? "",
      title: "",
      notes: "",
      meeting_date: "",
    });
  }, [open, defaultCustomerId, reset]);

  async function onSubmit(form: InteractionForm) {
    setServerError(null);
    const res = await dispatch(
      createInteraction({
        customer_id: form.customer_id,
        type: form.type,
        title: form.title,
        notes: form.notes || undefined,
        meeting_date: new Date(form.meeting_date).toISOString(),
      })
    );
    if (createInteraction.fulfilled.match(res)) {
      toast.success("Interaction logged — AI insight generated");
      onSaved();
      onClose();
    } else {
      setServerError((res.payload as string) || "Could not create interaction");
    }
  }

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.company ? `${c.name} — ${c.company}` : c.name,
  }));

  return (
    <Modal open={open} onCancel={onClose} title="Log interaction" footer={null} destroyOnClose>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-3">
        <div>
          <label className="label">Customer *</label>
          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <Select
                {...field}
                className="w-full"
                showSearch
                optionFilterProp="label"
                placeholder="Select a customer"
                options={customerOptions}
                status={errors.customer_id ? "error" : ""}
              />
            )}
          />
          {errors.customer_id && <p className="field-error">{errors.customer_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Type</label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select {...field} className="w-full" options={TYPE_OPTIONS} />
              )}
            />
          </div>
          <div>
            <label className="label">Date &amp; time *</label>
            <Controller
              control={control}
              name="meeting_date"
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(d) => field.onChange(d ? d.toISOString() : "")}
                  status={errors.meeting_date ? "error" : ""}
                />
              )}
            />
            {errors.meeting_date && <p className="field-error">{errors.meeting_date.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Title *</label>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder="Quarterly review"
                status={errors.title ? "error" : ""}
              />
            )}
          />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Notes (AI insights are generated from these)</label>
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <Input.TextArea
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                rows={4}
                placeholder="What was discussed…"
              />
            )}
          />
        </div>

        {serverError && <Alert type="error" message={serverError} showIcon />}

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
