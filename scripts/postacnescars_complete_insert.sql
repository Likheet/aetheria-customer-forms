BEGIN;

INSERT INTO public.concern_subtype (concern, code, label, description, created_at, updated_at)
SELECT 'acnescars'::concern_key, 'IcePick', 'Ice Pick Scars', 'Small, shallow, round or pitted scars that create a depressed appearance', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM concern_subtype WHERE concern='acnescars'::concern_key AND code='IcePick')
UNION ALL
SELECT 'acnescars'::concern_key, 'Rolling', 'Rolling Scars', 'Broad, shallow depressions with sloping edges that create an undulating surface', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM concern_subtype WHERE concern='acnescars'::concern_key AND code='Rolling')
UNION ALL
SELECT 'acnescars'::concern_key, 'PostInflammatoryPigmentation', 'Post-inflammatory Pigmentation', 'Flat or slightly raised dark marks from inflammation (not true scars)', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM concern_subtype WHERE concern='acnescars'::concern_key AND code='PostInflammatoryPigmentation')
UNION ALL
SELECT 'acnescars'::concern_key, 'Keloid', 'Keloid / Hypertrophic Scars', 'Raised, thick scars that extend beyond the original acne area', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM concern_subtype WHERE concern='acnescars'::concern_key AND code='Keloid');

INSERT INTO public.matrix_entry (concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks, created_at, updated_at)
SELECT
  'acnescars'::concern_key,
  cs.id,
  skin_type_entry.skin_type,
  skin_type_entry.band::band_key,
  skin_type_entry.cleanser_id,
  skin_type_entry.core_serum_id,
  skin_type_entry.secondary_serum_id,
  skin_type_entry.moisturizer_id,
  skin_type_entry.sunscreen_id,
  skin_type_entry.remarks,
  NOW(),
  NOW()
