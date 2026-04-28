export type Profile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department_id: string | null;
  job_title: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Space = {
  id: string;
  name: string;
  type: 'desk' | 'meeting_room' | 'parking_spot';
  capacity: number;
  resources: any;
  is_active: boolean;
  created_at: string;
};

export type Reservation = {
  id: string;
  user_id: string;
  space_id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'cancelled';
  notes: string | null;
  vehicle_plate: string | null;
  needs_coffee: boolean;
  created_at: string;
};
