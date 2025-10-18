/*
  # Furniture Configurator Database Schema

  This migration creates the database structure for a modular furniture configurator application.

  ## New Tables

  ### `module_types`
  Stores the different types of furniture modules available in the catalog.
  - `id` (text, primary key) - Unique identifier for the module type
  - `name` (text) - Display name of the module
  - `base_price` (integer) - Base price in cents
  - `dimensions` (jsonb) - Width, height, and depth dimensions
  - `connection_rules` (jsonb) - Which sides can connect to other modules
  - `blocks_connections` (text[]) - Sides that become blocked when this module is attached
  - `created_at` (timestamptz) - Record creation timestamp

  ### `materials`
  Stores available material options for furniture modules.
  - `id` (text, primary key) - Unique identifier for the material
  - `name` (text) - Display name of the material
  - `color` (text) - Hex color code
  - `price_modifier` (integer) - Additional price in cents
  - `type` (text) - Material type (fabric, leather, velvet)
  - `created_at` (timestamptz) - Record creation timestamp

  ### `saved_configurations`
  Stores user-created furniture configurations.
  - `id` (uuid, primary key) - Unique identifier for the configuration
  - `user_id` (uuid, nullable) - Reference to auth.users if user is logged in
  - `name` (text) - User-given name for the configuration
  - `modules` (jsonb) - Array of placed modules with positions and materials
  - `total_price` (integer) - Calculated total price in cents
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Security

  - Enable Row Level Security (RLS) on all tables
  - Public read access for module_types and materials (catalog data)
  - Authenticated users can create and manage their own saved configurations
  - Unauthenticated users can read module types and materials but cannot save configurations

  ## Notes

  - Prices are stored in cents to avoid floating point issues
  - JSONB is used for flexible schema for dimensions and connection rules
  - Configurations can be saved by authenticated users for later retrieval
*/

CREATE TABLE IF NOT EXISTS module_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  base_price integer NOT NULL DEFAULT 0,
  dimensions jsonb NOT NULL DEFAULT '{"width": 1, "height": 0.5, "depth": 1}'::jsonb,
  connection_rules jsonb NOT NULL DEFAULT '{"left": true, "right": true, "front": false, "back": false}'::jsonb,
  blocks_connections text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL,
  price_modifier integer NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('fabric', 'leather', 'velvet')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE module_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view module types"
  ON module_types FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view materials"
  ON materials FOR SELECT
  USING (true);

CREATE POLICY "Users can view own configurations"
  ON saved_configurations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own configurations"
  ON saved_configurations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurations"
  ON saved_configurations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own configurations"
  ON saved_configurations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO module_types (id, name, base_price, dimensions, connection_rules, blocks_connections)
VALUES
  ('base-seat', 'Base Seat', 25000, '{"width": 1, "height": 0.5, "depth": 1}'::jsonb, '{"left": true, "right": true, "front": false, "back": false}'::jsonb, ARRAY[]::text[]),
  ('corner', 'Corner Module', 30000, '{"width": 1, "height": 0.5, "depth": 1}'::jsonb, '{"left": true, "right": true, "front": true, "back": false}'::jsonb, ARRAY[]::text[]),
  ('side-arm', 'Side Arm', 15000, '{"width": 0.2, "height": 0.7, "depth": 1}'::jsonb, '{"left": true, "right": false, "front": false, "back": false}'::jsonb, ARRAY['right']::text[]),
  ('ottoman', 'Ottoman', 20000, '{"width": 0.8, "height": 0.4, "depth": 0.8}'::jsonb, '{"left": false, "right": false, "front": false, "back": false}'::jsonb, ARRAY[]::text[]),
  ('chaise', 'Chaise Lounge', 40000, '{"width": 1, "height": 0.5, "depth": 1.5}'::jsonb, '{"left": true, "right": true, "front": false, "back": false}'::jsonb, ARRAY[]::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO materials (id, name, color, price_modifier, type)
VALUES
  ('fabric-grey', 'Grey Fabric', '#8B8B8B', 0, 'fabric'),
  ('fabric-beige', 'Beige Fabric', '#D4C5B9', 2500, 'fabric'),
  ('fabric-navy', 'Navy Fabric', '#2C3E50', 3000, 'fabric'),
  ('leather-brown', 'Brown Leather', '#8B4513', 15000, 'leather'),
  ('leather-black', 'Black Leather', '#1a1a1a', 18000, 'leather'),
  ('velvet-emerald', 'Emerald Velvet', '#50C878', 10000, 'velvet'),
  ('velvet-burgundy', 'Burgundy Velvet', '#800020', 12000, 'velvet')
ON CONFLICT (id) DO NOTHING;
