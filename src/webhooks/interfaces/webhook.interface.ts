export interface Webhook {
  id: string;
  event: string;
  data: Record<string, any>;
}
