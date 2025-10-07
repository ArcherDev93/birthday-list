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
    celebrationDate: "",
    location: "",
    asistencia: [],
  });
  const [asistenciaInput, setAsistenciaInput] = useState("");

  useEffect(() => {
    if (editingBirthday) {
      setFormData({
        name: editingBirthday.name,
        birthDate: editingBirthday.birthDate || "",
        celebrationDate: editingBirthday.celebrationDate,
        location: editingBirthday.location || "",
        asistencia: editingBirthday.asistencia || [],
      });
    } else {
      setFormData({ name: "", birthDate: "", celebrationDate: "", location: "", asistencia: [] });
    }
  }, [editingBirthday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.celebrationDate) {
      alert("Por favor ingresa el nombre y la fecha de cumpleaños");
      return;
    }

    onSubmit(formData);
    setFormData({ name: "", birthDate: "", celebrationDate: "", location: "", asistencia: [] });
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
            Fecha de Nacimiento <span className="text-gray-500 text-sm">(opcional)</span>
          </label>
          <input 
            type="date" 
            id="birthDate" 
            name="birthDate"
            value={formData.birthDate} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>

        <div>
          <label htmlFor="celebrationDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Cumpleaños <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            id="celebrationDate" 
            name="celebrationDate"
            value={formData.celebrationDate} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
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
