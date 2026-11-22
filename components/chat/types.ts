export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  basedOn?: string[];
  isBookingIntent?: boolean;
  error?: "rate_limited" | "unavailable" | "network";
}
