-- Add avatar_url column to ambassadors table
ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for ambassador profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ambassador-avatars',
  'ambassador-avatars',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload (no auth in this project)
CREATE POLICY "anon can upload ambassador avatars"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'ambassador-avatars');

-- Allow public read access to all avatar files
CREATE POLICY "ambassador avatars are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'ambassador-avatars');
