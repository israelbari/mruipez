import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { LogIn, Shield, ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.step === "2fa") {
        setStep("2fa");
        toast.info("Ingresa el código de verificación (revisa la consola del servidor)");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Error al iniciar sesión");
      setLoading(false);
    },
  });

  const verifyMutation = trpc.auth.verify2FA.useMutation({
    onSuccess: () => {
      toast.success("Sesión iniciada correctamente");
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Código inválido");
      setLoading(false);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loginMutation.mutate({ email, password });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    verifyMutation.mutate({ email, code });
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 mb-4">
            {step === "credentials" ? <LogIn size={24} /> : <Shield size={24} />}
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight">
            {step === "credentials" ? "Iniciar Sesión" : "Verificación en Dos Pasos"}
          </h1>
          <p className="text-stone-400 mt-2 text-sm">
            {step === "credentials"
              ? "Ingresa tus credenciales para acceder"
              : `Ingresa el código enviado a ${email}`}
          </p>
        </div>

        {step === "credentials" ? (
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
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-stone-300">Código de 6 dígitos</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 text-center text-2xl tracking-[0.5em]"
                maxLength={6}
                required
              />
              <p className="text-xs text-stone-500 text-center">
                El código expira en 10 minutos
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verificando..." : "Verificar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-stone-400 hover:text-white"
              onClick={() => setStep("credentials")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
