export enum SocialProvider {
  GOOGLE,
}

export interface SocialLoginInput {
  provider: SocialProvider;
  token: string;
}
