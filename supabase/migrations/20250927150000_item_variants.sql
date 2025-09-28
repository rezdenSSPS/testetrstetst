-- supabase/migrations/20250927150000_item_variants.sql

-- 1. Create the new item_variants table
CREATE TABLE IF NOT EXISTS public.item_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS and add policies for the new table
ALTER TABLE public.item_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on item_variants" ON public.item_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on item_variants" ON public.item_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on item_variants" ON public.item_variants FOR UPDATE USING (true);

-- 3. Add a new column to the 'loans' table to link to a specific variant
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.item_variants(id) ON DELETE SET NULL;

-- 4. (Optional) Add sample data for variants
-- First, find the ID of the 'Kuličky' item if it exists
DO $$
DECLARE
    kulicky_id uuid;
BEGIN
    SELECT id INTO kulicky_id FROM public.items WHERE name = 'Zásobník M4 tlačný' LIMIT 1;

    -- If the item was found, insert variants for it
    IF kulicky_id IS NOT NULL THEN
        -- Set the main item's quantity to 0, as stock will be managed by variants
        UPDATE public.items SET total_quantity = 0, available_quantity = 0 WHERE id = kulicky_id;

        -- Insert the variants
        INSERT INTO public.item_variants (item_id, name, total_quantity, available_quantity) VALUES
          (kulicky_id, '0.20g standard', 5000, 5000),
          (kulicky_id, '0.25g standard', 5000, 5000),
          (kulicky_id, '0.25g tracer', 2000, 2000)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
