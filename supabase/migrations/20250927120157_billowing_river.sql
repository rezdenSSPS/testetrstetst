/*
  # Create rental system tables

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `total_quantity` (integer)
      - `available_quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `people`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    - `loans`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key to items)
      - `person_id` (uuid, foreign key to people)
      - `quantity` (integer)
      - `notes` (text)
      - `condition_photo` (text)
      - `condition_notes` (text)
      - `loaned_at` (timestamp)
      - `returned_at` (timestamp, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is an internal system)

  3. Sample Data
    - Insert initial airsoft equipment
    - Insert sample people
*/

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 1,
  available_quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create people table
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  notes text DEFAULT '',
  condition_photo text DEFAULT '',
  condition_notes text DEFAULT '',
  loaned_at timestamp with time zone DEFAULT now(),
  returned_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on items" ON public.items FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on people" ON public.people FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on people" ON public.people FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on loans" ON public.loans FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on loans" ON public.loans FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on loans" ON public.loans FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for items table
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial airsoft equipment
INSERT INTO public.items (name, total_quantity, available_quantity) VALUES
  ('Airsoft brýle', 5, 5),
  ('Zásobník M4 točný', 10, 10),
  ('Zásobník M4 tlačný', 15, 15)
ON CONFLICT DO NOTHING;

-- Insert sample people
INSERT INTO public.people (name) VALUES
  ('Jan Novák'),
  ('Petr Svoboda'),
  ('Marie Dvořáková'),
  ('Tomáš Černý')
ON CONFLICT DO NOTHING;