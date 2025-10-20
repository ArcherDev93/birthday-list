"use client";

import { useState } from "react";
import { Group } from "@/types/group";
import { regenerateTrustCode } from "@/services/groupService";
import { formatTrustCode } from "@/utils/trustCode";
import { useAuth } from "@/contexts/AuthContext";

interface ShareGroupProps {
  group: Group;
  onTrustCodeUpdate: (newTrustCode: string) => void;
}

export default function ShareGroup({ group, onTrustCodeUpdate }: ShareGroupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.uid === group.userId;
  const shareUrl = `${window.location.origin}?join=${group.trustCode}`;

  const handleRegenerateTrustCode = async () => {
    if (!user || !isOwner) return;

    if (!confirm("¿Estás seguro de que quieres generar un nuevo código? El código anterior dejará de funcionar.")) {
      return;
    }

    setLoading(true);
    try {
      const newTrustCode = await regenerateTrustCode(group.id, user.uid);
      onTrustCodeUpdate(newTrustCode);
      alert("Nuevo código generado exitosamente");
    } catch (error) {
      console.error("Error regenerating trust code:", error);
      alert("Error al generar nuevo código");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Únete a ${group.name}`,
          text: `Te invito a unirte al grupo "${group.name}". Usa el código: ${formatTrustCode(group.trustCode)}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copy link
      copyToClipboard(shareUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Compartir Grupo</h3>
        <button onClick={() => setShowShareDialog(!showShareDialog)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          {showShareDialog ? "Ocultar" : "Compartir"}
        </button>
      </div>

      {showShareDialog && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Trust Code Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código del Grupo</label>
            <div className="flex items-center space-x-2">
              <div className="bg-white border border-gray-300 rounded-md px-3 py-2 font-mono text-lg tracking-wider">{formatTrustCode(group.trustCode)}</div>
              <button onClick={() => copyToClipboard(group.trustCode)} className={`px-3 py-2 rounded-md text-sm font-medium ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-colors`}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Share URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enlace de Invitación</label>
            <div className="flex items-center space-x-2">
              <input type="text" value={shareUrl} readOnly className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <button onClick={() => copyToClipboard(shareUrl)} className={`px-3 py-2 rounded-md text-sm font-medium ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} transition-colors`}>
                {copied ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Share Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={shareViaWebShare} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              📱 Compartir
            </button>

            {isOwner && (
              <button onClick={handleRegenerateTrustCode} disabled={loading} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
                {loading ? "Generando..." : "🔄 Nuevo Código"}
              </button>
            )}
          </div>

          {/* Group Info */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              <strong>Miembros:</strong> {group.members.length}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Propietario:</strong> {isOwner ? "Tú" : "Otro usuario"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
