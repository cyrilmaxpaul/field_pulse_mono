export interface UserRoleRef {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  lastLoginAt: string | null;
  roles: UserRoleRef[];
  createdAt: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds: string[];
}
