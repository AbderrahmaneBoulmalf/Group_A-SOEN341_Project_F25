export interface Event {
  id: string;
  title: string;
  date: string;
  organization: string;
  description?: string;
  location?: string;
  category?: string;
  // Enhanced fields for richer templates
  capacity?: number;
  price?: number;
  imageUrl?: string;
  longDescription?: string;
  requirements?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  isOnline?: boolean;
  meetingLink?: string;
}
