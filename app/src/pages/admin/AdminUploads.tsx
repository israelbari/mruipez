import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

export default function AdminUploads() {
  const utils = trpc.useUtils();
  const { data: uploads, isLoading } = trpc.upload.list.useQuery();

  const approveMutation = trpc.upload.approve.useMutation({
    onSuccess: () => {
      toast.success("Upload actualizado");
      utils.upload.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al actualizar upload");
    },
  });

  const setPublicMutation = trpc.upload.setPublic.useMutation({
    onSuccess: () => {
      toast.success("Visibilidad actualizada");
      utils.upload.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al actualizar visibilidad");
    },
  });

  if (isLoading) {
    return <div className="text-text-secondary">Cargando...</div>;
  }

  const pendingCount = uploads?.filter((u) => u.status === "pending").length ?? 0;
  const approvedCount = uploads?.filter((u) => u.status === "approved").length ?? 0;
  const rejectedCount = uploads?.filter((u) => u.status === "rejected").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light text-text-primary">Gestión de Uploads</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3">
          <Upload size={20} className="text-amber-500" />
          <div>
            <p className="text-lg font-light text-text-primary">{pendingCount}</p>
            <p className="text-sm text-text-secondary">Pendientes</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-500" />
          <div>
            <p className="text-lg font-light text-text-primary">{approvedCount}</p>
            <p className="text-sm text-text-secondary">Aprobados</p>
          </div>
        </div>
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-red-500" />
          <div>
            <p className="text-lg font-light text-text-primary">{rejectedCount}</p>
            <p className="text-sm text-text-secondary">Rechazados</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-custom">
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Archivo</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Cliente</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Proyecto</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Estado</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Público</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {uploads && uploads.length > 0 ? (
              uploads.map((upload) => (
                <tr key={upload.id} className="border-b border-border-custom last:border-0">
                  <td className="px-6 py-4 text-sm text-text-primary">{upload.filename}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{upload.userId}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{upload.projectId}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      upload.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      upload.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {upload.status === 'pending' && <Upload size={10} />}
                      {upload.status === 'approved' && <CheckCircle size={10} />}
                      {upload.status === 'rejected' && <XCircle size={10} />}
                      {upload.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        if (upload.isPublic && !confirm("Solo el superadmin puede quitar el estado público. ¿Continuar?")) return;
                        setPublicMutation.mutate({ id: upload.id, isPublic: !upload.isPublic });
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        upload.isPublic
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-text-muted hover:bg-bg-tertiary'
                      }`}
                      title={upload.isPublic ? 'Quitar público' : 'Hacer público'}
                    >
                      {upload.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {upload.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => approveMutation.mutate({ id: upload.id, status: 'approved' })}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Motivo del rechazo:');
                              if (reason !== null) {
                                approveMutation.mutate({ id: upload.id, status: 'rejected', rejectionReason: reason });
                              }
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                  <Upload size={24} className="mx-auto mb-2 opacity-50" />
                  <p>No hay uploads registrados</p>
                  <p className="text-sm mt-1">Los clientes podrán subir archivos desde su panel.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
