import { Client } from "../dashboard/types";
export type CourseWithRelations = {
  id: number;
  name: string;
  dose_per_admin?: number | null;
  admins_per_day?: number | null;
  packs_on_hand?: number | null;
  pack_size?: number | null;
  loose_units?: number | null;
  client?: Client | null;
};

export type MedicationCourse = {
  id: number;
  client_id: number;
  name: string;
  strength?: string | null;
  form?: string | null;
  dose_per_admin?: number | null;
  admins_per_day?: number | null;
  daily_use: number;
  pack_size: number;
  packs_on_hand: number;
  loose_units?: number | null;
  opening_units?: number | null;
  start_date: string;
  half_date?: string | null;
  runout_date?: string | null;
  status?: string | null;
};
