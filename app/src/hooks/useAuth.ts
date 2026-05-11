import { trpc } from "@/providers/trpc";

export function useAuth() {
  const { data, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/login";
    },
  });

  const user = data?.user ?? null;
  const roles = user?.roles.map((r) => r.role) ?? [];
  const isSuperadmin = roles.includes("superadmin");
  const isAdmin = isSuperadmin || roles.includes("admin");
  const isClient = roles.includes("client");

  return {
    user,
    isLoading,
    roles,
    isSuperadmin,
    isAdmin,
    isClient,
    isAuthenticated: !!user,
    logout: () => logoutMutation.mutate(),
  };
}
