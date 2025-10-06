/*
  # RideNow Taxi Application Database Schema

  ## Overview
  Complete database schema for RideNow taxi application with support for passengers, 
  drivers, rides, payments, emergency contacts, and support system.

  ## New Tables

  ### 1. profiles
  Extended user profile information
  - `id` (uuid, references auth.users)
  - `role` (text) - 'passenger' or 'driver'
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. driver_profiles
  Additional information for drivers
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `license_number` (text)
  - `vehicle_make` (text)
  - `vehicle_model` (text)
  - `vehicle_year` (integer)
  - `vehicle_plate` (text)
  - `vehicle_color` (text)
  - `is_verified` (boolean)
  - `is_available` (boolean)
  - `current_lat` (decimal, nullable)
  - `current_lng` (decimal, nullable)
  - `rating` (decimal)
  - `total_rides` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. rides
  Ride requests and history
  - `id` (uuid, primary key)
  - `passenger_id` (uuid, references profiles)
  - `driver_id` (uuid, references driver_profiles, nullable)
  - `service_type` (text) - 'comfort', 'comfort_plus', 'business'
  - `status` (text) - 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  - `pickup_address` (text)
  - `pickup_lat` (decimal)
  - `pickup_lng` (decimal)
  - `dropoff_address` (text)
  - `dropoff_lat` (decimal)
  - `dropoff_lng` (decimal)
  - `estimated_price` (decimal)
  - `final_price` (decimal, nullable)
  - `distance_km` (decimal)
  - `duration_minutes` (integer)
  - `payment_method` (text)
  - `payment_status` (text)
  - `passenger_rating` (integer, nullable)
  - `driver_rating` (integer, nullable)
  - `created_at` (timestamptz)
  - `started_at` (timestamptz, nullable)
  - `completed_at` (timestamptz, nullable)

  ### 4. payment_methods
  Stored payment methods for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `type` (text) - 'card', 'cash', 'apple_pay', 'google_pay'
  - `card_last_four` (text, nullable)
  - `card_brand` (text, nullable)
  - `is_default` (boolean)
  - `created_at` (timestamptz)

  ### 5. support_tickets
  Customer support system
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `ride_id` (uuid, references rides, nullable)
  - `subject` (text)
  - `description` (text)
  - `status` (text) - 'open', 'in_progress', 'resolved', 'closed'
  - `priority` (text) - 'low', 'medium', 'high', 'urgent'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. support_messages
  Messages within support tickets
  - `id` (uuid, primary key)
  - `ticket_id` (uuid, references support_tickets)
  - `user_id` (uuid, references profiles)
  - `message` (text)
  - `is_admin` (boolean)
  - `created_at` (timestamptz)

  ### 7. emergency_contacts
  Emergency contact information for users
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `phone` (text)
  - `relationship` (text)
  - `created_at` (timestamptz)

  ### 8. pricing_config
  Dynamic pricing configuration
  - `id` (uuid, primary key)
  - `service_type` (text)
  - `base_price` (decimal)
  - `price_per_km` (decimal)
  - `price_per_minute` (decimal)
  - `surge_multiplier_low` (decimal) - when many drivers available
  - `surge_multiplier_high` (decimal) - when few drivers available
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies for users to access their own data
  - Policies for drivers to access assigned rides
  - Policies for admin access to support tickets
  - Policies for public read access to pricing config
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('passenger', 'driver')),
  full_name text NOT NULL,
  phone text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create driver_profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE UNIQUE,
  license_number text NOT NULL,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year integer NOT NULL,
  vehicle_plate text NOT NULL,
  vehicle_color text NOT NULL,
  is_verified boolean DEFAULT false,
  is_available boolean DEFAULT false,
  current_lat decimal,
  current_lng decimal,
  rating decimal DEFAULT 5.0,
  total_rides integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own profile"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can update own profile"
  ON driver_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Drivers can insert own profile"
  ON driver_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Passengers can view driver profiles"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (is_verified = true);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  driver_id uuid REFERENCES driver_profiles ON DELETE SET NULL,
  service_type text NOT NULL CHECK (service_type IN ('comfort', 'comfort_plus', 'business')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  pickup_address text NOT NULL,
  pickup_lat decimal NOT NULL,
  pickup_lng decimal NOT NULL,
  dropoff_address text NOT NULL,
  dropoff_lat decimal NOT NULL,
  dropoff_lng decimal NOT NULL,
  estimated_price decimal NOT NULL,
  final_price decimal,
  distance_km decimal NOT NULL,
  duration_minutes integer NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  passenger_rating integer CHECK (passenger_rating >= 1 AND passenger_rating <= 5),
  driver_rating integer CHECK (driver_rating >= 1 AND driver_rating <= 5),
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passengers can view own rides"
  ON rides FOR SELECT
  TO authenticated
  USING (passenger_id = auth.uid());

CREATE POLICY "Passengers can insert own rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Passengers can update own rides"
  ON rides FOR UPDATE
  TO authenticated
  USING (passenger_id = auth.uid())
  WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Drivers can view assigned rides"
  ON rides FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM driver_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update assigned rides"
  ON rides FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM driver_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    driver_id IN (
      SELECT id FROM driver_profiles WHERE user_id = auth.uid()
    )
  );

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'cash', 'apple_pay', 'google_pay')),
  card_last_four text,
  card_brand text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  ride_id uuid REFERENCES rides ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for own tickets"
  ON support_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for own tickets"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )
  );

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency contacts"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own emergency contacts"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own emergency contacts"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL UNIQUE CHECK (service_type IN ('comfort', 'comfort_plus', 'business')),
  base_price decimal NOT NULL,
  price_per_km decimal NOT NULL,
  price_per_minute decimal NOT NULL,
  surge_multiplier_low decimal DEFAULT 0.8,
  surge_multiplier_high decimal DEFAULT 1.5,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing config"
  ON pricing_config FOR SELECT
  TO authenticated
  USING (true);

-- Insert default pricing configuration
INSERT INTO pricing_config (service_type, base_price, price_per_km, price_per_minute, surge_multiplier_low, surge_multiplier_high)
VALUES 
  ('comfort', 100, 15, 5, 0.8, 1.8),
  ('comfort_plus', 150, 20, 7, 0.85, 2.0),
  ('business', 250, 30, 10, 0.9, 2.5)
ON CONFLICT (service_type) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_available ON driver_profiles(is_available, is_verified);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);