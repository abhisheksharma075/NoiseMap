export type NoiseZoneType = 'residential' | 'commercial' | 'industrial' | 'silence';

export type NoiseSourceType =
  | 'traffic'
  | 'construction'
  | 'loudspeaker'
  | 'industrial'
  | 'aircraft'
  | 'siren'
  | 'unknown';

export interface NoiseReading {
  id: string;
  session_id: string;
  lat: number;
  lng: number;
  grid_id: string; // e.g. "26.144_91.736"
  db_avg: number;
  db_peak: number;
  source_type: NoiseSourceType;
  zone_type: NoiseZoneType;
  created_at: string;
}

export interface NoiseIncident {
  id: string;
  grid_id: string;
  center_lat: number;
  center_lng: number;
  location_name: string;
  started_at: string;
  last_seen_at: string;
  duration_min: number;
  avg_db: number;
  peak_db: number;
  reading_count: number;
  unique_users: number;
  dominant_source: NoiseSourceType;
  evidence_score: number; // 0-100%
  status: 'active' | 'resolved';
  created_at: string;
}

export interface UserPin {
  id: string;
  session_id: string;
  label: 'home' | 'school' | 'work' | string;
  lat: number;
  lng: number;
  threshold_db: number;
  created_at: string;
}

export interface StatutoryComplaint {
  id: string;
  incident_id: string;
  reference_number: string;
  location_text: string;
  avg_db: number;
  peak_db: number;
  duration_min: number;
  reading_count: number;
  unique_users: number;
  dominant_source: string;
  generated_at: string;
  status: 'generated' | 'filed';
}

export interface UserStreak {
  session_id: string;
  total_readings: number;
  verified_readings: number;
  current_streak: number;
  badge_level: 'newcomer' | 'noise_watcher' | 'community_sensor' | 'noise_guardian';
  last_reading: string;
}

export interface UserAlert {
  id: string;
  session_id: string;
  incident_id: string;
  pin_id: string;
  threshold_db: number;
  sent_at: string;
  title: string;
  message: string;
}
