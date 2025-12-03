"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Music } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  djId: string;
  djName: string;
  hourlyRate: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({
  isOpen,
  djId,
  djName,
  hourlyRate,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    eventDate: "",
    eventTime: "",
    eventDuration: 2,
    eventType: "Wedding",
    eventLocation: "",
    eventNotes: "",
    contactEmail: "",
    contactPhone: "",
  });

  const estimatedPrice = formData.eventDuration * hourlyRate;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.eventDate || !formData.eventTime) {
        throw new Error("Please select date and time");
      }
      if (!formData.eventLocation) {
        throw new Error("Please enter event location");
      }
      if (!formData.contactEmail) {
        throw new Error("Please enter contact email");
      }

      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          djId,
          eventDate: eventDateTime.toISOString(),
          eventDuration: parseInt(formData.eventDuration.toString()),
          eventType: formData.eventType,
          eventLocation: formData.eventLocation,
          eventNotes: formData.eventNotes,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create booking");
      }

      // Reset form and close modal
      setFormData({
        eventDate: "",
        eventTime: "",
        eventDuration: 2,
        eventType: "Wedding",
        eventLocation: "",
        eventNotes: "",
        contactEmail: "",
        contactPhone: "",
      });

      onSuccess?.();
      onClose();

      // Show success message
      alert("Booking request sent! The DJ will review and confirm.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Book {djName}</h2>
            <p className="text-blue-100">€{hourlyRate}/hour</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Event Date
              </div>
            </label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Event Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Event Time
              </div>
            </label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <select
              name="eventDuration"
              value={formData.eventDuration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} hour{hours > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Event Type
              </div>
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Wedding</option>
              <option>Corporate Event</option>
              <option>Birthday Party</option>
              <option>Club Night</option>
              <option>Festival</option>
              <option>Private Party</option>
              <option>Other</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Event Location
              </div>
            </label>
            <input
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              placeholder="Address or venue"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </label>
            <textarea
              name="eventNotes"
              value={formData.eventNotes}
              onChange={handleInputChange}
              placeholder="Any special requests or details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Hourly Rate:</span>
              <span className="font-medium">€{hourlyRate}/hr</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700">Duration:</span>
              <span className="font-medium">{formData.eventDuration} hours</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold">Estimated Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  €{estimatedPrice}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Final price may vary based on DJ confirmation
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Booking Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
