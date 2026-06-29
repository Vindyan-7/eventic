export interface Event {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  venue: string | null;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  is_paid: boolean;
  ticket_price: number;
  status: "draft" | "published" | "completed" | "cancelled";
  custom_questions?: any;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}