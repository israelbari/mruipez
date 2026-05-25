import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { Trash2, Mail, MailOpen, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMessages() {
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.contact.list.useQuery();
  const [expanded, setExpanded] = useState<number | null>(null);

  const markReadMutation = trpc.contact.markRead.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate();
    },
    onError: (err) => {
      toast.error('Error al marcar como leído: ' + err.message);
    },
  });

  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      toast.success('Mensaje eliminado');
      utils.contact.list.invalidate();
    },
    onError: (err) => {
      toast.error('Error al eliminar: ' + err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const list = messages ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-text-primary text-3xl">Mensajes de Contacto</h1>
        <span className="text-sm text-text-muted">{list.length} mensajes</span>
      </div>

      {list.length === 0 ? (
        <div className="bg-bg-secondary border border-border-custom rounded-lg p-12 text-center">
          <Mail size={32} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Aún no hay mensajes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((msg) => {
            const isExpanded = expanded === msg.id;
            return (
              <div key={msg.id} className={`bg-bg-secondary border rounded-lg transition-colors ${msg.read ? 'border-border-custom' : 'border-accent/30'}`}>
                <div
                  className="px-6 py-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => {
                    setExpanded(isExpanded ? null : msg.id);
                    if (!msg.read) markReadMutation.mutate({ id: msg.id });
                  }}
                >
                  {msg.read ? (
                    <MailOpen size={18} className="text-text-muted shrink-0" />
                  ) : (
                    <Mail size={18} className="text-accent shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-text-primary font-medium text-sm">{msg.name}</span>
                      <span className="text-text-muted text-xs">{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">{msg.projectType}</span>
                      <span className="text-xs text-text-muted">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Eye size={16} className={`transition-colors ${isExpanded ? 'text-accent' : 'text-text-muted'}`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Eliminar este mensaje?')) {
                          deleteMutation.mutate({ id: msg.id });
                        }
                      }}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors rounded hover:bg-bg-tertiary"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-4 pt-2 border-t border-border-custom">
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
