"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinGroupByTrustCode, findGroupByTrustCode } from "@/services/groupService";
import { normalizeTrustCode, isValidTrustCode, formatTrustCode } from "@/utils/trustCode";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types/group";

export default function JoinGroup() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trustCode, setTrustCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewGroup, setPreviewGroup] = useState<Group | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Check if there's a join parameter in URL
  useEffect(() => {
    const joinParam = searchParams.get("join");
    if (joinParam) {
      const normalizedCode = normalizeTrustCode(joinParam);
      setTrustCode(normalizedCode);
      setShowJoinForm(true);
      // Optionally preview the group
      previewGroupByCode(normalizedCode);

      // Save to session storage for later use if user needs to sign up
      sessionStorage.setItem("pendingGroupJoin", normalizedCode);

      // Clear URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("join");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

  // Check for pending group join after login
  useEffect(() => {
    if (user) {
      const pendingCode = sessionStorage.getItem("pendingGroupJoin");
      if (pendingCode) {
        setTrustCode(pendingCode);
        setShowJoinForm(true);
        previewGroupByCode(pendingCode);
        // Don't clear it yet - wait until successful join
      }
    }
  }, [user]);

  const previewGroupByCode = async (code: string) => {
    if (!isValidTrustCode(code)) return;

    try {
      const group = await findGroupByTrustCode(code);
      setPreviewGroup(group);
      setError(null);
    } catch (error) {
      console.error("Error previewing group:", error);
      setPreviewGroup(null);
    }
  };

  const handleTrustCodeChange = (value: string) => {
    const normalized = normalizeTrustCode(value);
    setTrustCode(normalized);
    setError(null);

    // Preview group as user types
    if (normalized.length === 6) {
      previewGroupByCode(normalized);
    } else {
      setPreviewGroup(null);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      setError("Debes iniciar sesión para unirte a un grupo");
      return;
    }

    if (!isValidTrustCode(trustCode)) {
      setError("Código inválido. Debe tener 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const group = await joinGroupByTrustCode(trustCode, user.uid);

      // Clear pending join from session storage
      sessionStorage.removeItem("pendingGroupJoin");

      // Show success message
      alert(`¡Te has unido exitosamente al grupo "${group.name}"!`);

      // Redirect to the group
      router.push(`/group/${group.id}`);
    } catch (error: unknown) {
      console.error("Error joining group:", error);
      setError(error instanceof Error ? error.message : "Error al unirse al grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowJoinForm(false);
    setTrustCode("");
    setError(null);
    setPreviewGroup(null);
    sessionStorage.removeItem("pendingGroupJoin");
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Unirse a un Grupo</h3>
        <p className="text-blue-700">Inicia sesión para unirte a grupos usando un código de invitación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Unirse a un Grupo</h3>
        <button onClick={() => setShowJoinForm(!showJoinForm)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
          {showJoinForm ? "Cancelar" : "Unirse"}
        </button>
      </div>

      {showJoinForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label htmlFor="trustCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código del Grupo
            </label>
            <input
              type="text"
              id="trustCode"
              value={formatTrustCode(trustCode)}
              onChange={(e) => handleTrustCodeChange(e.target.value)}
              placeholder="Ej: ABC-123"
              maxLength={7} // 6 chars + 1 dash
              className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-center font-mono text-lg tracking-wider uppercase"
            />
            <p className="text-xs text-gray-500 mt-1">Introduce el código de 6 caracteres que te compartió el propietario del grupo</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">{error}</div>}

          {previewGroup && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="font-semibold text-blue-800">{previewGroup.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {previewGroup.categories.map((category) => (
                  <span key={category} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {category}
                  </span>
                ))}
              </div>
              <p className="text-sm text-blue-600 mt-1">{previewGroup.members.length} miembro(s)</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleJoinGroup} disabled={loading || !trustCode || !previewGroup} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? "Uniéndose..." : "Unirse al Grupo"}
            </button>
            <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
