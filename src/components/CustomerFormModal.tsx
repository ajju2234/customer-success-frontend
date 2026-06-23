"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/components/Toast";
import { Customer } from "@/lib/types";
import { CustomerForm, customerSchema } from "@/lib/validation";
import { createCustomer, updateCustomer } from "@/store/customersSlice";
import { useAppDispatch } from "@/store/hooks";

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Active" },
  { value: "at_risk", label: "At risk" },
  { value: "churned", label: "Churned" },
];

export function CustomerFormModal({
  open,
  onClose,
  onSaved,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  customer?: Customer | null;
}) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const editing = Boolean(customer);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerForm>({ resolver: zodResolver(customerSchema) });

  // Re-seed the form each time the modal opens so New vs Edit shows correct values.
  useEffect(() => {
    if (!open) return;
    setServerError(null);
    reset({
      name: customer?.name ?? "",
      company: customer?.company ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      status: customer?.status ?? "prospect",
      health_score: customer?.health_score ?? null,
    });
  }, [open, customer, reset]);

  async function onSubmit(form: CustomerForm) {
    setServerError(null);
    const payload = {
      name: form.name,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      status: form.status,
      health_score: form.health_score ?? null,
    };
    const res = editing
      ? await dispatch(updateCustomer({ id: customer!.id, data: payload }))
      : await dispatch(createCustomer(payload));
    if (createCustomer.fulfilled.match(res) || updateCustomer.fulfilled.match(res)) {
      toast.success(editing ? "Customer updated" : "Customer created");
      onSaved();
      onClose();
    } else {
      setServerError((res.payload as string) || "Could not save customer");
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editing ? "Edit customer" : "New customer"}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-3">
        <div>
          <label className="label">Name *</label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                placeholder="Acme Inc."
                status={errors.name ? "error" : ""}
              />
            )}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Company</label>
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Company name"
                />
              )}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select {...field} className="w-full" options={STATUS_OPTIONS} />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Email</label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  placeholder="name@company.com"
                  status={errors.email ? "error" : ""}
                />
              )}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="+1 555 000 0000"
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="label">Health score (0–100)</label>
          <Controller
            control={control}
            name="health_score"
            render={({ field }) => (
              <InputNumber
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={100}
                className="w-full"
                placeholder="e.g. 80"
              />
            )}
          />
          {errors.health_score && <p className="field-error">Must be between 0 and 100</p>}
        </div>

        {serverError && <Alert type="error" message={serverError} showIcon />}

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {editing ? "Save changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
