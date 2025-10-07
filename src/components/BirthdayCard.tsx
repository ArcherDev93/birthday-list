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

  return (
    <div
      className={`
      p-4 rounded-lg border-2 transition-all hover:shadow-md
      ${isToday ? "bg-yellow-100 border-yellow-300 shadow-lg" : isSoon ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:border-gray-300"}
    `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{birthday.name}</h3>
        <div className="flex gap-2">
          <button onClick={() => onEdit(birthday)} className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50" aria-label={`Editar cumpleaños de ${birthday.name}`}>
            Editar
          </button>
          <button onClick={() => onDelete(birthday.id)} className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50" aria-label={`Eliminar cumpleaños de ${birthday.name}`}>
            Eliminar
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-gray-600">📅 {formatDateShort(birthday.birthDate)}</p>
        <p className="text-gray-600">🎂 Cumplirá: {birthday.age} años</p>
        <p className={`font-medium ${isToday ? "text-yellow-700" : isSoon ? "text-blue-700" : "text-gray-700"}`}>{isToday ? "🎉 ¡Es su cumpleaños HOY!" : `⏰ ${birthday.daysUntilBirthday} días para su cumpleaños`}</p>
      </div>
    </div>
  );
}
