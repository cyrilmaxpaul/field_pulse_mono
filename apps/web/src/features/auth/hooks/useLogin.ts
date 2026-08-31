import { useMutation } from "@tanstack/react-query";
import { login } from "../api/authApi";
import { setAuthenticatedUser } from "../../../stores/authStore";
import type { LoginFormValues } from "../schemas/loginSchema";

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: (data) => {
      setAuthenticatedUser(data.user, data.accessToken);
    },
  });
}
