export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}
