import type { AuthUser } from "../../../stores/authStore";

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
