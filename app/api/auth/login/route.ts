import { loginSchema } from "@/features/auth/validations/login.schema";
import { loginUser } from "@/lib/auth/auth.service";
import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = loginSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0] ?? null;

  const result = await loginUser({
    loginId: validation.data.loginId,
    password: validation.data.password,
    userAgent,
    ipAddress,
  });

  return successResponse(result, "Login successful");
});