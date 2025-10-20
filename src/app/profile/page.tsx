"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import UserProfile from "@/components/UserProfile";
import GroupActions from "@/components/GroupActions";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-600">Cargando...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light">
      <Navigation />
      <div className="px-4 py-8 space-y-8">
        <UserProfile />

        {/* Group Management Actions */}
        <div className="bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Gestión de Grupos</h2>
          <GroupActions />
        </div>
      </div>
    </div>
  );
}
