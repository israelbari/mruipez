import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Sesión iniciada correctamente");
      // Redirect based on role
      const roles = data.user?.roles.map((r) => r.role) ?? [];
      if (roles.includes("superadmin") || roles.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/client");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Error al iniciar sesión");
      setLoading(false);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 mb-4">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-stone-400 mt-2 text-sm">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-300">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
