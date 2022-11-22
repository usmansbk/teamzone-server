export type AuthStrategy = "owner";

export interface AuthRule {
  allow: AuthStrategy;
  identityClaim: string;
  ownerField: string;
}

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput extends CreateTeamInput {
  id: string;
}
