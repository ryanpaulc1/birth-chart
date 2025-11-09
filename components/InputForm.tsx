"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BirthDetails } from "@/lib/types";

export default function InputForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    date: "",
    time: "",
    location: {
      city: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Geocode the city to get coordinates and timezone
      const geocodeResponse = await fetch(
        `/api/geocode?city=${encodeURIComponent(formData.location.city)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error("Could not find location. Please try a different city.");
      }

      const locationData = await geocodeResponse.json();

      // Update form data with geocoded location
      const updatedFormData = {
        ...formData,
        location: {
          city: locationData.city,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone,
        },
      };

      // Step 2: Generate birth chart
      const chartResponse = await fetch("/api/birth-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!chartResponse.ok) {
        const errorData = await chartResponse.json();
        throw new Error(errorData.error || "Failed to generate birth chart");
      }

      const chartData = await chartResponse.json();

      // Store chart data in sessionStorage
      sessionStorage.setItem("lastChart", JSON.stringify(chartData));

      // Step 3: Redirect to chart page
      router.push(`/chart/${chartData.chartId}`);
    } catch (error) {
      console.error("Error generating chart:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-cream mb-2"
        >
          Your Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cream transition-colors"
          placeholder="Mia F."
        />
      </div>

      {/* Birth Date Input */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-cream mb-2"
        >
          Birth Date
        </label>
        <input
          type="date"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cream transition-colors [color-scheme:dark] max-w-full"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        />
      </div>

      {/* Birth Time Input */}
      <div>
        <label
          htmlFor="time"
          className="block text-sm font-medium text-cream mb-2"
        >
          Birth Time
        </label>
        <input
          type="time"
          id="time"
          required
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cream transition-colors [color-scheme:dark] max-w-full"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        />
      </div>

      {/* Birth Location Input */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-cream mb-2"
        >
          Birth Location
        </label>
        <input
          type="text"
          id="location"
          required
          value={formData.location.city}
          onChange={(e) =>
            setFormData({
              ...formData,
              location: { ...formData.location, city: e.target.value },
            })
          }
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cream transition-colors"
          placeholder="San Francisco, CA"
        />
        <p className="text-xs text-white/50 mt-1">
          We'll add autocomplete in the next step
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-cream px-8 py-4 rounded-lg font-medium text-lg hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Generating Chart..." : "Generate My Chart"}
      </button>
    </form>
  );
}