FROM concern_subtype cs
CROSS JOIN (
  SELECT 'Dry' AS skin_type, 'blue' AS band,
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid AS cleanser_id,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid AS core_serum_id,
    NULL::uuid AS secondary_serum_id,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid AS moisturizer_id,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid AS sunscreen_id,
    'Ice pick: Gentle cleanser + salicylic acid + hydrating moisturizer' AS remarks
  UNION ALL
  SELECT 'Dry', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick moderate: Add secondary salicylic serum'
  UNION ALL
  SELECT 'Dry', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick severe: Emphasize barrier repair'
  UNION ALL
  SELECT 'Combo', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Ice pick combo: Balanced routine'
  UNION ALL
  SELECT 'Combo', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick moderate combo: Dual salicylic approach'
  UNION ALL
  SELECT 'Combo', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick severe combo: Maximum support'
  UNION ALL
  SELECT 'Oily', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Ice pick oily: Oil-control focus'
  UNION ALL
  SELECT 'Oily', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick moderate oily: Dual treatment'
  UNION ALL
  SELECT 'Oily', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick severe oily: Intensive care'
  UNION ALL
  SELECT 'Sensitive', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'aebfccd1-33d2-41fd-995d-c3bcc548a7dc'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Ice pick sensitive: Lower concentration'
  UNION ALL
  SELECT 'Sensitive', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'aebfccd1-33d2-41fd-995d-c3bcc548a7dc'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick moderate sensitive: Barrier support'
  UNION ALL
  SELECT 'Sensitive', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'aebfccd1-33d2-41fd-995d-c3bcc548a7dc'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick severe sensitive: Minimal actives'
  UNION ALL
  SELECT 'Normal', 'blue',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Ice pick normal: Standard regimen'
  UNION ALL
  SELECT 'Normal', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick moderate normal: Dual serum'
  UNION ALL
  SELECT 'Normal', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid,
    '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Ice pick severe normal: Intensive support'
  UNION ALL
  SELECT 'Combo', 'blue',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Rolling combo mild: Glycolic start'
  UNION ALL
  SELECT 'Combo', 'yellow',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling combo moderate: Dual exfoliant'
  UNION ALL
  SELECT 'Combo', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling combo severe: Maximum exfoliation'
  UNION ALL
  SELECT 'Oily', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Rolling oily mild: Glycolic focus'
  UNION ALL
  SELECT 'Oily', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling oily moderate: Dual treatment'
  UNION ALL
  SELECT 'Oily', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid,
    '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling oily severe: Intensive'
  UNION ALL
  SELECT 'Dry', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Rolling dry mild: Gentle lactic'
  UNION ALL
  SELECT 'Dry', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling dry moderate: Dual lactic'
  UNION ALL
  SELECT 'Dry', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling dry severe: Barrier + lactic'
  UNION ALL
  SELECT 'Sensitive', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Rolling sensitive mild: Gentle approach'
  UNION ALL
  SELECT 'Sensitive', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling sensitive moderate: Barrier support'
  UNION ALL
  SELECT 'Sensitive', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling sensitive severe: Minimal treatment'
  UNION ALL
  SELECT 'Normal', 'blue',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Rolling normal mild: Standard lactic'
  UNION ALL
  SELECT 'Normal', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling normal moderate: Dual lactic'
  UNION ALL
  SELECT 'Normal', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid,
    'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Rolling normal severe: Intensive support'
  UNION ALL
  SELECT 'Dry', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red dry mild: Azelaic + tinted SPF'
  UNION ALL
  SELECT 'Dry', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '107b457d-5c34-4e58-9f2b-c39570fb3d30'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red dry moderate: Dual azelaic'
  UNION ALL
  SELECT 'Dry', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '80e57371-c8d4-413e-96d2-51e53e173447'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red dry severe: Triple azelaic + barrier'
  UNION ALL
  SELECT 'Combo', 'blue',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red combo mild: Azelaic balanced'
  UNION ALL
  SELECT 'Combo', 'yellow',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '107b457d-5c34-4e58-9f2b-c39570fb3d30'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red combo moderate: Dual azelaic'
  UNION ALL
  SELECT 'Combo', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '80e57371-c8d4-413e-96d2-51e53e173447'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red combo severe: Intensive azelaic'
  UNION ALL
  SELECT 'Oily', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red oily mild: Azelaic oil control'
  UNION ALL
  SELECT 'Oily', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '107b457d-5c34-4e58-9f2b-c39570fb3d30'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red oily moderate: Dual azelaic'
  UNION ALL
  SELECT 'Oily', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '80e57371-c8d4-413e-96d2-51e53e173447'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red oily severe: Intensive azelaic'
  UNION ALL
  SELECT 'Sensitive', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red sensitive mild: Gentle azelaic'
  UNION ALL
  SELECT 'Sensitive', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '107b457d-5c34-4e58-9f2b-c39570fb3d30'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red sensitive moderate: Single azelaic + barrier'
  UNION ALL
  SELECT 'Sensitive', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red sensitive severe: Minimal actives'
  UNION ALL
  SELECT 'Normal', 'blue',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red normal mild: Standard azelaic'
  UNION ALL
  SELECT 'Normal', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '107b457d-5c34-4e58-9f2b-c39570fb3d30'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red normal moderate: Dual azelaic'
  UNION ALL
  SELECT 'Normal', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '80e57371-c8d4-413e-96d2-51e53e173447'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH red normal severe: Intensive azelaic'
  UNION ALL
  SELECT 'Dry', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown dry mild: Tranexamic start'
  UNION ALL
  SELECT 'Dry', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown dry moderate: Tranexamic + azelaic'
  UNION ALL
  SELECT 'Dry', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown dry severe: Dual treatment + barrier'
  UNION ALL
  SELECT 'Combo', 'blue',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown combo mild: Tranexamic balanced'
  UNION ALL
  SELECT 'Combo', 'yellow',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown combo moderate: Tranexamic + azelaic'
  UNION ALL
  SELECT 'Combo', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown combo severe: Intensive dual'
  UNION ALL
  SELECT 'Oily', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown oily mild: Tranexamic oil control'
  UNION ALL
  SELECT 'Oily', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown oily moderate: Dual treatment'
  UNION ALL
  SELECT 'Oily', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown oily severe: Intensive dual'
  UNION ALL
  SELECT 'Sensitive', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown sensitive mild: Gentle tranexamic'
  UNION ALL
  SELECT 'Sensitive', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown sensitive moderate: Single tranexamic + barrier'
  UNION ALL
  SELECT 'Sensitive', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown sensitive severe: Minimal actives'
  UNION ALL
  SELECT 'Normal', 'blue',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown normal mild: Standard tranexamic'
  UNION ALL
  SELECT 'Normal', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    '065e1f44-9a30-4349-bccb-74712693c08c'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown normal moderate: Dual treatment'
  UNION ALL
  SELECT 'Normal', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid,
    '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'PIH brown normal severe: Intensive dual'
  UNION ALL
  SELECT 'Dry', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Keloid dry mild: Silicon sheets + barrier'
  UNION ALL
  SELECT 'Dry', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid dry moderate: Rich moisturizer + SPF'
  UNION ALL
  SELECT 'Dry', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid dry severe: Maximum barrier support'
  UNION ALL
  SELECT 'Combo', 'blue',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Keloid combo mild: Balanced moisturizer'
  UNION ALL
  SELECT 'Combo', 'yellow',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid combo moderate: Oil-free moisturizer'
  UNION ALL
  SELECT 'Combo', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid combo severe: Reinforced barrier'
  UNION ALL
  SELECT 'Oily', 'blue',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Keloid oily mild: Lightweight moisturizer'
  UNION ALL
  SELECT 'Oily', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid oily moderate: Oil-free support'
  UNION ALL
  SELECT 'Oily', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid oily severe: Maximum control'
  UNION ALL
  SELECT 'Sensitive', 'blue',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Keloid sensitive mild: Gentle barrier'
  UNION ALL
  SELECT 'Sensitive', 'yellow',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid sensitive moderate: Rich support'
  UNION ALL
  SELECT 'Sensitive', 'red',
    '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid,
    NULL::uuid,
    NULL::uuid,
    'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid sensitive severe: Minimal intervention'
  UNION ALL
  SELECT 'Normal', 'blue',
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid,
    'Keloid normal mild: Standard care'
  UNION ALL
  SELECT 'Normal', 'yellow',
    '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid normal moderate: Moisturizer support'
  UNION ALL
  SELECT 'Normal', 'red',
    'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid,
    NULL::uuid,
    NULL::uuid,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid,
    '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid,
    'Keloid normal severe: Intensive support'
) AS skin_type_entry(skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks)
WHERE cs.concern = 'acnescars'::concern_key;

SELECT 'concern_subtype' AS table_name, COUNT(*) AS row_count FROM concern_subtype WHERE concern='acnescars'::concern_key
UNION ALL
SELECT 'matrix_entry', COUNT(*) FROM matrix_entry WHERE concern='acnescars'::concern_key;

COMMIT;
