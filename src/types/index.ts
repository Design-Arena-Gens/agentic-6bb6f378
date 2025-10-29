export type FieldType = "text" | "number" | "date" | "time" | "email" | "phone" | "textarea" | "select" | "checkbox";

export interface DataEntryField {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export type EntryValues = Record<string, string | number | boolean | null>;

export interface RowEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  values: EntryValues;
}
