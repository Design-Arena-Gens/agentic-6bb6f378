'use client';

import { useMemo, useState } from "react";
import { createId } from "@/lib/id";
import { createSlug } from "@/lib/slug";
import type { DataEntryField, FieldType } from "@/types";

const FIELD_TYPES: {
  value: FieldType;
  label: string;
  helper: string;
}[] = [
  { value: "text", label: "Text", helper: "Free-form single line input" },
  { value: "textarea", label: "Long Text", helper: "Multi-line notes or descriptions" },
  { value: "number", label: "Number", helper: "Integers or decimals" },
  { value: "date", label: "Date", helper: "Calendar date selection" },
  { value: "time", label: "Time", helper: "Time selection (HH:MM)" },
  { value: "email", label: "Email", helper: "Email address with validation" },
  { value: "phone", label: "Phone", helper: "Phone number entry" },
  { value: "select", label: "Select", helper: "Dropdown with predefined options" },
  { value: "checkbox", label: "Checkbox", helper: "Boolean selection" }
];

interface FieldDesignerProps {
  fields: DataEntryField[];
  onAdd: (field: DataEntryField) => void;
  onUpdate: (fieldId: string, field: Partial<DataEntryField>) => void;
  onDelete: (fieldId: string) => void;
}

interface DraftField {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
  helpText: string;
  options: string;
}

const DEFAULT_DRAFT: DraftField = {
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  helpText: "",
  options: ""
};

function ensureUniqueKey(baseKey: string, existingKeys: string[]): string {
  if (!existingKeys.includes(baseKey)) {
    return baseKey;
  }

  let counter = 1;
  let candidate = `${baseKey}-${counter}`;
  while (existingKeys.includes(candidate)) {
    counter += 1;
    candidate = `${baseKey}-${counter}`;
  }

  return candidate;
}

export function FieldDesigner({ fields, onAdd, onUpdate, onDelete }: FieldDesignerProps) {
  const [draft, setDraft] = useState<DraftField>(DEFAULT_DRAFT);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const existingKeys = useMemo(() => fields.map((field) => field.key), [fields]);

  const canSubmit = draft.label.trim().length > 0;

  const handleAddField = () => {
    if (!canSubmit) {
      return;
    }

    const baseKey = createSlug(draft.label) || `field-${fields.length + 1}`;
    const key = ensureUniqueKey(baseKey, existingKeys);
    const options =
      draft.type === "select"
        ? draft.options
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined;

    const field: DataEntryField = {
      id: createId("field"),
      label: draft.label.trim(),
      key,
      type: draft.type,
      required: draft.required,
      placeholder: draft.placeholder.trim() || undefined,
      helpText: draft.helpText.trim() || undefined,
      options
    };

    onAdd(field);
    setDraft(DEFAULT_DRAFT);
  };

  const handleDeleteField = (fieldId: string) => {
    onDelete(fieldId);
    if (editingFieldId === fieldId) {
      setEditingFieldId(null);
    }
  };

  return (
    <section className="card p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Data Structure</h2>
          <p className="mt-1 text-sm text-slate-600">
            Define the fields for your dataset. Changes apply instantly to the entry form.
          </p>
        </div>
        <span className="badge">Fields: {fields.length}</span>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Field label
          <input
            value={draft.label}
            onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
            placeholder="e.g. Company name"
            className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Field type
          <select
            value={draft.type}
            onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as FieldType }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Placeholder
          <input
            value={draft.placeholder}
            onChange={(event) => setDraft((prev) => ({ ...prev, placeholder: event.target.value }))}
            placeholder="Optional helper text inside the field"
            className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Description
          <input
            value={draft.helpText}
            onChange={(event) => setDraft((prev) => ({ ...prev, helpText: event.target.value }))}
            placeholder="Optional helper text displayed below the field"
            className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        {draft.type === "select" && (
          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
            Options (comma separated)
            <input
              value={draft.options}
              onChange={(event) => setDraft((prev) => ({ ...prev, options: event.target.value }))}
              placeholder="e.g. Pending, In Progress, Completed"
              className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
            />
          </label>
        )}
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(event) => setDraft((prev) => ({ ...prev, required: event.target.checked }))}
            className="h-5 w-5 rounded border border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Required field
        </label>
        <div className="md:col-span-2 flex justify-end">
          <button type="button" className="btn" onClick={handleAddField} disabled={!canSubmit}>
            Add field
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-center text-sm text-slate-600">
            Add fields above to start collecting entries.
          </div>
        ) : (
          fields.map((field) => {
            const editMode = editingFieldId === field.id;
            const typeDefinition = FIELD_TYPES.find((item) => item.value === field.type);

            return (
              <div key={field.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-brand-300">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-semibold text-slate-900">{field.label}</p>
                      <span className="badge">{field.type}</span>
                      {field.required && <span className="badge bg-amber-100 text-amber-700">Required</span>}
                    </div>
                    <p className="text-sm text-slate-500">Key: <span className="font-mono text-slate-700">{field.key}</span></p>
                    {typeDefinition && <p className="text-xs text-slate-500">{typeDefinition.helper}</p>}
                    {field.helpText && <p className="mt-2 text-sm text-slate-600">{field.helpText}</p>}
                    {field.type === "select" && field.options?.length ? (
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                        Options: <span className="font-semibold text-slate-700">{field.options.join(", ")}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1 text-xs"
                      onClick={() => setEditingFieldId(editMode ? null : field.id)}
                    >
                      {editMode ? "Close" : "Edit"}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-transparent bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editMode && (
                  <FieldEditor
                    field={field}
                    onUpdate={(patch) => onUpdate(field.id, patch)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

interface FieldEditorProps {
  field: DataEntryField;
  onUpdate: (patch: Partial<DataEntryField>) => void;
}

function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const [localLabel, setLocalLabel] = useState(field.label);
  const [localPlaceholder, setLocalPlaceholder] = useState(field.placeholder ?? "");
  const [localHelpText, setLocalHelpText] = useState(field.helpText ?? "");
  const [localRequired, setLocalRequired] = useState(field.required);
  const [localOptions, setLocalOptions] = useState(field.options?.join(", ") ?? "");

  const handleSave = () => {
    onUpdate({
      label: localLabel.trim() || field.label,
      placeholder: localPlaceholder.trim() || undefined,
      helpText: localHelpText.trim() || undefined,
      required: localRequired,
      options:
        field.type === "select"
          ? localOptions
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean)
          : field.options
    });
  };

  return (
    <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Label
        <input
          value={localLabel}
          onChange={(event) => setLocalLabel(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
        />
      </label>
      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={localRequired}
          onChange={(event) => setLocalRequired(event.target.checked)}
          className="h-5 w-5 rounded border border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Required
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Placeholder
        <input
          value={localPlaceholder}
          onChange={(event) => setLocalPlaceholder(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Helper text
        <input
          value={localHelpText}
          onChange={(event) => setLocalHelpText(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
        />
      </label>
      {field.type === "select" && (
        <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
          Options (comma separated)
          <input
            value={localOptions}
            onChange={(event) => setLocalOptions(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base shadow-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
      )}
      <div className="md:col-span-2 flex justify-end gap-3">
        <button type="button" className="btn" onClick={handleSave}>
          Save changes
        </button>
      </div>
    </div>
  );
}
