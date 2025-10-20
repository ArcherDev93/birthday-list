"use client";

import { useState, useEffect } from "react";
import { Event, EventFormData } from "@/types/event";
import GradientText from "@/components/GradientText";

interface EventFormProps {
  editingEvent?: Event | null;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  groupId?: string; // Optional for backward compatibility
}

export default function EventForm({ editingEvent, onSubmit, onCancel, groupId }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    birthDate: "",
    celebrationDate: "",
    location: "",
    attendees: [],
    groupId: groupId || "", // Use provided groupId or empty string
    categories: ["general"],
  });
  const [attendeesInput, setAttendeesInput] = useState("");
  const [availableCategories] = useState<string[]>(["general", "birthday", "celebration", "party", "meeting", "anniversary", "holiday", "special"]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        name: editingEvent.name,
        birthDate: editingEvent.birthDate || "",
        celebrationDate: editingEvent.celebrationDate,
        location: editingEvent.location || "",
        attendees: editingEvent.attendees || [],
        groupId: editingEvent.groupId || groupId || "",
        categories: editingEvent.categories || ["general"],
      });
    } else {
      setFormData({
        name: "",
        birthDate: "",
        celebrationDate: "",
        location: "",
        attendees: [],
        groupId: groupId || "",
        categories: ["general"],
      });
    }
  }, [editingEvent, groupId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.celebrationDate) {
      alert("Por favor ingresa el nombre y la fecha del evento");
      return;
    }

    onSubmit(formData);
    setFormData({
      name: "",
      birthDate: "",
      celebrationDate: "",
      location: "",
      attendees: [],
      groupId: groupId || "",
      categories: ["general"],
    });
    setAttendeesInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAttendee = () => {
    if (attendeesInput.trim() && !formData.attendees?.includes(attendeesInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        attendees: [...(prev.attendees || []), attendeesInput.trim()],
      }));
      setAttendeesInput("");
    }
  };

  const removeAttendee = (personToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees?.filter((person) => person !== personToRemove) || [],
    }));
  };

  const handleAttendeesKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAttendee();
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category) ? prev.categories.filter((c) => c !== category) : [...prev.categories, category],
    }));
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50/30 p-8 rounded-2xl shadow-xl border border-purple-200/50 backdrop-blur-sm">
      <div className="text-center mb-6">
        <GradientText as="h2" className="text-xl md:text-3xl font-bold mb-2">
          {editingEvent ? "✏️ Editar Evento" : "🎉 Agregar Nuevo Evento"}
        </GradientText>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-bold text-gray-700">
            🎉 Nombre del Evento
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ingresa el nombre del evento o celebración"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">🏷️ Categorías del Evento (selecciona una o más)</label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((category) => (
              <button key={category} type="button" onClick={() => toggleCategory(category)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.categories.includes(category) ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                {category}
              </button>
            ))}
          </div>
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
              🎉 Fecha del Evento <span className="text-red-500 text-lg">*</span>
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
            📍 Lugar del Evento
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ej: Casa de María, Parque Central, Oficina..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">👥 Asistentes</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
              onKeyPress={handleAttendeesKeyPress}
              placeholder="Nombre del asistente"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
            <button type="button" onClick={addAttendee} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
              ➕
            </button>
          </div>
          {formData.attendees && formData.attendees.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.attendees.map((person, index) => (
                <span key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-purple-200 shadow-sm">
                  {person}
                  <button type="button" onClick={() => removeAttendee(person)} className="text-purple-600 hover:text-purple-800 font-bold hover:bg-purple-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6">
          <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
            {editingEvent ? "💫 Actualizar Evento" : "🎉 Agregar Evento"}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
