"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import GroupEventList from "@/components/GroupEventList";

interface GroupPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default function GroupPage({ params }: GroupPageProps) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Resolve the params promise
    params.then(({ groupId: id }) => {
      setGroupId(id);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading || !groupId) {
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
      <div className="px-2 py-6">
        <GroupEventList groupId={groupId} />
      </div>
    </div>
  );
}
