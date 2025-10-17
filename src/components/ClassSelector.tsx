"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { School, Class } from "@/types/school";
import { subscribeToSchools, subscribeToClassesBySchool, addClass } from "@/services/schoolService";
import GradientText from "@/components/GradientText";

interface ClassSelectorProps {
  schoolId: string;
}

export default function ClassSelector({ schoolId }: ClassSelectorProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Subscribe to school info
    const unsubscribeSchools = subscribeToSchools(
      (schoolList) => {
        const foundSchool = schoolList.find((s) => s.id === schoolId);
        if (foundSchool) {
          setSchool(foundSchool);
        } else {
          setError("School not found");
        }
      },
      (error) => {
        console.error("Error loading school:", error);
        setError("Failed to load school information");
      }
    );

    // Subscribe to classes for this school
    const unsubscribeClasses = subscribeToClassesBySchool(
      schoolId,
      (classList) => {
        setClasses(classList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading classes:", error);
        setError("Failed to load classes");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeSchools();
      unsubscribeClasses();
    };
  }, [schoolId]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const classId = await addClass({
        name: newClassName.trim(),
        schoolId: schoolId,
      });
      setNewClassName("");
      setShowAddForm(false);
      router.push(`/school/${schoolId}/class/${classId}`);
    } catch (error) {
      console.error("Error adding class:", error);
      setError("Failed to add class");
    }
  };

  const handleClassSelect = (classId: string) => {
    router.push(`/school/${schoolId}/class/${classId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando clases...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          🏠 Inicio
        </Link>
        {school && (
          <>
            <span className="mx-2">›</span>
            <span className="font-semibold text-gray-800">{school.name}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold mb-2">
          📚 Clases de {school?.name || "la Escuela"}
        </GradientText>
        <p className="text-gray-600">Selecciona una clase para ver los cumpleaños</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Add Class Button */}
      <div className="flex justify-center">
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
          ➕ Agregar Nueva Clase
        </button>
      </div>

      {/* Add Class Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <form onSubmit={handleAddClass} className="space-y-4">
            <div>
              <label htmlFor="className" className="block text-sm font-bold text-gray-700 mb-2">
                📚 Nombre de la Clase
              </label>
              <input
                type="text"
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ej: Superheroes - infantil"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                ✅ Crear Clase
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewClassName("");
                }}
                className="flex-1 bg-gray-400 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-500 transition-colors"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      {classes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <div key={classItem.id} onClick={() => handleClassSelect(classItem.id)} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-200 cursor-pointer group">
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">👥</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{classItem.name}</h3>
                <p className="text-sm text-gray-500">Creada el {new Date(classItem.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <GradientText as="h3" className="text-xl font-semibold mb-2">
            ¡No hay clases aún!
          </GradientText>
          <p className="text-gray-500 mb-4">Crea tu primera clase para comenzar a agregar cumpleaños.</p>
          <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
            ➕ Crear Primera Clase
          </button>
        </div>
      )}
    </div>
  );
}
