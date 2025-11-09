import { NextRequest, NextResponse } from "next/server";
import {
  getNatalChart,
  getKundli,
  getPlanetPositions,
  formatBirthDateTime,
  formatCoordinates,
} from "@/lib/prokerala";

/**
 * Generate birth chart data
 * POST /api/birth-chart
 *
 * Body: {
 *   name: string;
 *   date: string; // YYYY-MM-DD
 *   time: string; // HH:MM
 *   location: {
 *     city: string;
 *     latitude: number;
 *     longitude: number;
 *     timezone: string;
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, time, location } = body;

    // Validate required fields
    if (!name || !date || !time || !location?.latitude || !location?.longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format parameters for ProKerala API
    const datetime = formatBirthDateTime(date, time, location.timezone);
    const coordinates = formatCoordinates(location.latitude, location.longitude);

    console.log("Fetching natal chart:", { datetime, coordinates });

    // Fetch birth details, kundli, and planet positions
    const [birthDetails, kundliData, planetData] = await Promise.all([
      getNatalChart({ datetime, coordinates }),
      getKundli({ datetime, coordinates }),
      getPlanetPositions({ datetime, coordinates }),
    ]);

    console.log("Planet positions data:", JSON.stringify(planetData, null, 2));

    // Generate a unique ID for this chart (in production, save to database)
    const chartId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Return combined chart data
    return NextResponse.json({
      success: true,
      chartId,
      name,
      birthDetails,
      kundli: kundliData,
      planets: planetData,
    });
  } catch (error) {
    console.error("Birth chart error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
