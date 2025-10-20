"use client";

import { Event } from "@/types/event";
import { formatDateShort } from "@/utils/event";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const isToday = event.daysUntilEvent === 0;
  const isSoon = (event.daysUntilEvent || 0) <= 7;

  const shareIndividualEvent = async () => {
    const { formatDate } = await import("@/utils/event");

    let shareText = `🎉 Evento: ${event.name}\n`;
    shareText += `📅 Fecha de Celebración: ${formatDate(event.celebrationDate)}\n`;

    if (event.birthDate) {
      shareText += `🎂 Fecha de Nacimiento: ${formatDate(event.birthDate)}\n`;
    }

    if (event.age) {
      shareText += `🎂 Cumplirá: ${event.age} años\n`;
    }

    if (event.location) {
      shareText += `📍 Lugar: ${event.location}\n`;
    }

    if (event.categories && event.categories.length > 0) {
      shareText += `🏷️ Categorías: ${event.categories.join(", ")}\n`;
    }

    if (event.attendees && event.attendees.length > 0) {
      shareText += `\n👥 Asistencia:\n`;
      event.attendees.forEach((person) => {
        shareText += `• ${person}\n`;
      });
    }

    if (event.daysUntilEvent === 0) {
      shareText += `\n🎉 ¡Es el evento HOY!`;
    } else {
      shareText += `\n⏰ Faltan ${event.daysUntilEvent} días`;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("¡Detalles del evento copiados al portapapeles!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Error al copiar. Intenta de nuevo.");
    }
  };

  return (
    <div
      className={`
      EventCard p-4 rounded-[20px] border-none transition-all
      shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)]
      hover:shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,0,0,0.12)]
      ${isToday ? "bg-yellow-100 border-yellow-300" : isSoon ? "bg-pink-50" : "bg-white hover:border-gray-300"}
    `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => onEdit(event)} className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100" aria-label={`Editar evento de ${event.name}`}>
            Editar
          </button>
          <button onClick={shareIndividualEvent} className="cursor-pointer text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-100" aria-label={`Copiar evento de ${event.name}`}>
            Copiar
          </button>
          <button onClick={() => onDelete(event.id)} className="cursor-pointer text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-100" aria-label={`Eliminar evento de ${event.name}`}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-gray-600">🎉 {formatDateShort(event.celebrationDate)}</p>
        {event.birthDate && <p className="text-gray-600 text-sm">📅 Nació: {formatDateShort(event.birthDate)}</p>}
        {event.age && event.age > 0 && <p className="text-gray-600">🎂 Cumplirá: {event.age} años</p>}

        {event.location && <p className="text-gray-600">📍 {event.location}</p>}

        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.categories.map((category, index) => (
              <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                {category}
              </span>
            ))}
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className="text-gray-600">
            <p className="font-medium text-sm">👥 Asistencia:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {event.attendees.map((person, index) => (
                <span key={index} className="bg-sky-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {person}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className={`font-medium ${isToday ? "text-yellow-700" : isSoon ? "text-blue-700" : "text-gray-700"}`}>{isToday ? "🎉 ¡Es el evento HOY!" : `⏰ ${event.daysUntilEvent} días para el evento`}</p>
      </div>
    </div>
  );
}
