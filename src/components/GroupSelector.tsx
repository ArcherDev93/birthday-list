"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Group } from "@/types/group";
import { subscribeToGroups } from "@/services/groupService";
import { formatSafeDate } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import GradientText from "@/components/GradientText";
import ShareGroup from "@/components/ShareGroup";

export default function GroupSelector() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to handle trust code updates from ShareGroup component
  const handleTrustCodeUpdate = (groupId: string, newTrustCode: string) => {
    setGroups((prevGroups) => prevGroups.map((group) => (group.id === groupId ? { ...group, trustCode: newTrustCode } : group)));
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToGroups(
      user.uid,
      (groupList: Group[]) => {
        setGroups(groupList);
        setLoading(false);
        setError(null); // Clear any previous errors when data loads successfully
      },
      (error: Error) => {
        console.error("Error loading groups:", error);
        // Only show error if it's not about empty results
        if (error.message.includes("permission") || error.message.includes("index")) {
          setError(`Database error: ${error.message}`);
        } else {
          setError(null); // Don't show error for empty collections
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleGroupSelect = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando grupos...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold mb-2">
          👥 Mis Grupos
        </GradientText>
        <p className="text-gray-600">Selecciona un grupo para ver los eventos y celebraciones</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-200">
              <div onClick={() => handleGroupSelect(group.id)} className="text-center cursor-pointer group mb-4">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">👥</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{group.name}</h3>
                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {group.categories.map((category) => (
                    <span key={category} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {group.members.length} miembro{group.members.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">Creado el {formatSafeDate(group.createdAt)}</p>
              </div>

              {/* Share Group Component */}
              <ShareGroup group={group} onTrustCodeUpdate={(newTrustCode) => handleTrustCodeUpdate(group.id, newTrustCode)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <GradientText as="h3" className="text-xl font-semibold mb-2">
            ¡No tienes grupos aún!
          </GradientText>
          <p className="text-gray-500 mb-4">Ve a tu perfil para crear un grupo o unirte a uno existente.</p>
          <button onClick={() => router.push("/profile")} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium">
            ➕ Ir al Perfil
          </button>
        </div>
      )}
    </div>
  );
}
