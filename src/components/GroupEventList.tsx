"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Event, EventFormData } from "@/types/event";
import { Group } from "@/types/group";
import { enrichEventData, sortEventsByUpcoming } from "@/utils/event";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import { addEvent, updateEvent, deleteEvent, subscribeToEventsByGroup } from "@/services/eventService";
import { subscribeToGroups } from "@/services/groupService";
import { useAuth } from "@/contexts/AuthContext";
import GradientText from "@/components/GradientText";

interface GroupEventListProps {
  groupId: string;
}

export default function GroupEventList({ groupId }: GroupEventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Ref for the form container to scroll to it
  const formRef = useRef<HTMLDivElement>(null);

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

  // Subscribe to group info
  useEffect(() => {
    if (!user) {
      setError("You must be logged in to view events.");
      setLoading(false);
      return;
    }

    const unsubscribeGroups = subscribeToGroups(
      user.uid,
      (groupList: Group[]) => {
        const foundGroup = groupList.find((g: Group) => g.id === groupId);
        setGroup(foundGroup || null);
      },
      (error: Error) => {
        console.error("Error loading group:", error);
        setError("Failed to load group information");
      }
    );

    return () => {
      unsubscribeGroups();
    };
  }, [groupId, user]);

  // Subscribe to real-time updates from Firestore for this group
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToEventsByGroup(
      groupId,
      user.uid,
      (firestoreEvents: Event[]) => {
        // Enrich the data with calculated fields using event utilities
        const enrichedEvents = firestoreEvents.map(enrichEventData);
        setEvents(enrichedEvents);
        setLoading(false);
        setError(null); // Clear any previous errors
      },
      (error: Error) => {
        console.error("Firebase subscription error:", error);
        setLoading(false);
        setError(`Database connection failed: ${error.message}. Please check Firebase setup.`);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [groupId, user]);

  // Scroll to form when it becomes visible
  useEffect(() => {
    if (showForm) {
      // Use setTimeout to ensure the form is rendered before scrolling
      // Slightly longer delay for mobile devices to ensure smooth rendering
      const delay = window.innerWidth < 768 ? 150 : 100;
      setTimeout(scrollToForm, delay);
    }
  }, [showForm]);

  const handleSubmit = async (formData: EventFormData) => {
    if (!user) {
      setError("You must be logged in to add events.");
      return;
    }

    try {
      setError(null);

      // Ensure the groupId is set
      const eventData = { ...formData, groupId };

      if (editingEvent) {
        // Update existing event
        await updateEvent(editingEvent.id, eventData);
        setEditingEvent(null);
      } else {
        // Add new event
        await addEvent(eventData, user.uid);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Error saving event:", error);
      setError("No se pudo guardar el evento. Por favor intenta de nuevo.");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
    // Scroll will be handled by the useEffect that watches showForm
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        setError(null);
        await deleteEvent(id);
      } catch (error) {
        console.error("Error deleting event:", error);
        setError("No se pudo eliminar el evento. Por favor intenta de nuevo.");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-4">You must be logged in to view events.</p>
          <Link href="/" className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Cargando eventos...</h3>
        </div>
      </div>
    );
  }

  // Sort events by upcoming dates using event utilities
  const sortedEvents = sortEventsByUpcoming(events);

  const todaysEvents = sortedEvents.filter((e) => e.daysUntilEvent === 0);
  const upcomingEvents = sortedEvents.filter((e) => (e.daysUntilEvent || 0) > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-purple-600 transition-colors">
          🏠 Inicio
        </Link>
        <span className="mx-2">›</span>
        <span className="font-semibold text-gray-800">{group?.name || "Grupo"}</span>
      </nav>

      {/* Header */}
      <div className="text-center">
        <GradientText as="h1" className="text-4xl font-bold text-gray-800 mb-2">
          🎉 Eventos - {group?.name}
        </GradientText>
        <div className="flex flex-wrap gap-1 justify-center mb-2">
          {group?.categories.map((category) => (
            <span key={category} className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
              {category}
            </span>
          ))}
        </div>
        <p className="text-gray-600">¡Mantén registro de todos los eventos y celebraciones especiales!</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => setShowForm(true)} className="bg-teal-400 text-white px-6 py-2 rounded-lg hover:bg-teal-500 text-shadow-sm shadow-md  transition-colors font-medium">
          + Agregar Evento
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div ref={formRef}>
          <EventForm editingEvent={editingEvent} onSubmit={handleSubmit} onCancel={handleCancel} groupId={groupId} />
        </div>
      )}

      {/* Today's Events */}
      {todaysEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">🎉 ¡Eventos de Hoy!</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {todaysEvents.map((event) => (
              <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">📅 Próximos Eventos</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">¡Aún no hay eventos en este grupo!</h3>
          <p className="text-gray-500 mb-4">Agrega tu primer evento para comenzar.</p>
          <button onClick={() => setShowForm(true)} className="bg-teal-400 text-white px-6 py-2 rounded-lg hover:bg-teal-500 text-shadow-sm shadow-md  transition-colors font-medium">
            + Agregar Primer Evento
          </button>
        </div>
      )}
    </div>
  );
}
