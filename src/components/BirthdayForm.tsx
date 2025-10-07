"use client";

import { useState, useEffect } from "react";
import { Birthday, BirthdayFormData } from "@/types/birthday";

interface BirthdayFormProps {
  editingBirthday?: Birthday | null;
  onSubmit: (data: BirthdayFormData) => void;
  onCancel: () => void;
}

export default function BirthdayForm({ editingBirthday, onSubmit, onCancel }: BirthdayFormProps) {
  const [formData, setFormData] = useState<BirthdayFormData>({
    name: "",
    birthDate: "",
    location: "",
    asistencia: [],
  });
  const [displayDate, setDisplayDate] = useState(""); // For European format display
  const [asistenciaInput, setAsistenciaInput] = useState("");

  // Convert ISO date (yyyy-mm-dd) to European format (dd/mm/yyyy)
  const formatToEuropean = (isoDate: string): string => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert European format (dd/mm/yyyy) to ISO date (yyyy-mm-dd)
  const formatToISO = (europeanDate: string): string => {
    if (!europeanDate) return "";
    const [day, month, year] = europeanDate.split("/");
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  // Validate European date format
  const isValidEuropeanDate = (dateString: string): boolean => {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(regex);

    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Check if date values are valid
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // Check if day is valid for the month
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  useEffect(() => {
    if (editingBirthday) {
      setFormData({
        name: editingBirthday.name,
        birthDate: editingBirthday.birthDate,
        location: editingBirthday.location || "",
        asistencia: editingBirthday.asistencia || [],
      });
      setDisplayDate(formatToEuropean(editingBirthday.birthDate));
    } else {
      setFormData({ name: "", birthDate: "", location: "", asistencia: [] });
      setDisplayDate("");
    }
  }, [editingBirthday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !displayDate) {
      return;
    }

    // Validate European date format
    if (!isValidEuropeanDate(displayDate)) {
      alert("Por favor ingresa una fecha válida en formato dd/mm/aaaa");
      return;
    }

    // Convert to ISO format for storage
    const isoDate = formatToISO(displayDate);
    const submissionData = {
      ...formData,
      birthDate: isoDate,
    };

    onSubmit(submissionData);
    setFormData({ name: "", birthDate: "", location: "", asistencia: [] });
    setDisplayDate("");
    setAsistenciaInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAsistencia = () => {
    if (asistenciaInput.trim() && !formData.asistencia?.includes(asistenciaInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        asistencia: [...(prev.asistencia || []), asistenciaInput.trim()],
      }));
      setAsistenciaInput("");
    }
  };

  const removeAsistencia = (kidToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      asistencia: prev.asistencia?.filter((kid) => kid !== kidToRemove) || [],
    }));
  };

  const handleAsistenciaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAsistencia();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{editingBirthday ? "Editar Cumpleaños" : "Agregar Nuevo Cumpleaños"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Niño/a
          </label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ingresa el nombre del niño/a" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento
          </label>
          <input type="text" id="birthDate" value={displayDate} onChange={(e) => setDisplayDate(e.target.value)} placeholder="dd/mm/aaaa" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Lugar de la Fiesta
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Casa de María, Parque Central..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asistencia (Niños que van)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={asistenciaInput}
              onChange={(e) => setAsistenciaInput(e.target.value)}
              onKeyPress={handleAsistenciaKeyPress}
              placeholder="Nombre del niño/a"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="button" onClick={addAsistencia} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
              +
            </button>
          </div>
          {formData.asistencia && formData.asistencia.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.asistencia.map((kid, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {kid}
                  <button type="button" onClick={() => removeAsistencia(kid)} className="text-blue-600 hover:text-blue-800 font-bold">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            {editingBirthday ? "Actualizar Cumpleaños" : "Agregar Cumpleaños"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
