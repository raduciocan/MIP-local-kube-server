import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Axios instance - use MIP_BACKEND_URL if set, otherwise relative paths.
 * Prefer runtime-injected config (mounted by K8s ConfigMap into `dist/runtime-config.js`),
 * then fallback to build-time Vite env var.
 */
const runtimeBase =
  (typeof window !== "undefined" &&
    window.__RUNTIME_CONFIG__ &&
    window.__RUNTIME_CONFIG__.MIP_BACKEND_URL) ||
  (typeof window !== "undefined" && window.MIP_BACKEND_URL) ||
  import.meta.env.MIP_BACKEND_URL ||
  "";

const api = axios.create({
  baseURL: runtimeBase,
  headers: { "Content-Type": "application/json" },
});

/* Queries */
export function useNotes(options = {}) {
  return useQuery({
    queryKey: ["notes"],
    queryFn: () => api.get("/list").then((res) => res.data),
    ...options,
  });
}

/* Mutations */
export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post("/create", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.put(`/update/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/delete/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}
