export interface WorkOSException extends Error {
  readonly docsUrl: string;
  readonly status: number;
}
