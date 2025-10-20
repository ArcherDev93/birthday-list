"use client";

import { useState } from "react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } from "@/services/authService";
import GradientText from "@/components/GradientText";

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmail(email, password);
      } else {
        result = await signUpWithEmail(email, password, displayName);
      }

      if (result.error) {
        setError(result.error);
      } else {
        // Success
        setEmail("");
        setPassword("");
        setDisplayName("");
        onSuccess?.();
      }
    } catch (error) {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      setError("Error al conectar con Google. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetMessage("");

    try {
      const result = await resetPassword(resetEmail);
      if (result.error) {
        setError(result.error);
      } else {
        setResetMessage("Se ha enviado un email para restablecer tu contraseña.");
        setResetEmail("");
      }
    } catch (error) {
      setError("Error al enviar el email. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl shadow-xl border border-blue-200/50 backdrop-blur-sm max-w-md mx-auto">
        <div className="text-center mb-6">
          <GradientText as="h2" className="text-2xl font-bold mb-2">
            🔐 Restablecer Contraseña
          </GradientText>
          <p className="text-gray-600">Ingresa tu email para recibir instrucciones</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {resetMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{resetMessage}</div>}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="resetEmail" className="block text-sm font-bold text-gray-700 mb-2">
              📧 Email
            </label>
            <input
              type="email"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "📧 Enviar Email"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setError("");
                setResetMessage("");
              }}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-purple-50/30 p-8 rounded-2xl shadow-xl border border-purple-200/50 backdrop-blur-sm max-w-md mx-auto">
      <div className="text-center mb-6">
        <GradientText as="h2" className="text-2xl font-bold mb-2">
          {isLogin ? "👋 Iniciar Sesión" : "🎉 Crear Cuenta"}
        </GradientText>
        <p className="text-gray-600">{isLogin ? "Accede a tu cuenta para gestionar tus grupos y eventos" : "Únete para organizar cumpleaños y celebraciones"}</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="displayName" className="block text-sm font-bold text-gray-700 mb-2">
              👤 Nombre
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu primer nombre solamente"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
            📧 Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
            🔒 Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cargando..." : isLogin ? "🚀 Iniciar Sesión" : "✨ Crear Cuenta"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        {isLogin && (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(true);
                setError("");
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
