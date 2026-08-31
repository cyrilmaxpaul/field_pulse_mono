export interface Permission {
  key: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissionKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionKeys: string[];
}
