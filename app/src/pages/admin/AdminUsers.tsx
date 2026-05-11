import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Key, UserCheck, UserX, Power } from "lucide-react";

export default function AdminUsers() {
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.auth.listUsers.useQuery();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Usuario creado exitosamente");
      setShowCreate(false);
      setEmail("");
      setPassword("");
      setName("");
      utils.auth.listUsers.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al crear usuario");
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(`Contraseña temporal: ${data.tempPassword}`);
    },
    onError: (err) => {
      toast.error(err.message || "Error al resetear contraseña");
    },
  });

  const updateUserMutation = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuario actualizado");
      utils.auth.listUsers.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al actualizar usuario");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, name: name || undefined, role });
  };

  if (isLoading) {
    return <div className="text-text-secondary">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-text-primary">Gestión de Usuarios</h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-bg-secondary border border-border-custom rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-text-primary">Crear Usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-text-secondary">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg-primary border-border-custom text-text-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-bg-primary border-border-custom text-text-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg-primary border-border-custom text-text-primary"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary">Rol</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "client")}
                className="w-full h-10 px-3 rounded-md bg-bg-primary border border-border-custom text-text-primary"
              >
                <option value="client">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-white" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creando..." : "Crear Usuario"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">ID</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Nombre</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Rol</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Estado</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-border-custom last:border-0">
                <td className="px-6 py-4 text-sm text-text-primary">{user.id}</td>
                <td className="px-6 py-4 text-sm text-text-primary">{user.name}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.roles[0]?.role === 'superadmin' ? 'bg-purple-500/10 text-purple-400' :
                    user.roles[0]?.role === 'admin' ? 'bg-accent/10 text-accent' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {user.roles[0]?.role === 'superadmin' && <UserCheck size={12} />}
                    {user.roles[0]?.role || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    user.isActive ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {user.isActive ? <Power size={12} /> : <UserX size={12} />}
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm('¿Generar nueva contraseña temporal?')) {
                          resetPasswordMutation.mutate({ userId: user.id });
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-accent transition-colors"
                      title="Resetear contraseña"
                    >
                      <Key size={14} />
                    </button>
                    <button
                      onClick={() => {
                        updateUserMutation.mutate({
                          id: user.id,
                          isActive: !user.isActive,
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-red-400 transition-colors"
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
