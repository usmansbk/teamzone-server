export type AuthStrategy = "owner";

export interface AuthRule {
  allow: AuthStrategy;
  identityClaim: string;
}

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput extends CreateTeamInput {
  id: string;
}

export type SocialProvider = "GOOGLE" | "GITHUB";

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl?: string;
  locale?: string;
  emailVerified: boolean;
}
