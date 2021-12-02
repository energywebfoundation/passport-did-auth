// interface is copied from iam-client-lib
export interface ClaimData extends Record<string, unknown> {
  profile?: any;
  claimType?: string;
  claimTypeVersion?: string;
}
