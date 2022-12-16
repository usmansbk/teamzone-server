import { Prisma } from "@prisma/client";

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

export interface Recurrence {
  interval: number;
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
}

export interface UserPayload {
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl?: string;
  locale?: string;
  emailVerified: boolean;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  locale: string;
  timezone: string;
}

export interface CreateMeetingInput {
  title: string;
  timezone: string;
  from: string;
  to: string;
  description: string;
  teamIds: string[];
  repeat?: Prisma.JsonObject;
}

export interface UpdateMeetingInput {
  id: string;
  title: string;
  timezone: string;
  from: string;
  to: string;
  description: string;
  teamIds: string[];
  repeat?: Prisma.JsonObject;
}
