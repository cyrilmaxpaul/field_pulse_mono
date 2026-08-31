import type { User } from "@prisma/client";

export function toUserDto(user: User) {
  return {
    id: user.id,
    organizationId: user.organizationId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
  };
}

export type UserDto = ReturnType<typeof toUserDto>;
