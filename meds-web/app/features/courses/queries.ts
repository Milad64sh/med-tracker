import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/api";
import type { Client } from "../dashboard/types";
import { MedicationCourse } from "./types";
export type CourseWithRelations = MedicationCourse & {
  client?: Client | null;
};

const COURSES_KEY = ["courses"];

/**
 * Fetch all medication courses.
 * Backend endpoint: GET /api/courses
 */
async function getCourses(): Promise<CourseWithRelations[]> {
  return await fetcher("/api/courses");
}

/**
 * Delete a course by id.
 * Backend endpoint: DELETE /api/courses/:id
 */
async function deleteCourse(id: number): Promise<void> {
  await fetcher(`/api/courses/${id}`, { method: "DELETE" });
}

/**
 * List of medication courses (for the Medications tab).
 */
export function useCourses() {
  return useQuery({
    queryKey: COURSES_KEY,
    queryFn: getCourses,
  });
}

/**
 * Delete mutation for a course.
 * Used in the Medications tab card "Delete" button.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCourse(id),
    onSuccess: () => {
      // Refresh the list after deleting
      queryClient.invalidateQueries({ queryKey: COURSES_KEY });
    },
  });
}

/**
 * Optional: fetch single course by id (for edit screen)
 * Usage: const { data, isLoading } = useCourse(id);
 */
export function useCourse(id?: number) {
  const hasValidId = typeof id === "number" && Number.isFinite(id) && id > 0;

  return useQuery({
    queryKey: [...COURSES_KEY, id],
    queryFn: () => fetcher(`/api/courses/${id}`),
    enabled: hasValidId,
  });
}
