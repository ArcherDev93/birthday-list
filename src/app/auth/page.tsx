"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-600">Cargando...</h3>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <AuthForm onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}
