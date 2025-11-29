export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string | null;   // 👈 add this
  updated_at: string | null;   // 👈 optional but recommended
};
