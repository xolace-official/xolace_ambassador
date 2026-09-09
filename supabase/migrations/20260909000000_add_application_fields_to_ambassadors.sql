-- Add ambassador application fields per program doc (location, school/community,
-- social handle, track interest, why Xolace)
ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS school_or_community TEXT,
  ADD COLUMN IF NOT EXISTS social_handle TEXT,
  ADD COLUMN IF NOT EXISTS track TEXT,
  ADD COLUMN IF NOT EXISTS why_xolace TEXT;
