import { getCurrentUser } from "@/lib/auth/auth.service";
import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";

export const GET = apiHandler(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return errorResponse("Unauthorized", 401);
  }

  return successResponse(user, "Current user fetched successfully");
});