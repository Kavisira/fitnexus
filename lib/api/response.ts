import { NextResponse } from "next/server";

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown | null;
  timestamp: string;
};

export function successResponse<T>(
  data: T,
  message = "Request successful",
  status = 200
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

export function errorResponse(
  message = "Something went wrong",
  status = 500,
  errors: unknown = null
) {
  const response: ApiResponse = {
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}