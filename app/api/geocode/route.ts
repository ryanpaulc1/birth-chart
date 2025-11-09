import { NextRequest, NextResponse } from "next/server";
import type { GeocodeResult } from "@/lib/types";

/**
 * Geocode a city name to coordinates
 * GET /api/geocode?city=Boston,MA
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Geocoding API not configured" },
        { status: 500 }
      );
    }

    // Use Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      city
    )}&key=${apiKey}`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const { lat, lng } = result.geometry.location;

    // Get timezone for the location
    const timezoneUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(
      Date.now() / 1000
    )}&key=${apiKey}`;

    const timezoneResponse = await fetch(timezoneUrl);
    const timezoneData = await timezoneResponse.json();

    const geocodeResult: GeocodeResult = {
      city: result.formatted_address,
      latitude: lat,
      longitude: lng,
      timezone: timezoneData.timeZoneId || "UTC",
      formattedAddress: result.formatted_address,
    };

    return NextResponse.json(geocodeResult);
  } catch (error) {
    console.error("Geocode error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Geocoding failed",
      },
      { status: 500 }
    );
  }
}
