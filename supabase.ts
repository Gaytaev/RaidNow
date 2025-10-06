import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  role: 'passenger' | 'driver';
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_plate: string;
  vehicle_color: string;
  is_verified: boolean;
  is_available: boolean;
  current_lat?: number;
  current_lng?: number;
  rating: number;
  total_rides: number;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  passenger_id: string;
  driver_id?: string;
  service_type: 'comfort' | 'comfort_plus' | 'business';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  estimated_price: number;
  final_price?: number;
  distance_km: number;
  duration_minutes: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  passenger_rating?: number;
  driver_rating?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'cash' | 'apple_pay' | 'google_pay';
  card_last_four?: string;
  card_brand?: string;
  is_default: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  ride_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
}

export interface PricingConfig {
  id: string;
  service_type: 'comfort' | 'comfort_plus' | 'business';
  base_price: number;
  price_per_km: number;
  price_per_minute: number;
  surge_multiplier_low: number;
  surge_multiplier_high: number;
  updated_at: string;
}
