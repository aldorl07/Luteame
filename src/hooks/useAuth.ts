"use client";
import { useAuthContext } from "@/context/AuthContext";
export { useAuthContext as useAuth };

export function useUser() {
  const { user, loading, isAdmin } = useAuthContext();
  return { user, loading, isAdmin };
}
