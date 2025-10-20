"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/services/authService";

export default function Navigation() {
  const { user, userProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await signOutUser();
      setShowUserMenu(false);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎂</span>
            <span className="font-bold text-xl text-gray-800">Lista de Cumpleaños</span>
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-full transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : userProfile?.displayName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || "👤"}
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">{userProfile?.displayName || "Usuario"}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                    👤 Mi Perfil
                  </Link>
                  <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setShowUserMenu(false)}>
                    👥 Mis Grupos
                  </Link>
                  <hr className="my-1" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              🚀 Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </nav>
  );
}
