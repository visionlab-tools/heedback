export interface AdminUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  isSuperAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: AdminUser
  token?: string
}

export interface CreateAdminUserPayload {
  email: string
  password: string
  name: string
}

export interface UpdateAdminUserPayload {
  email?: string
  name?: string
  avatarUrl?: string | null
  password?: string
}
