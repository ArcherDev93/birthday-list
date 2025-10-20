"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser, updateUserDisplayName, updateUserProfile } from "@/services/authService";
import GradientText from "@/components/GradientText";

export default function UserProfile() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await signOutUser();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateUserDisplayName(displayName);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Perfil actualizado correctamente");
        await refreshProfile();
        setIsEditing(false);
      }
    } catch (error) {
      setError("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const newNotificationsSetting = !userProfile.preferences?.notifications;
      const result = await updateUserProfile(userProfile.uid, {
        preferences: {
          ...userProfile.preferences,
          notifications: newNotificationsSetting,
        },
      });

      if (!result.error) {
        await refreshProfile();
        setSuccess(`Notificaciones ${newNotificationsSetting ? "activadas" : "desactivadas"}`);
      }
    } catch (error) {
      setError("Error al actualizar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-600">Cargando perfil...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold mb-2">
          👤 Mi Perfil
        </GradientText>
        <p className="text-gray-600">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Success/Error Messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-white to-purple-50/30 p-8 rounded-2xl shadow-xl border border-purple-200/50 backdrop-blur-sm">
        <div className="flex items-center space-x-6 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userProfile.photoURL ? <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : userProfile.displayName?.charAt(0)?.toUpperCase() || userProfile.email?.charAt(0)?.toUpperCase() || "👤"}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(userProfile.displayName || "");
                      setError("");
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800">{userProfile.displayName || "Usuario"}</h2>
                <p className="text-gray-600">{userProfile.email}</p>
                <button onClick={() => setIsEditing(true)} className="text-purple-600 hover:text-purple-800 text-sm mt-1">
                  ✏️ Editar nombre
                </button>
              </>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-1">Miembro desde</h3>
              <p className="text-gray-600">
                {new Date(userProfile.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-1">Última actualización</h3>
              <p className="text-gray-600">
                {new Date(userProfile.updatedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚙️ Preferencias</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Notificaciones</h4>
              <p className="text-sm text-gray-600">Recibir alertas de eventos próximos</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 ${userProfile.preferences?.notifications ? "bg-purple-600" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userProfile.preferences?.notifications ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Tema</h4>
              <p className="text-sm text-gray-600">Apariencia de la aplicación</p>
            </div>
            <span className="text-sm text-gray-500 capitalize">{userProfile.preferences?.theme || "light"}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={handleSignOut} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
