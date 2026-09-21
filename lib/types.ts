// Lead pipeline stages (same flow as before).
export type LeadStatus =
  | 'new'
  | 'overdue'
  | 'today'
  | 'followup'
  | 'inprocess'
  | 'converted'
  | 'dead';

export type UserRole = 'admin' | 'employee';

// A lead is exactly the website "Tell us about your business" form.
export interface Lead {
  id: string;
  slNo: number;
  date: string;
  name: string;          // Full name
  email: string;         // Work email
  mobileNumber: string;  // Phone
  company: string;
  teamSize: string;
  state?: string;
  district?: string;
  status: LeadStatus;
  // Team member this lead is assigned to (empty = unassigned).
  assignedTo?: string;
  // Follow-up date, set when a lead is moved to follow-up / today / overdue.
  followUpDate?: string;
  notes: Note[];
  // where the lead came from (website landing page, or "manual")
  source?: string;
  leadType?: 'website' | 'manual';
  createdAt: string;
}

export interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface User {
  id: string;
  slNo: number;
  name: string;
  email: string;
  username: string;
  password: string;
  // Viewable plain-text password (admin-only "show password" feature).
  // Empty for users created before this feature — reset once to populate it.
  passwordPlain?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  phone?: string;
  // Services + states this user handles — used to auto-assign new leads.
  services?: string[];
  states?: string[];
  createdAt: string;
}

export interface Blog {
  id: string;
  slNo: number;
  title: string;
  image: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
  createdAt: string;
  status: 'published' | 'draft';
  // website-facing fields
  category?: string;
  excerpt?: string;
  slug?: string;
  readTime?: string;
}

export type CareerType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

export interface Career {
  id: string;
  slNo: number;
  title: string;
  slug: string;
  department: string;
  type: CareerType;
  location: string;
  experience: string;
  description: string;
  tags: string[];
  status: 'open' | 'closed';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
