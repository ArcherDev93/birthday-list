"use client";

import { useState, useEffect } from "react";
import { Birthday, BirthdayFormData } from "@/types/birthday";
import { enrichBirthdayData, sortBirthdaysByUpcoming } from "@/utils/birthday";
import BirthdayCard from "@/components/BirthdayCard";
import BirthdayForm from "@/components/BirthdayForm";

const STORAGE_KEY = "birthday-list";

export default function BirthdayList() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  // Load birthdays from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedBirthdays = JSON.parse(saved).map((b: any) => enrichBirthdayData(b));
        setBirthdays(parsedBirthdays);
      } catch (error) {
        console.error("Error loading birthdays:", error);
      }
    }
  }, []);

  // Save birthdays to localStorage whenever they change
  useEffect(() => {
    if (birthdays.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
    }
  }, [birthdays]);

  const handleSubmit = (formData: BirthdayFormData) => {
    if (editingBirthday) {
      // Update existing birthday
      setBirthdays((prev) => prev.map((b) => (b.id === editingBirthday.id ? enrichBirthdayData({ ...editingBirthday, ...formData }) : b)));
      setEditingBirthday(null);
    } else {
      // Add new birthday
      const newBirthday = enrichBirthdayData({
        id: Date.now().toString(),
        ...formData,
      });
      setBirthdays((prev) => [...prev, newBirthday]);
    }
    setShowForm(false);
  };

  const handleEdit = (birthday: Birthday) => {
    setEditingBirthday(birthday);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this birthday?")) {
      setBirthdays((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBirthday(null);
  };

  const handleShare = async () => {
    try {
      const dataToShare = JSON.stringify(birthdays);
      const encodedData = encodeURIComponent(dataToShare);
      const url = `${window.location.origin}?data=${encodedData}`;

      if (navigator.share) {
        await navigator.share({
          title: "Birthday List",
          text: "Check out our family birthday list!",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareUrl(url);
        alert("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleImportFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("data");

    if (data) {
      try {
        const importedBirthdays = JSON.parse(decodeURIComponent(data)).map((b: any) => enrichBirthdayData(b));
        setBirthdays(importedBirthdays);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        alert("Birthday list imported successfully!");
      } catch (error) {
        console.error("Error importing data:", error);
        alert("Error importing birthday list. Please check the link.");
      }
    }
  };

  // Check for import data on component mount
  useEffect(() => {
    handleImportFromUrl();
  }, []);

  const sortedBirthdays = sortBirthdaysByUpcoming(birthdays);
  const todaysBirthdays = sortedBirthdays.filter((b) => b.daysUntilBirthday === 0);
  const upcomingBirthdays = sortedBirthdays.filter((b) => (b.daysUntilBirthday || 0) > 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎂 Birthday List</h1>
        <p className="text-gray-600">Keep track of all the special birthdays!</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
          + Add Birthday
        </button>
        <button onClick={handleShare} disabled={birthdays.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium">
          📤 Share List
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && <BirthdayForm editingBirthday={editingBirthday} onSubmit={handleSubmit} onCancel={handleCancel} />}

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">🎉 Today's Birthdays!</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysBirthdays.map((birthday) => (
              <BirthdayCard key={birthday.id} birthday={birthday} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">📅 Upcoming Birthdays</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No birthdays yet!</h3>
          <p className="text-gray-500 mb-4">Add your first birthday to get started.</p>
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
            + Add First Birthday
          </button>
        </div>
      )}

      {/* Share URL Display */}
      {shareUrl && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Share Link:</h3>
          <div className="flex gap-2">
            <input type="text" value={shareUrl} readOnly className="flex-1 px-3 py-1 text-sm bg-white border border-blue-300 rounded" />
            <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
