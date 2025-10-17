"use client";

import { useState, useEffect } from "react";
import { Birthday, BirthdayFormData } from "@/types/birthday";
import GradientText from "@/components/GradientText";

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
    <div className="bg-gradient-to-br from-white to-purple-50/30 p-8 rounded-2xl shadow-xl border border-purple-200/50 backdrop-blur-sm">
      <div className="text-center mb-6">
        <GradientText as="h2" className="text-xl md:text-3xl font-bold mb-2">
          {editingBirthday ? "✏️ Editar Cumpleaños" : "🎉 Agregar Nuevo Cumpleaños"}
        </GradientText>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-bold text-gray-700">
            👶 Nombre del Niño/a
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre del niño/a"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="birthDate" className="block text-sm font-bold text-gray-700">
              📅 Fecha de Nacimiento <span className="text-gray-500 text-xs font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="celebrationDate" className="block text-sm font-bold text-gray-700">
              🎉 Fecha de Cumpleaños <span className="text-red-500 text-lg">*</span>
            </label>
            <input
              type="date"
              id="celebrationDate"
              name="celebrationDate"
              value={formData.celebrationDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-bold text-gray-700">
            📍 Lugar de la Fiesta
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Casa de María, Parque Central..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">👥 Asistencia (Niños que van)</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={asistenciaInput}
              onChange={(e) => setAsistenciaInput(e.target.value)}
              onKeyPress={handleAsistenciaKeyPress}
              placeholder="Nombre del niño/a"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            <button type="button" onClick={addAsistencia} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              ➕
            </button>
          </div>
          {formData.asistencia && formData.asistencia.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.asistencia.map((kid, index) => (
                <span key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-purple-200 shadow-sm">
                  {kid}
                  <button type="button" onClick={() => removeAsistencia(kid)} className="text-purple-600 hover:text-purple-800 font-bold hover:bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6">
          <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
            {editingBirthday ? "💫 Actualizar Cumpleaños" : "🎉 Agregar Cumpleaños"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
