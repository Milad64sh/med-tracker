import { useQuery, UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import type { Service } from "./types";

export type ShowServiceResponse = { data: Service };
type ServicesWrapped = { data: Service[] };     // if your backend wraps
type ServicesResponse = Service[] | ServicesWrapped | null | undefined;
const KEY = ["services"];

function isServiceArray(x: unknown): x is Service[] {
  return Array.isArray(x) && x.every(i => i && typeof i === "object" && "id" in i && "name" in i);
}
function isWrapped(x: unknown): x is ServicesWrapped {
  return !!x && typeof x === "object" && Array.isArray((x as any).data);
}

export function useServices(): UseQueryResult<Service[], Error> {
  return useQuery<Service[], Error>({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetcher<ServicesResponse>("/api/services");
      if (isServiceArray(res)) return res;
      if (isWrapped(res)) return res.data;
      return []; // fallback
    },
    initialData: [], // guarantees .data is Service[] immediately
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await fetcher(`/api/services/${id}`, { method: "DELETE" });
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<Service[]>(KEY);
      if (prev) {
        qc.setQueryData<Service[]>(KEY, prev.filter(s => s.id !== id));
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
  
}
export async function getService(id: string) {
  return fetcher<ShowServiceResponse>(`/api/services/${id}`);
}

