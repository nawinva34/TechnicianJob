
export type UserRole = 'superadmin' | 'admin' | 'technician';

export type JobStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Profile {
  id: string;
  line_user_id: string | null;
  name: string;
  phone: string | null;
  role: UserRole;
  skills: string[];
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string | null;
  category: string;
  customer_phone: string | null;
  location_name: string | null;
  google_maps_url: string | null;
  budget: number | null;
  status: JobStatus;
  assigned_technician_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assigned_technician?: Profile | null;
  creator?: Profile | null;
}

export interface JobLog {
  id: string;
  job_id: string;
  changed_by: string | null;
  status_changed_to: JobStatus;
  photo_url: string | null;
  notes: string | null;
  timestamp: string;
  changer?: Profile | null;
}

export interface CreateJobRequest {
  title: string;
  description?: string;
  category: string;
  customer_phone?: string;
  location_name?: string;
  google_maps_url?: string;
  budget?: number;
}

export interface ClaimJobRequest {
  job_id: string;
  tech_id: string;
}

export interface ClaimJobResponse {
  success: boolean;
  message: string;
  job?: Job;
}

export interface JobStats {
  open: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

export interface LineEvent {
  type: string;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  timestamp: number;
  replyToken?: string;
  message?: {
    type: string;
    id: string;
    text?: string;
  };
}
