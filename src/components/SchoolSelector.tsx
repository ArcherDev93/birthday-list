"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { School } from "@/types/school";
import { subscribeToSchools, addSchool } from "@/services/schoolService";
import { migrateToNewStructure, checkMigrationNeeded } from "@/utils/migration";
import { formatSafeDate } from "@/utils/dateUtils";
import GradientText from "@/components/GradientText";

export default function SchoolSelector() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [migrating, setMigrating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if migration is needed first
    const initializeApp = async () => {
      try {
        const needsMigration = await checkMigrationNeeded();

        if (needsMigration) {
          setMigrating(true);
          const { schoolId, classId } = await migrateToNewStructure();
          setMigrating(false);

          // Redirect to the migrated class
          router.push(`/school/${schoolId}/class/${classId}`);
          return;
        }

        // If no migration needed, subscribe to schools
        const unsubscribe = subscribeToSchools(
          (schoolList) => {
            setSchools(schoolList);
            setLoading(false);
          },
          (error) => {
            console.error("Error loading schools:", error);
            setError("Failed to load schools");
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Failed to initialize app");
        setLoading(false);
        setMigrating(false);
      }
    };

    initializeApp();
  }, [router]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    try {
      const schoolId = await addSchool({ name: newSchoolName.trim() });
      setNewSchoolName("");
      setShowAddForm(false);
      router.push(`/school/${schoolId}`);
    } catch (error) {
      console.error("Error adding school:", error);
      setError("Failed to add school");
    }
  };

  const handleSchoolSelect = (schoolId: string) => {
    router.push(`/school/${schoolId}`);
  };

  if (migrating) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <GradientText as="h2" className="text-2xl font-bold mb-4">
            Migrando tus datos...
          </GradientText>
          <p className="text-gray-600">Estamos organizando tus cumpleaños en la nueva estructura. Serás redirigido automáticamente.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando escuelas...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold mb-2">
          🎓 Selecciona una Escuela
        </GradientText>
        <p className="text-gray-600">Elige la escuela para ver las clases y cumpleaños</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Add School Button */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-teal-400 text-white px-6 py-3 rounded-lg hover:bg-teal-500 text-shadow-sm shadow-md  transition-colors font-medium">
          ➕ Agregar Nueva Escuela
        </button>
      </div>

      {/* Add School Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleAddSchool} className="space-y-4">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-bold text-gray-700 mb-2">
                🏫 Nombre de la Escuela
              </label>
              <input
                type="text"
                id="schoolName"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="Ej: Brains - Las Palmas"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-2 bg-purple-600 text-white py-3 px-2 md:px-6 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                ✅ Crear Escuela
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSchoolName("");
                }}
                className="flex-1 bg-gray-400 text-white py-3 px-2 md:px-6 rounded-xl font-bold hover:bg-gray-500 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schools Grid */}
      {schools.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <div key={school.id} onClick={() => handleSchoolSelect(school.id)} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-200 cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">🏫</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{school.name}</h3>
                <p className="text-sm text-gray-500">Creada el {formatSafeDate(school.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏫</div>
          <GradientText as="h3" className="text-xl font-semibold mb-2">
            ¡No hay escuelas aún!
          </GradientText>
          <p className="text-gray-500 mb-4">Crea tu primera escuela para comenzar.</p>
          <button onClick={() => setShowAddForm(true)} className="bg-teal-400 text-white px-6 py-3 rounded-lg hover:bg-teal-500 text-shadow-sm shadow-md  transition-colors font-medium">
            ➕ Crear Primera Escuela
          </button>
        </div>
      )}
    </div>
  );
}
