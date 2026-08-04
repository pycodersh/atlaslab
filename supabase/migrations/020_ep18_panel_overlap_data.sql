-- EP18 컷2·컷3 overlap layout data
-- c2 (id=415): left-aligned, z_index=1 (bottom panel)
-- c3 (id=417): right-aligned, z_index=2 (top panel), overlap_px=-60 pulls it up
UPDATE kp_panels SET layout = 'wide', align = 'left',  overlap_px = NULL, z_index = 1 WHERE id = 415;
UPDATE kp_panels SET layout = 'wide', align = 'right', overlap_px = -60,  z_index = 2 WHERE id = 417;
