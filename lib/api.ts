import { PasswordInput, PasswordResponse } from "@/types/password";

const API_URL = "https://ems-royal-password-checker-tm02.hf.space/predict";

export async function checkPasswordStrength(
  input: PasswordInput
): Promise<PasswordResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}
