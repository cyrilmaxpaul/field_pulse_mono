import type { Role, User, UserRole } from "@prisma/client";

type UserWithRoles = User & { userRoles: (UserRole & { role: Role })[] };

export function toUserSummaryDto(user: UserWithRoles) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    roles: user.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    createdAt: user.createdAt,
  };
}
