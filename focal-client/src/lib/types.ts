export type CreativeRole = '2d_artist' | '3d_designer' | 'architect' | 'other'
export const CREATIVE_ROLES: ReadonlyArray<{ value: CreativeRole; label: string }> = [
  { value: '2d_artist', label: '2D Artist' }, { value: '3d_designer', label: '3D Designer' },
  { value: 'architect', label: 'Architect' }, { value: 'other', label: 'Other' },
]
export interface Interest { interest_id: number; name: string }
export interface User {
  user_id: number; email: string; username: string; first_name: string; last_name: string;
  creative_role: CreativeRole; bio: string; interests: Interest[]; created_at: string; updated_at: string
}
export interface SignupInput {
  email: string; password: string; username: string; first_name: string; last_name: string; creative_role: CreativeRole
}
export interface ProfileInput {
  first_name?: string; last_name?: string; username?: string; bio?: string;
  creative_role?: CreativeRole; email?: string; current_password?: string
}
