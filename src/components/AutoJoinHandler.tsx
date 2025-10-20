"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { joinGroupByTrustCode, findGroupByTrustCode } from "@/services/groupService";
import { isValidTrustCode } from "@/utils/trustCode";

export default function AutoJoinHandler() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAutoJoin = async () => {
      // Don't process if still loading auth or already processing
      if (authLoading || processing) return;

      const joinCode = searchParams.get("join");
      if (!joinCode) return;

      // Validate the trust code
      if (!isValidTrustCode(joinCode)) {
        setError("Código de invitación inválido");
        return;
      }

      setProcessing(true);
      setError(null);
      setMessage("Procesando invitación...");

      try {
        // First, check if the group exists
        const group = await findGroupByTrustCode(joinCode);
        if (!group) {
          setError("No se encontró el grupo con este código");
          return;
        }

        if (!user) {
          // Store the trust code in sessionStorage for after login
          sessionStorage.setItem("pendingJoinCode", joinCode);
          setMessage(`Encontramos la invitación al grupo "${group.name}". Por favor, inicia sesión o regístrate para unirte.`);
          return;
        }

        // Check if user is already a member
        if (group.members?.includes(user.uid)) {
          setMessage(`Ya eres miembro del grupo "${group.name}". Te redirigiremos...`);
          setTimeout(() => {
            router.push(`/group/${group.id}`);
          }, 2000);
          return;
        }

        // Join the group
        await joinGroupByTrustCode(joinCode, user.uid);
        setMessage(`¡Te has unido exitosamente al grupo "${group.name}"! Te redirigiremos...`);

        // Clean up URL and redirect
        const url = new URL(window.location.href);
        url.searchParams.delete("join");
        window.history.replaceState({}, "", url.toString());

        setTimeout(() => {
          router.push(`/group/${group.id}`);
        }, 2000);
      } catch (error: unknown) {
        console.error("Error in auto-join:", error);
        setError(error instanceof Error ? error.message : "Error al procesar la invitación");
      } finally {
        setProcessing(false);
      }
    };

    handleAutoJoin();
  }, [user, authLoading, searchParams, router, processing]);

  // Handle pending join after successful login
  useEffect(() => {
    const handlePendingJoin = async () => {
      if (!user || authLoading) return;

      const pendingCode = sessionStorage.getItem("pendingJoinCode");
      if (!pendingCode) return;

      // Clear the pending code immediately to prevent loops
      sessionStorage.removeItem("pendingJoinCode");

      setProcessing(true);
      setError(null);
      setMessage("Completando tu invitación...");

      try {
        const group = await joinGroupByTrustCode(pendingCode, user.uid);
        setMessage(`¡Te has unido exitosamente al grupo "${group.name}"! Te redirigiremos...`);

        setTimeout(() => {
          router.push(`/group/${group.id}`);
        }, 2000);
      } catch (error: unknown) {
        console.error("Error in pending join:", error);
        setError(error instanceof Error ? error.message : "Error al completar la invitación");
      } finally {
        setProcessing(false);
      }
    };

    handlePendingJoin();
  }, [user, authLoading, router]);

  // Don't render anything if there's no join parameter and no message
  if (!searchParams.get("join") && !message && !error && !sessionStorage.getItem("pendingJoinCode")) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      {processing && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="font-medium">Procesando invitación...</span>
          </div>
        </div>
      )}

      {message && !processing && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {error && !processing && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                setMessage(null);
                // Clean up URL
                const url = new URL(window.location.href);
                url.searchParams.delete("join");
                window.history.replaceState({}, "", url.toString());
              }}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
