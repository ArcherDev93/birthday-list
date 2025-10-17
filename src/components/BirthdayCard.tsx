"use client";

import { Birthday } from "@/types/birthday";
import { formatDateShort } from "@/utils/birthday";

interface BirthdayCardProps {
  birthday: Birthday;
  onEdit: (birthday: Birthday) => void;
  onDelete: (id: string) => void;
}

export default function BirthdayCard({ birthday, onEdit, onDelete }: BirthdayCardProps) {
  const isToday = birthday.daysUntilBirthday === 0;
  const isSoon = (birthday.daysUntilBirthday || 0) <= 7;

  const shareIndividualBirthday = async () => {
    const { formatDate } = await import("@/utils/birthday");

    let shareText = `🎂 Cumpleaños de ${birthday.name}\n`;
    shareText += `🎉 Fecha de Cumpleaños: ${formatDate(birthday.celebrationDate)}\n`;

    if (birthday.birthDate) {
      shareText += `📅 Fecha de Nacimiento: ${formatDate(birthday.birthDate)}\n`;
    }

    if (birthday.age) {
      shareText += `🎂 Cumplirá: ${birthday.age} años\n`;
    }

    if (birthday.location) {
      shareText += `📍 Lugar: ${birthday.location}\n`;
    }

    if (birthday.asistencia && birthday.asistencia.length > 0) {
      shareText += `\n👥 Asistencia:\n`;
      birthday.asistencia.forEach((kid) => {
        shareText += `• ${kid}\n`;
      });
    }

    if (birthday.daysUntilBirthday === 0) {
      shareText += `\n🎉 ¡Es su cumpleaños HOY!`;
    } else {
      shareText += `\n⏰ Faltan ${birthday.daysUntilBirthday} días`;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("¡Detalles del cumpleaños copiados al portapapeles!");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      alert("Error al copiar. Intenta de nuevo.");
    }
  };

  return (
    <div
      className={`
      BirthdayCard p-4 rounded-[20px] border-none transition-all
      shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)]
      hover:shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_6px_12px_rgba(0,0,0,0.12)]
      ${isToday ? "bg-yellow-100 border-yellow-300" : isSoon ? "bg-pink-50" : "bg-white hover:border-gray-300"}
    `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{birthday.name}</h3>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => onEdit(birthday)} className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100" aria-label={`Editar cumpleaños de ${birthday.name}`}>
            Editar
          </button>
          <button onClick={shareIndividualBirthday} className="cursor-pointer text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded hover:bg-green-100" aria-label={`Copiar cumpleaños de ${birthday.name}`}>
            Copiar
          </button>
          <button onClick={() => onDelete(birthday.id)} className="cursor-pointer text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-100" aria-label={`Eliminar cumpleaños de ${birthday.name}`}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-gray-600">🎉 {formatDateShort(birthday.celebrationDate)}</p>
        {birthday.birthDate && <p className="text-gray-600 text-sm">📅 Nació: {formatDateShort(birthday.birthDate)}</p>}
        {birthday.age && birthday.age > 0 && <p className="text-gray-600">🎂 Cumplirá: {birthday.age} años</p>}

        {birthday.location && <p className="text-gray-600">📍 {birthday.location}</p>}

        {birthday.asistencia && birthday.asistencia.length > 0 && (
          <div className="text-gray-600">
            <p className="font-medium text-sm">👥 Asistencia:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {birthday.asistencia.map((kid, index) => (
                <span key={index} className="bg-sky-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {kid}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className={`font-medium ${isToday ? "text-yellow-700" : isSoon ? "text-blue-700" : "text-gray-700"}`}>{isToday ? "🎉 ¡Es su cumpleaños HOY!" : `⏰ ${birthday.daysUntilBirthday} días para su cumpleaños`}</p>
      </div>
    </div>
  );
}
