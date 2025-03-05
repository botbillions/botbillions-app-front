// src/app/api/deriv-session/route.ts
"use server"

import { userDerivSession } from "@/services/actions/deriv-actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const urlSearch = requestUrl.search;

  try {
    const derivData = await userDerivSession(urlSearch);
    console.log("API - Deriv session data:", derivData);

    // Store in a cookie and redirect to /dashboard
    const response = NextResponse.redirect(new URL("/dashboard", requestUrl));
    response.cookies.set("derivData", JSON.stringify(derivData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("API - Failed to process Deriv session:", error);
    return NextResponse.json({ error: "Failed to process Deriv session" }, { status: 500 });
  }
}