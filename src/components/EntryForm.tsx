'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { DataEntryField, EntryValues } from "@/types";

interface EntryFormProps {
  fields: DataEntryField[];
  onSubmit: (values: EntryValues) => void;
  onCancelEdit?: () => void;
  initialValues?: EntryValues | null;
  isEditing?: boolean;
}

type ValidationErrors = Record<string, string>;

function getDefaultValue(field: DataEntryField): string | number | boolean | null {
  switch (field.type) {
    case "checkbox":
      return false;
    default:
      return "";
  }
}

function normalizeValue(field: DataEntryField, value: unknown): string | number | boolean | null {
  if (value === undefined || value === null) {
    return getDefaultValue(field);
  }

  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value);
}

export function EntryForm({ fields, onSubmit, initialValues, onCancelEdit, isEditing }: EntryFormProps) {
  const [formValues, setFormValues] = useState<EntryValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  const orderedFields = useMemo(() => fields, [fields]);

  useEffect(() => {
    const nextValues: EntryValues = {};

    orderedFields.forEach((field) => {
      const initialValue = initialValues?.[field.key];
      nextValues[field.key] = normalizeValue(field, initialValue);
    });

    setFormValues(nextValues);
  }, [initialValues, orderedFields]);

  const validate = (): boolean => {
    const nextErrors: ValidationErrors = {};

    orderedFields.forEach((field) => {
      const value = formValues[field.key];

      if (!field.required) {
        return;
      }

      if (field.type === "checkbox") {
        if (!value) {
          nextErrors[field.key] = "This checkbox must be selected.";
        }
        return;
      }

      if (value === undefined || value === null || value === "") {
        nextErrors[field.key] = "This field is required.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const cleaned: EntryValues = {};
    orderedFields.forEach((field) => {
      const value = formValues[field.key];
      if (field.type === "number") {
        cleaned[field.key] =
          value === "" || value === undefined || value === null ? null : Number(value);
      } else if (field.type === "checkbox") {
        cleaned[field.key] = Boolean(value);
      } else {
        cleaned[field.key] = value ?? "";
      }
    });

    onSubmit(cleaned);
  };

  const updateValue = (field: DataEntryField, value: unknown) => {
    setFormValues((prev) => ({
      ...prev,
      [field.key]: normalizeValue(field, value)
    }));
    setErrors((prev) => {
      if (!prev[field.key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field.key];
      return next;
    });
  };

  return (
    <section className="card p-6">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {isEditing ? "Update entry" : "New entry"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the form below using the structure you defined. All changes are saved locally.
        </p>
      </header>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        {orderedFields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-center text-sm text-slate-600">
            Add at least one field to start entering data.
          </div>
        ) : (
          orderedFields.map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              value={formValues[field.key]}
              error={errors[field.key]}
              onChange={(value) => updateValue(field, value)}
            />
          ))
        )}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {isEditing && (
            <button type="button" className="btn-secondary" onClick={onCancelEdit}>
              Cancel edit
            </button>
          )}
          <button type="submit" className="btn" disabled={orderedFields.length === 0}>
            {isEditing ? "Save updates" : "Save entry"}
          </button>
        </div>
      </form>
    </section>
  );
}

interface FieldInputProps {
  field: DataEntryField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

function FieldInput({ field, value, error, onChange }: FieldInputProps) {
  const commonLabelClasses = "flex flex-col gap-1 text-sm font-medium text-slate-700";
  const commonInputClasses =
    "rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none";
  const helperText = field.helpText ? (
    <p className="text-xs text-slate-500">{field.helpText}</p>
  ) : null;

  switch (field.type) {
    case "textarea":
      return (
        <label className={commonLabelClasses}>
          {field.label}
          <textarea
            value={String(value ?? "")}
            rows={4}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className={`${commonInputClasses} resize-y`}
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
          {helperText}
        </label>
      );
    case "select":
      return (
        <label className={commonLabelClasses}>
          {field.label}
          <select
            value={String(value ?? "")}
            onChange={(event) => onChange(event.target.value)}
            className={commonInputClasses}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {error && <span className="text-xs text-red-600">{error}</span>}
          {helperText}
        </label>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="h-5 w-5 rounded border border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          {field.label}
          {error && <span className="text-xs text-red-600">{error}</span>}
          {helperText}
        </label>
      );
    case "number": {
      const numberDisplay =
        value === "" || value === undefined || value === null ? "" : String(value);

      return (
        <label className={commonLabelClasses}>
          {field.label}
          <input
            type="number"
            value={numberDisplay}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
            className={commonInputClasses}
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
          {helperText}
        </label>
      );
    }
    default: {
      const inputType = field.type === "phone" ? "tel" : field.type;

      return (
        <label className={commonLabelClasses}>
          {field.label}
          <input
            type={inputType}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className={commonInputClasses}
          />
          {error && <span className="text-xs text-red-600">{error}</span>}
          {helperText}
        </label>
      );
    }
  }
}
