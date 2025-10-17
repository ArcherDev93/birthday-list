"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Birthday, BirthdayFormData } from "@/types/birthday";
import { School, Class } from "@/types/school";
import { enrichBirthdayData, sortBirthdaysByUpcoming } from "@/utils/birthday";
import BirthdayCard from "@/components/BirthdayCard";
import BirthdayForm from "@/components/BirthdayForm";
import { addBirthday, updateBirthday, deleteBirthday, subscribeToBirthdaysByClass } from "@/services/birthdayService";
import { subscribeToSchools, subscribeToAllClasses } from "@/services/schoolService";
import GradientText from "@/components/GradientText";

interface ClassBirthdayListProps {
  schoolId: string;
  classId: string;
}

export default function ClassBirthdayList({ schoolId, classId }: ClassBirthdayListProps) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for the form container to scroll to it
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Function to scroll to form smoothly
  const scrollToForm = () => {
    if (formRef.current) {
      // Calculate offset - more space on mobile devices
      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 10 : 20; // Less offset on mobile for better visibility
      const offsetTop = formRef.current.offsetTop - offset;

      window.scrollTo({
        top: Math.max(0, offsetTop), // Ensure we don't scroll to negative values
        behavior: "smooth",
      });
    }
  };

  // Subscribe to school and class info
  useEffect(() => {
    const unsubscribeSchools = subscribeToSchools(
      (schoolList) => {
        const foundSchool = schoolList.find((s) => s.id === schoolId);
        setSchool(foundSchool || null);
      },
      (error) => {
        console.error("Error loading school:", error);
        setError("Failed to load school information");
      }
    );

    const unsubscribeClasses = subscribeToAllClasses(
      (classList) => {
        const foundClass = classList.find((c) => c.id === classId);
        setClassInfo(foundClass || null);
      },
      (error) => {
        console.error("Error loading class:", error);
        setError("Failed to load class information");
      }
    );

    return () => {
      unsubscribeSchools();
      unsubscribeClasses();
    };
  }, [schoolId, classId]);

  // Subscribe to real-time updates from Firestore for this class
  useEffect(() => {
    const unsubscribe = subscribeToBirthdaysByClass(
      classId,
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
  }, [classId]);

  // Scroll to form when it becomes visible
  useEffect(() => {
    if (showForm) {
      // Use setTimeout to ensure the form is rendered before scrolling
      // Slightly longer delay for mobile devices to ensure smooth rendering
      const delay = window.innerWidth < 768 ? 150 : 100;
      setTimeout(scrollToForm, delay);
    }
  }, [showForm]);

  const handleSubmit = async (formData: BirthdayFormData) => {
    try {
      setError(null);

      // Ensure the classId is set
      const birthdayData = { ...formData, classId };

      if (editingBirthday) {
        // Update existing birthday
        await updateBirthday(editingBirthday.id, birthdayData);
        setEditingBirthday(null);
      } else {
        // Add new birthday
        await addBirthday(birthdayData);
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
    // Scroll will be handled by the useEffect that watches showForm
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
      {/* Navigation Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          🏠 Inicio
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/school/${schoolId}`} className="hover:text-purple-600 transition-colors">
          {school?.name || "Escuela"}
        </Link>
        <span className="mx-2">›</span>
        <span className="font-semibold text-gray-800">{classInfo?.name || "Clase"}</span>
      </nav>

      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold text-gray-800 mb-2">
          🎂 Cumpleaños - {classInfo?.name}
        </GradientText>
        <p className="text-gray-600">{school?.name} • ¡Mantén registro de todos los cumpleaños especiales!</p>
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
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div ref={formRef}>
          <BirthdayForm editingBirthday={editingBirthday} onSubmit={handleSubmit} onCancel={handleCancel} classId={classId} />
        </div>
      )}

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">🎉 ¡Cumpleaños de Hoy!</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
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
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">¡Aún no hay cumpleaños en esta clase!</h3>
          <p className="text-gray-500 mb-4">Agrega tu primer cumpleaños para comenzar.</p>
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            + Agregar Primer Cumpleaños
          </button>
        </div>
      )}
    </div>
  );
}
