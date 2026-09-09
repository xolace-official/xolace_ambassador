-- Store the chosen social platform alongside the existing handle column
ALTER TABLE public.ambassadors
  ADD COLUMN IF NOT EXISTS social_platform TEXT;
