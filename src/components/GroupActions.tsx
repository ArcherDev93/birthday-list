"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { addGroup } from "@/services/groupService";
import { joinGroupByTrustCode } from "@/services/groupService";
import { normalizeTrustCode, isValidTrustCode, formatTrustCode } from "@/utils/trustCode";

export default function GroupActions() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategories, setNewGroupCategories] = useState<string[]>(["general"]);
  const [availableCategories] = useState<string[]>(["general", "escuela", "trabajo", "familia", "amigos", "hobby", "deportes", "estudio"]);

  // Join Group Form State
  const [trustCode, setTrustCode] = useState("");

  // Check if there's a join parameter in URL
  const joinCode = searchParams.get("join");
  const hasPendingJoin = !!joinCode || !!sessionStorage.getItem("pendingJoinCode");

  // Initialize trust code from URL if present
  useEffect(() => {
    if (joinCode && isValidTrustCode(joinCode)) {
      setTrustCode(joinCode);
      setShowJoinForm(true);
    }
  }, [joinCode]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;

    setLoading(true);
    setError(null);

    try {
      const groupId = await addGroup(
        {
          name: newGroupName.trim(),
          categories: newGroupCategories,
        },
        user.uid
      );

      // Reset form
      setNewGroupName("");
      setNewGroupCategories(["general"]);
      setShowCreateForm(false);

      // Navigate to the new group
      router.push(`/group/${groupId}`);
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Error al crear el grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !trustCode) return;

    if (!isValidTrustCode(trustCode)) {
      setError("Código inválido. Debe tener 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const group = await joinGroupByTrustCode(trustCode, user.uid);

      // Reset form
      setTrustCode("");
      setShowJoinForm(false);

      // Show success and navigate
      alert(`¡Te has unido exitosamente al grupo "${group.name}"!`);
      router.push(`/group/${group.id}`);
    } catch (error: unknown) {
      console.error("Error joining group:", error);
      setError(error instanceof Error ? error.message : "Error al unirse al grupo");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setNewGroupCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  const handleTrustCodeChange = (value: string) => {
    const normalized = normalizeTrustCode(value);
    setTrustCode(normalized);
    setError(null);
  };

  if (!user) {
    if (hasPendingJoin) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-blue-600 mr-3 text-xl">🎉</span>
              <div>
                <h3 className="font-semibold">¡Te han invitado a un grupo!</h3>
                <p className="text-sm">Por favor, inicia sesión o regístrate para unirte automáticamente.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Special message for pending joins */}
      {hasPendingJoin && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl">
          <div className="flex items-center">
            <span className="text-green-600 mr-3 text-xl">🎯</span>
            <div>
              <h3 className="font-semibold">¡Procesando tu invitación!</h3>
              <p className="text-sm">El sistema está procesando automáticamente tu unión al grupo. Si no ocurre automáticamente, puedes usar el formulario de abajo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowJoinForm(false);
            setError(null);
          }}
          className="bg-blue-500 text-white px-6 py-4 rounded-xl hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg"
        >
          ➕ Crear Grupo
        </button>

        <button
          onClick={() => {
            setShowJoinForm(!showJoinForm);
            setShowCreateForm(false);
            setError(null);
          }}
          className="bg-green-500 text-white px-6 py-4 rounded-xl hover:bg-green-600 transition-colors font-medium text-lg shadow-lg"
        >
          🔗 Unirse a Grupo
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Grupo</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label htmlFor="groupName" className="block text-sm font-bold text-gray-700 mb-2">
                👥 Nombre del Grupo
              </label>
              <input type="text" id="groupName" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Familia García, Clase 5A, Oficina..." required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ Categorías (selecciona una o más)</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => (
                  <button key={category} type="button" onClick={() => toggleCategory(category)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newGroupCategories.includes(category) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading || !newGroupName.trim()} className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? "Creando..." : "✅ Crear Grupo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroupName("");
                  setNewGroupCategories(["general"]);
                  setError(null);
                }}
                className="px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Join Group Form */}
      {showJoinForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Unirse a un Grupo</h3>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div>
              <label htmlFor="trustCode" className="block text-sm font-bold text-gray-700 mb-2">
                🔑 Código del Grupo
              </label>
              <input
                type="text"
                id="trustCode"
                value={formatTrustCode(trustCode)}
                onChange={(e) => handleTrustCodeChange(e.target.value)}
                placeholder="Ej: ABC-123"
                maxLength={7} // 6 chars + 1 dash
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center font-mono text-lg tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Introduce el código de 6 caracteres que te compartió el propietario del grupo</p>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading || !trustCode} className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? "Uniéndose..." : "✅ Unirse"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setTrustCode("");
                  setError(null);
                }}
                className="px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
