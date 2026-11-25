export interface Slot {
  doctor_id: string;
  doctor_name: string;
  starts_at_iso: string;
  label: string;
}

export interface AppointmentEmailPreview {
  patient: { subject: string; body: string };
  doctor: { subject: string; body: string };
}

export interface AppointmentConfirmed {
  doctorName: string;
  startsAt: string;
  label: string;
  emailPreview: AppointmentEmailPreview;
}

export interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  basedOn?: string[];
  isBookingIntent?: boolean;
  error?: "rate_limited" | "unavailable" | "network";
  slots?: Slot[];
  alternatives?: Slot[];
  selectedSlot?: Slot | null;
  confirmedAppointment?: AppointmentConfirmed | null;
  slotTakenNotice?: string | null;
}
