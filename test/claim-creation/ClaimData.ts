// interface is copied from iam-client-lib
export interface ClaimData extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
  claimType?: string;
  claimTypeVersion?: number;
}
