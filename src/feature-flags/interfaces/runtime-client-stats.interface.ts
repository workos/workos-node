export interface RuntimeClientStats {
  pollCount: number;
  pollErrorCount: number;
  lastPollAt: Date | null;
  lastSuccessfulPollAt: Date | null;
  cacheAge: number | null;
  flagCount: number;
}
