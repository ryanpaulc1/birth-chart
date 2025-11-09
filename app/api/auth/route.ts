import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/prokerala";

/**
 * Test endpoint to verify ProKerala OAuth is working
 * GET /api/auth
 */
export async function GET() {
  try {
    const token = await getAccessToken();

    return NextResponse.json({
      success: true,
      message: "Successfully authenticated with ProKerala API",
      tokenPreview: `${token.substring(0, 20)}...`,
    });
  } catch (error) {
    console.error("Auth error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
