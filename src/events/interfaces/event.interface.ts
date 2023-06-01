export interface Event {
  id: string;
  event: string;
  created_at: string;
  data: Record<string, unknown>;
}
