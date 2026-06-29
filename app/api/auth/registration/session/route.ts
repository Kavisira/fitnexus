import { apiHandler } from "@/lib/api/handler";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createRegistrationSessionSchema } from "@/features/auth/validations/create-registration-session.schema";
import { createRegistrationSession } from "@/lib/auth/registration-session.service";

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();

  const validation = createRegistrationSessionSchema.safeParse(body);

  if (!validation.success) {
    return errorResponse(
      "Validation failed",
      400,
      validation.error.flatten().fieldErrors
    );
  }

  const result = await createRegistrationSession(validation.data);

  return successResponse(
    result,
    "Registration session created successfully",
    201
  );
});