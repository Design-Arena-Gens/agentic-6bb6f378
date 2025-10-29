'use client';

import { useMemo } from "react";
import type { DataEntryField, RowEntry } from "@/types";
import { clsx } from "clsx";

interface EntriesTableProps {
  fields: DataEntryField[];
  entries: RowEntry[];
  filterText: string;
  onFilterChange: (value: string) => void;
  onEdit: (entry: RowEntry) => void;
  onDelete: (entry: RowEntry) => void;
  onDuplicate: (entry: RowEntry) => void;
}

export function EntriesTable({
  fields,
  entries,
  filterText,
  onFilterChange,
  onEdit,
  onDelete,
  onDuplicate
}: EntriesTableProps) {
  const filteredEntries = useMemo(() => {
    const clone = [...entries].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    if (!filterText.trim()) {
      return clone;
    }

    const lookup = filterText.trim().toLowerCase();
    return clone.filter((entry) => {
        const baseMatch =
          entry.id.toLowerCase().includes(lookup) ||
          entry.createdAt.toLowerCase().includes(lookup) ||
          entry.updatedAt.toLowerCase().includes(lookup);

        if (baseMatch) {
          return true;
        }

        return fields.some((field) => {
          const value = entry.values[field.key];
          return value !== undefined && value !== null && String(value).toLowerCase().includes(lookup);
        });
      });
  }, [entries, fields, filterText]);

  return (
    <section className="card p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Captured entries</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review, edit, or export the structured records you&apos;ve created.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={filterText}
            onChange={(event) => onFilterChange(event.target.value)}
            placeholder="Search entries…"
            className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
          />
          <span className="badge bg-slate-200 text-slate-700">
            {filteredEntries.length} of {entries.length}
          </span>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-center text-sm text-slate-600">
          No entries yet. Use the form above to start collecting data.
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-6 py-8 text-center text-sm text-slate-600">
          No entries match your search.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-left font-semibold text-slate-700">ID</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-left font-semibold text-slate-700">Created</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-left font-semibold text-slate-700">Updated</th>
                {fields.map((field) => (
                  <th key={field.id} scope="col" className="px-3 py-3 text-left font-semibold text-slate-700">
                    {field.label}
                  </th>
                ))}
                <th scope="col" className="px-3 py-3 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="max-w-[180px] truncate px-3 py-3 font-mono text-xs text-slate-500">{entry.id}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{formatDisplayDate(entry.createdAt)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{formatDisplayDate(entry.updatedAt)}</td>
                  {fields.map((field) => {
                    const value = entry.values[field.key];
                    return (
                      <td key={field.id} className="px-3 py-3 text-sm text-slate-700">
                        <CellValue fieldType={field.type} value={value} />
                      </td>
                    );
                  })}
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-transparent bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                        onClick={() => onDuplicate(entry)}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-transparent bg-brand-600 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                        onClick={() => onEdit(entry)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-transparent bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        onClick={() => onDelete(entry)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CellValue({ fieldType, value }: { fieldType: DataEntryField["type"]; value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  if (fieldType === "checkbox") {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold",
          value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
        )}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {value ? "Yes" : "No"}
      </span>
    );
  }

  return <span className="block max-w-[280px] text-pretty">{String(value)}</span>;
}

function formatDisplayDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
