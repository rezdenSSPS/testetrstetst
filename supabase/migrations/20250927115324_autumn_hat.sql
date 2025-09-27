/*
  # Airsoft Rental System Database Schema

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `name` (text) - název věci
      - `total_quantity` (integer) - celkové množství
      - `available_quantity` (integer) - dostupné množství
      - `created_at` (timestamp)
    - `people`
      - `id` (uuid, primary key)  
      - `name` (text) - jméno osoby
      - `created_at` (timestamp)
    - `loans`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `person_id` (uuid, foreign key)
      - `quantity` (integer) - půjčené množství
      - `notes` (text) - poznámky
      - `condition_photo` (text) - URL fotky stavu
      - `condition_notes` (text) - poznámky ke stavu
      - `loaned_at` (timestamp)
      - `returned_at` (timestamp, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (suitable for single-tablet use)
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 1,
  available_quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create people table  
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  person_id uuid REFERENCES people(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  notes text DEFAULT '',
  condition_photo text DEFAULT '',
  condition_notes text DEFAULT '',
  loaned_at timestamptz DEFAULT now(),
  returned_at timestamptz NULL
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read items"
  ON items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert items"
  ON items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update items"
  ON items FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can read people"
  ON people FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert people"
  ON people FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read loans"
  ON loans FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert loans"
  ON loans FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update loans"
  ON loans FOR UPDATE
  TO public
  USING (true);

-- Insert initial items
INSERT INTO items (name, total_quantity, available_quantity) VALUES
  ('Airsoft brýle', 5, 5),
  ('Zásobník M4 točný', 10, 10),
  ('Zásobník M4 tlačný', 8, 8);

-- Insert some initial people
INSERT INTO people (name) VALUES
  ('Admin'),
  ('Petr Novák'),
  ('Jana Svobodová'),
  ('Tomáš Dvořák');