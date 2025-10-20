-- Add new columns to the people table for date of birth and a photo URL
ALTER TABLE public.people
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create a new storage bucket for person photos.
-- This makes it public so the images can be easily displayed on the cards.
INSERT INTO storage.buckets (id, name, public)
VALUES ('person_photos', 'person_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Add policies to allow your application to upload and view photos.
-- Make sure RLS is enabled for storage.objects in the Supabase dashboard.
CREATE POLICY "Allow public read access on person photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'person_photos');

CREATE POLICY "Allow authenticated users to upload person photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'person_photos');