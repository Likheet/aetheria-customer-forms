-- ROLLBACK SCRIPT - Run this if the migration broke your database
-- This will restore the machine_analysis trigger to its working state

-- Step 1: Drop the broken trigger
DROP TRIGGER IF EXISTS trg_upsert_machine_analysis ON public.machine_scan;

-- Step 2: Drop the broken function
DROP FUNCTION IF EXISTS _upsert_machine_analysis_from_scan();

-- Step 3: Create a SIMPLE, WORKING version that duplicates texture to aging and bumpy
CREATE FUNCTION _upsert_machine_analysis_from_scan()
RETURNS TRIGGER AS $$
DECLARE
  v_metrics jsonb;
  v_texture numeric;
  v_texture_band text;
BEGIN
  -- Initialize variables
  v_metrics := COALESCE(NEW.metrics, '{}'::jsonb);
  
  -- Extract texture value and band from nested structure
  BEGIN
    v_texture := (v_metrics->'texture'->>'value')::numeric;
  EXCEPTION WHEN OTHERS THEN
    v_texture := NULL;
  END;
  
  BEGIN
    v_texture_band := v_metrics->'texture'->>'band';
  EXCEPTION WHEN OTHERS THEN
    v_texture_band := NULL;
  END;
  
  INSERT INTO public.machine_analysis (
    scan_id, session_id, checkid, customer_name, customer_phone, skin_age,
    moisture, moisture_band,
    sebum, sebum_band,
    texture, texture_band,
    texture_aging, texture_aging_band,
    texture_bumpy, texture_bumpy_band,
    pigmentation_uv, pigmentation_uv_band,
    redness, redness_band,
    pores, pores_band,
    acne, acne_band,
    uv_spots, uv_spots_band,
    brown_areas, brown_areas_band,
    sensitivity, sensitivity_band,
    created_at
  ) VALUES (
    NEW.id,
    NEW.session_id,
    NEW.checkid,
    NEW.customer_name,
    NEW.customer_phone,
    NEW.skin_age,
    (v_metrics->'moisture'->>'value')::numeric,
    v_metrics->'moisture'->>'band',
    (v_metrics->'sebum'->>'value')::numeric,
    v_metrics->'sebum'->>'band',
    v_texture,
    v_texture_band,
    v_texture,
    v_texture_band,
    v_texture,
    v_texture_band,
    (v_metrics->'pigmentation_uv'->>'value')::numeric,
    v_metrics->'pigmentation_uv'->>'band',
    (v_metrics->'redness'->>'value')::numeric,
    v_metrics->'redness'->>'band',
    (v_metrics->'pores'->>'value')::numeric,
    v_metrics->'pores'->>'band',
    (v_metrics->'acne'->>'value')::numeric,
    v_metrics->'acne'->>'band',
    (v_metrics->'uv_spots'->>'value')::numeric,
    v_metrics->'uv_spots'->>'band',
    (v_metrics->'brown_areas'->>'value')::numeric,
    v_metrics->'brown_areas'->>'band',
    (v_metrics->'sensitivity'->>'value')::numeric,
    v_metrics->'sensitivity'->>'band',
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (scan_id) DO UPDATE SET
    session_id = EXCLUDED.session_id,
    checkid = EXCLUDED.checkid,
    customer_name = EXCLUDED.customer_name,
    customer_phone = EXCLUDED.customer_phone,
    skin_age = EXCLUDED.skin_age,
    moisture = EXCLUDED.moisture,
    moisture_band = EXCLUDED.moisture_band,
    sebum = EXCLUDED.sebum,
    sebum_band = EXCLUDED.sebum_band,
    texture = EXCLUDED.texture,
    texture_band = EXCLUDED.texture_band,
    texture_aging = EXCLUDED.texture_aging,
    texture_aging_band = EXCLUDED.texture_aging_band,
    texture_bumpy = EXCLUDED.texture_bumpy,
    texture_bumpy_band = EXCLUDED.texture_bumpy_band,
    pigmentation_uv = EXCLUDED.pigmentation_uv,
    pigmentation_uv_band = EXCLUDED.pigmentation_uv_band,
    redness = EXCLUDED.redness,
    redness_band = EXCLUDED.redness_band,
    pores = EXCLUDED.pores,
    pores_band = EXCLUDED.pores_band,
    acne = EXCLUDED.acne,
    acne_band = EXCLUDED.acne_band,
    uv_spots = EXCLUDED.uv_spots,
    uv_spots_band = EXCLUDED.uv_spots_band,
    brown_areas = EXCLUDED.brown_areas,
    brown_areas_band = EXCLUDED.brown_areas_band,
    sensitivity = EXCLUDED.sensitivity,
    sensitivity_band = EXCLUDED.sensitivity_band,
    created_at = EXCLUDED.created_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the trigger
CREATE TRIGGER trg_upsert_machine_analysis
AFTER INSERT OR UPDATE OF metrics, customer_name, customer_phone, skin_age, checkid, session_id
ON public.machine_scan
FOR EACH ROW
EXECUTE FUNCTION _upsert_machine_analysis_from_scan();
