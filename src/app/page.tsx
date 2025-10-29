'use client';

import { useMemo, useState } from "react";
import { FieldDesigner } from "@/components/FieldDesigner";
import { EntryForm } from "@/components/EntryForm";
import { EntriesTable } from "@/components/EntriesTable";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { downloadCsv } from "@/lib/csv";
import { createId } from "@/lib/id";
import type { DataEntryField, EntryValues, RowEntry } from "@/types";

const DEFAULT_FIELDS: DataEntryField[] = [
  {
    id: "field-company",
    label: "Company",
    key: "company",
    type: "text",
    required: true,
    placeholder: "Acme Incorporated",
    helpText: "Company or organization associated with this record."
  },
  {
    id: "field-contact",
    label: "Primary contact",
    key: "primary-contact",
    type: "text",
    required: true,
    placeholder: "Jane Doe",
    helpText: "Full name of the main point of contact."
  },
  {
    id: "field-email",
    label: "Email address",
    key: "email",
    type: "email",
    required: true,
    placeholder: "jane@example.com"
  },
  {
    id: "field-status",
    label: "Status",
    key: "status",
    type: "select",
    required: true,
    options: ["New", "In Review", "Approved", "Archived"],
    helpText: "Track the current state of this record."
  },
  {
    id: "field-notes",
    label: "Notes",
    key: "notes",
    type: "textarea",
    required: false,
    placeholder: "Add context, blockers, next steps…"
  }
];

export default function Page() {
  const [fields, setFields, fieldsHydrated] = useLocalStorage<DataEntryField[]>(
    "data-entry-tool-fields",
    DEFAULT_FIELDS
  );
  const [entries, setEntries, entriesHydrated] = useLocalStorage<RowEntry[]>("data-entry-tool-entries", []);
  const hydrated = fieldsHydrated && entriesHydrated;

  const [filterText, setFilterText] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const editingEntry = useMemo(
    () => entries.find((entry) => entry.id === editingEntryId) ?? null,
    [editingEntryId, entries]
  );

  const sortedFields = useMemo(() => fields, [fields]);

  const handleAddField = (field: DataEntryField) => {
    setFields((previous) => [...previous, field]);
  };

  const handleUpdateField = (fieldId: string, patch: Partial<DataEntryField>) => {
    setFields((previousFields) => {
      const target = previousFields.find((field) => field.id === fieldId);
      if (!target) {
        return previousFields;
      }

      if (patch.key && patch.key !== target.key) {
        setEntries((previousEntries) =>
          previousEntries.map((entry) => {
            const { [target.key]: oldValue, ...rest } = entry.values;
            return {
              ...entry,
              values: {
                ...rest,
                [patch.key as string]: oldValue ?? ""
              }
            };
          })
        );
      }

      return previousFields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field));
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((previousFields) => {
      const fieldToDelete = previousFields.find((item) => item.id === fieldId);
      if (!fieldToDelete) {
        return previousFields;
      }

      setEntries((previousEntries) =>
        previousEntries.map((entry) => {
          const nextValues = { ...entry.values };
          delete nextValues[fieldToDelete.key];
          return {
            ...entry,
            values: nextValues
          };
        })
      );

      return previousFields.filter((item) => item.id !== fieldId);
    });
  };

  const handleCreateEntry = (values: EntryValues) => {
    const now = new Date().toISOString();
    const entry: RowEntry = {
      id: createId("entry"),
      createdAt: now,
      updatedAt: now,
      values
    };

    setEntries((previous) => [entry, ...previous]);
    setEditingEntryId(null);
  };

  const handleUpdateEntry = (values: EntryValues) => {
    if (!editingEntry) {
      return;
    }

    const now = new Date().toISOString();
    setEntries((previous) =>
      previous.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              updatedAt: now,
              values
            }
          : entry
      )
    );
    setEditingEntryId(null);
  };

  const handleSubmitEntry = (values: EntryValues) => {
    if (editingEntry) {
      handleUpdateEntry(values);
    } else {
      handleCreateEntry(values);
    }
  };

  const handleDeleteEntry = (entry: RowEntry) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Delete this entry? This action cannot be undone.");
      if (!confirmed) {
        return;
      }
    }
    setEntries((previous) => previous.filter((item) => item.id !== entry.id));
    if (editingEntryId === entry.id) {
      setEditingEntryId(null);
    }
  };

  const handleDuplicateEntry = (entry: RowEntry) => {
    const now = new Date().toISOString();
    const copy: RowEntry = {
      id: createId("entry"),
      createdAt: now,
      updatedAt: now,
      values: { ...entry.values }
    };
    setEntries((previous) => [copy, ...previous]);
  };

  const handleExportCsv = () => {
    if (entries.length === 0) {
      return;
    }
    downloadCsv(sortedFields, entries, "data-entries");
  };

  const handleClearEntries = () => {
    if (entries.length === 0) {
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Clear all entries? This action will permanently remove stored data.");
      if (!confirmed) {
        return;
      }
    }

    setEntries(() => []);
    setEditingEntryId(null);
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-12 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-600">Preparing your workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-6 lg:py-14">
      <header className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 px-8 py-10 text-white shadow-lg">
        <p className="text-sm uppercase tracking-wide text-brand-100">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Data Entry Control Center</h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-100 md:text-base">
          Configure streamlined data collection workflows, capture structured records, and keep everything organized in one place. Everything you enter remains on this device by default.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary bg-white text-brand-700 hover:bg-brand-100" onClick={handleExportCsv} disabled={entries.length === 0}>
            Export CSV
          </button>
          <button
            type="button"
            className="rounded-lg border border-transparent bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:opacity-50"
            onClick={handleClearEntries}
            disabled={entries.length === 0}
          >
            Clear entries
          </button>
          <span className="badge bg-white text-brand-700">
            Stored entries: {entries.length}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FieldDesigner fields={sortedFields} onAdd={handleAddField} onUpdate={handleUpdateField} onDelete={handleDeleteField} />
        <EntryForm
          fields={sortedFields}
          onSubmit={handleSubmitEntry}
          onCancelEdit={() => setEditingEntryId(null)}
          initialValues={editingEntry?.values ?? null}
          isEditing={Boolean(editingEntry)}
        />
      </div>

      <EntriesTable
        fields={sortedFields}
        entries={entries}
        filterText={filterText}
        onFilterChange={setFilterText}
        onEdit={(entry) => setEditingEntryId(entry.id)}
        onDelete={handleDeleteEntry}
        onDuplicate={handleDuplicateEntry}
      />
    </main>
  );
}
