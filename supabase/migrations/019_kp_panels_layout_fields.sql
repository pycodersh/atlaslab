-- Add layout control fields to kp_panels
-- align: horizontal alignment of the panel image ('left' | 'center' | 'right')
-- overlap_px: negative value pulls this panel up to overlap the previous one
-- z_index: stacking order when panels overlap (higher = on top)
ALTER TABLE kp_panels
  ADD COLUMN IF NOT EXISTS align text,
  ADD COLUMN IF NOT EXISTS overlap_px integer,
  ADD COLUMN IF NOT EXISTS z_index integer;
