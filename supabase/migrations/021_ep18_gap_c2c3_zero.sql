-- EP18: gap between 컷2(id=415) and 컷3(id=417) — remove whitespace
-- Gap id=416 (order_num=5) has no speech bubbles; zero its height so the
-- overlap_px=-60 on panel id=417 creates a clean visual overlap.
UPDATE kp_panels SET height_ratio = 0 WHERE id = 416;
