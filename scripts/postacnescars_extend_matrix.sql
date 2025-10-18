BEGIN;

INSERT INTO public.concern_subtype (concern, code, label, description, created_at, updated_at)
SELECT 'acnescars'::concern_key, 'PostInflammatoryPigmentation', 'Post-inflammatory Pigmentation', 'Flat or slightly raised dark marks from inflammation', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM concern_subtype WHERE concern='acnescars'::concern_key AND code='PostInflammatoryPigmentation');

INSERT INTO public.matrix_entry (concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks, created_at, updated_at)
WITH staged AS (
  SELECT 
    'IcePick' AS code,
    'blue' AS band,
    'Dry' AS skin_type,
    '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid AS cleanser_id,
    'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid AS core_serum_id,
    NULL::uuid AS secondary_serum_id,
    '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid AS moisturizer_id,
    '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid AS sunscreen_id,
    'Ice pick mild: Gentle cleanser + salicylic + hydrating moisturizer' AS remarks
  UNION ALL
  SELECT 'IcePick', 'blue', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Ice pick mild: Balanced routine'
  UNION ALL
  SELECT 'IcePick', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Ice pick mild: Oil control focus'
  UNION ALL
  SELECT 'IcePick', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'aebfccd1-33d2-41fd-995d-c3bcc548a7dc'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Ice pick mild: Lower concentration'
  UNION ALL
  SELECT 'IcePick', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Ice pick mild: Standard regimen'
  UNION ALL
  SELECT 'IcePick', 'red', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Ice pick severe: Dual salicylic + barrier support'
  UNION ALL
  SELECT 'IcePick', 'red', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Ice pick severe: Maximum support'
  UNION ALL
  SELECT 'IcePick', 'red', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Ice pick severe: Intensive care'
  UNION ALL
  SELECT 'IcePick', 'red', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'aebfccd1-33d2-41fd-995d-c3bcc548a7dc'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Ice pick severe sensitive: Minimal actives'
  UNION ALL
  SELECT 'IcePick', 'red', 'Normal', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'b55a562a-6015-4d90-a230-026dd9cf2506'::uuid, '97b2e95a-52d4-40aa-8795-5d3230c15e9c'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Ice pick severe: Intensive support'
  UNION ALL
  SELECT 'Rolling', 'blue', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Rolling mild: Gentle lactic acid'
  UNION ALL
  SELECT 'Rolling', 'blue', 'Combo', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, 'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Rolling mild: Glycolic start'
  UNION ALL
  SELECT 'Rolling', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Rolling mild: Glycolic focus'
  UNION ALL
  SELECT 'Rolling', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Rolling mild: Gentle approach'
  UNION ALL
  SELECT 'Rolling', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Rolling mild: Standard lactic'
  UNION ALL
  SELECT 'Rolling', 'red', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, 'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Rolling severe: Dual lactic + barrier'
  UNION ALL
  SELECT 'Rolling', 'red', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid, '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Rolling severe: Maximum exfoliation'
  UNION ALL
  SELECT 'Rolling', 'red', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'd7043c17-dd54-4176-b003-29eb13e2202f'::uuid, '5b20ba91-773a-4c2c-b45a-5eaa778f4899'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Rolling severe: Intensive'
  UNION ALL
  SELECT 'Rolling', 'red', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Rolling severe sensitive: Minimal treatment'
  UNION ALL
  SELECT 'Rolling', 'red', 'Normal', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'cdcece3a-44ae-49e8-9165-903da1db4f18'::uuid, 'd54e8727-1b30-4c00-a41e-fba7e28c5ef4'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Rolling severe: Intensive support'
  UNION ALL
  SELECT 'Keloid', 'blue', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Keloid mild: Barrier + silicon sheets'
  UNION ALL
  SELECT 'Keloid', 'blue', 'Combo', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Keloid mild: Balanced moisturizer'
  UNION ALL
  SELECT 'Keloid', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Keloid mild: Lightweight moisturizer'
  UNION ALL
  SELECT 'Keloid', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Keloid mild: Gentle barrier'
  UNION ALL
  SELECT 'Keloid', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'Keloid mild: Standard care'
  UNION ALL
  SELECT 'Keloid', 'yellow', 'Dry', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Keloid moderate: Rich moisturizer + SPF'
  UNION ALL
  SELECT 'Keloid', 'yellow', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Keloid moderate: Oil-free moisturizer'
  UNION ALL
  SELECT 'Keloid', 'yellow', 'Oily', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Keloid moderate: Oil-free support'
  UNION ALL
  SELECT 'Keloid', 'yellow', 'Sensitive', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Keloid moderate: Rich support'
  UNION ALL
  SELECT 'Keloid', 'yellow', 'Normal', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, 'f0ddd6fc-579b-4d6b-9c72-d13e652f9496'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'Keloid moderate: Moisturizer support'
  UNION ALL
  SELECT 'PIE', 'blue', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIE mild: Azelaic + tinted SPF'
  UNION ALL
  SELECT 'PIE', 'blue', 'Combo', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIE mild: Azelaic balanced'
  UNION ALL
  SELECT 'PIE', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIE mild: Azelaic oil control'
  UNION ALL
  SELECT 'PIE', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIE mild: Gentle azelaic'
  UNION ALL
  SELECT 'PIE', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIE mild: Standard azelaic'
  UNION ALL
  SELECT 'PIE', 'red', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '80e57371-c8d4-413e-96d2-51e53e173447'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIE severe: Dual azelaic + barrier'
  UNION ALL
  SELECT 'PIE', 'red', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '80e57371-c8d4-413e-96d2-51e53e173447'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIE severe: Intensive azelaic'
  UNION ALL
  SELECT 'PIE', 'red', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '80e57371-c8d4-413e-96d2-51e53e173447'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIE severe: Intensive azelaic'
  UNION ALL
  SELECT 'PIE', 'red', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIE severe sensitive: Minimal actives'
  UNION ALL
  SELECT 'PIE', 'red', 'Normal', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '80e57371-c8d4-413e-96d2-51e53e173447'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIE severe: Intensive azelaic'
  UNION ALL
  SELECT 'PIH', 'blue', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIH mild: Tranexamic start'
  UNION ALL
  SELECT 'PIH', 'blue', 'Combo', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIH mild: Tranexamic balanced'
  UNION ALL
  SELECT 'PIH', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIH mild: Tranexamic oil control'
  UNION ALL
  SELECT 'PIH', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIH mild: Gentle tranexamic'
  UNION ALL
  SELECT 'PIH', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIH mild: Standard tranexamic'
  UNION ALL
  SELECT 'PIH', 'red', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIH severe: Dual treatment + barrier'
  UNION ALL
  SELECT 'PIH', 'red', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIH severe: Intensive dual'
  UNION ALL
  SELECT 'PIH', 'red', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIH severe: Intensive dual'
  UNION ALL
  SELECT 'PIH', 'red', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIH severe sensitive: Minimal actives'
  UNION ALL
  SELECT 'PIH', 'red', 'Normal', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIH severe: Intensive dual'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'blue', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIP mild: Tranexamic start'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'blue', 'Combo', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIP mild: Tranexamic balanced'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'blue', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIP mild: Tranexamic oil control'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'blue', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIP mild: Gentle tranexamic'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'blue', 'Normal', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '2dd3bf55-5326-41e5-ac6d-9580fff1337d'::uuid, 'PIP mild: Standard tranexamic'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'yellow', 'Dry', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP moderate: Tranexamic + azelaic'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'yellow', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP moderate: Tranexamic + azelaic'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'yellow', 'Oily', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP moderate: Dual treatment'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'yellow', 'Sensitive', '93607af0-7d20-4615-b1ca-12ab4bfcc696'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP moderate: Single tranexamic + barrier'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'yellow', 'Normal', '12c39b2f-8ecc-493f-a691-8e6d0fc5b28d'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP moderate: Dual treatment'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'red', 'Dry', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP severe: Dual treatment + barrier'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'red', 'Combo', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP severe: Intensive dual'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'red', 'Oily', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, 'ce380a3a-fbb0-414f-8bcc-41cf69d9c7d9'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP severe: Intensive dual'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'red', 'Sensitive', '7db8e0ab-7f2a-4f84-9b8b-1611dd7e356a'::uuid, '065e1f44-9a30-4349-bccb-74712693c08c'::uuid, NULL::uuid, 'ac4c9798-1de5-4519-8d99-5093cc65a250'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP severe sensitive: Minimal actives'
  UNION ALL
  SELECT 'PostInflammatoryPigmentation', 'red', 'Normal', 'ffadad72-4430-4065-92cc-035f7e32d29e'::uuid, '1dbcb7e9-93e1-4c81-8385-ec77630205ae'::uuid, '4ddfbe6e-4a22-4ed7-858b-852f4af786d5'::uuid, '0e461356-b2ed-485a-ad64-d42e21800f19'::uuid, '72318b5a-097e-4eba-ada7-fa3d7899240e'::uuid, 'PIP severe: Intensive dual'
),
cs_map AS (
  SELECT id, code FROM concern_subtype WHERE concern = 'acnescars'::concern_key
)
SELECT
  'acnescars'::concern_key,
  cs_map.id,
  staged.skin_type::skin_type_key,
  staged.band::band_color,
  staged.cleanser_id,
  staged.core_serum_id,
  staged.secondary_serum_id,
  staged.moisturizer_id,
  staged.sunscreen_id,
  staged.remarks,
  NOW(),
  NOW()
FROM staged
JOIN cs_map ON cs_map.code = staged.code
ON CONFLICT (concern, subtype_id, skin_type, band) DO NOTHING;

SELECT 'concern_subtype' AS table_name, COUNT(*) AS row_count FROM concern_subtype WHERE concern='acnescars'::concern_key
UNION ALL
SELECT 'matrix_entry', COUNT(*) FROM matrix_entry WHERE concern='acnescars'::concern_key;

COMMIT;
