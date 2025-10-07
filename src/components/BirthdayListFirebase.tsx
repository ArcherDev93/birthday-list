"use client";

import { useState, useEffect } from "react";
import { Birthday, BirthdayFormData } from "@/types/birthday";
import { enrichBirthdayData, sortBirthdaysByUpcoming } from "@/utils/birthday";
import BirthdayCard from "@/components/BirthdayCard";
import BirthdayForm from "@/components/BirthdayForm";
import { addBirthday, updateBirthday, deleteBirthday, subscribeToBirthdays, exportBirthdaysData } from "@/services/birthdayService";

export default function BirthdayListFirebase() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToBirthdays(
      (firestoreBirthdays) => {
        // Enrich the data with calculated fields
        const enrichedBirthdays = firestoreBirthdays.map(enrichBirthdayData);
        setBirthdays(enrichedBirthdays);
        setLoading(false);
        setError(null); // Clear any previous errors
      },
      (error) => {
        console.error("Firebase subscription error:", error);
        setLoading(false);
        setError(`Database connection failed: ${error.message}. Please check Firebase setup.`);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (formData: BirthdayFormData) => {
    try {
      setError(null);

      if (editingBirthday) {
        // Update existing birthday
        await updateBirthday(editingBirthday.id, formData);
        setEditingBirthday(null);
      } else {
        // Add new birthday
        await addBirthday(formData);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Error saving birthday:", error);
      setError("No se pudo guardar el cumpleaños. Por favor intenta de nuevo.");
    }
  };

  const handleEdit = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cumpleaños?")) {
      try {
        setError(null);
        await deleteBirthday(id);
      } catch (error) {
        console.error("Error deleting birthday:", error);
        setError("No se pudo eliminar el cumpleaños. Por favor intenta de nuevo.");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBirthday(null);
  };

  const handleShare = async () => {
    try {
      setError(null);
      const dataToShare = await exportBirthdaysData();
      const encodedData = encodeURIComponent(dataToShare);
      const url = `${window.location.origin}?data=${encodedData}`;

      if (navigator.share) {
        await navigator.share({
          title: "Lista de Cumpleaños",
          text: "¡Mira nuestra lista familiar de cumpleaños!",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareUrl(url);
        alert("¡Enlace copiado al portapapeles!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setError("No se pudo crear el enlace para compartir. Por favor intenta de nuevo.");
    }
  };

  const handleImportFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("data");

    if (data) {
      try {
        const importedBirthdays = JSON.parse(decodeURIComponent(data));

        // Add each birthday to Firestore
        for (const birthday of importedBirthdays) {
          const { id, age, daysUntilBirthday, ...birthdayData } = birthday;
          await addBirthday(birthdayData);
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        alert("¡Lista de cumpleaños importada exitosamente!");
      } catch (error) {
        console.error("Error importing data:", error);
        setError("Error al importar la lista de cumpleaños. Por favor verifica el enlace.");
      }
    }
  };

  // Check for import data on component mount
  useEffect(() => {
    handleImportFromUrl();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎂</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando cumpleaños...</h3>
        </div>
      </div>
    );
  }

  const sortedBirthdays = sortBirthdaysByUpcoming(birthdays);
  const todaysBirthdays = sortedBirthdays.filter((b) => b.daysUntilBirthday === 0);
  const upcomingBirthdays = sortedBirthdays.filter((b) => (b.daysUntilBirthday || 0) > 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎂 Lista de Cumpleaños</h1>
        <p className="text-gray-600">¡Mantén registro de todos los cumpleaños especiales!</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
          + Agregar Cumpleaños
        </button>
        <button onClick={handleShare} disabled={birthdays.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
          📤 Compartir Lista
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && <BirthdayForm editingBirthday={editingBirthday} onSubmit={handleSubmit} onCancel={handleCancel} />}

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">🎉 ¡Cumpleaños de Hoy!</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysBirthdays.map((birthday) => (
              <BirthdayCard key={birthday.id} birthday={birthday} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">📅 Próximos Cumpleaños</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBirthdays.map((birthday) => (
              <BirthdayCard key={birthday.id} birthday={birthday} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {birthdays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎂</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">¡Aún no hay cumpleaños!</h3>
          <p className="text-gray-500 mb-4">Agrega tu primer cumpleaños para comenzar.</p>
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            + Agregar Primer Cumpleaños
          </button>
        </div>
      )}

      {/* Share URL Display */}
      {shareUrl && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Enlace para Compartir:</h3>
          <div className="flex gap-2">
            <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-1 text-sm bg-white border border-blue-300 rounded" />
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
