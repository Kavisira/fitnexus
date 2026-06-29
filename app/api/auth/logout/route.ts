import { logoutUser } from "@/lib/auth/auth.service";
import { apiHandler } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";

export const POST = apiHandler(async () => {
  const result = await logoutUser();

  return successResponse(
    result,
    result.loggedOut ? "Logout successful" : result.reason
  );
});