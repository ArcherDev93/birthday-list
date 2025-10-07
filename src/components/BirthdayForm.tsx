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
  });

  useEffect(() => {
    if (editingBirthday) {
      setFormData({
        name: editingBirthday.name,
        birthDate: editingBirthday.birthDate,
      });
    } else {
      setFormData({ name: "", birthDate: "" });
    }
  }, [editingBirthday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthDate) {
      return;
    }
    onSubmit(formData);
    setFormData({ name: "", birthDate: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
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
