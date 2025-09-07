## Questions in the "Updated Client Consult" form

Below is a reference of every question asked by the Updated Client Consult form (the UI implemented in `src/components/UpdatedConsultForm.tsx`). Dynamic follow-up questions are listed under the option that triggers them.

### Section: Personal Information
- Name — "What is your full name?"
- Phone Number — "What is your phone number?"
- Date of Birth — "What is your date of birth?"
- Gender — "What is your gender?" (Male / Female / Other)

### Section A — Skin Basics
 - What do you think your skin type is? (Normal / Oily / Dry / Combination)
- How would you describe your skin's oil levels? SEBUM (aka oiliness)
  - Comfortable, no shine or greasiness → Green
  - Slight shine only in T-zone, not bothersome → Blue
  - Noticeable shine in multiple areas → Yellow
  - Very greasy/heavy shine across face, frequent blotting/wash needed → Red
- How would you describe your skin's hydration levels? MOISTURE (aka dryness)
  - Comfortable, no tightness → Green
  - Slight tightness or occasional dryness → Blue
  - Often feels tight, rough, or flaky → Yellow
  - Always feels very tight, itchy, or cracks/peels → Red
- Do you experience sensitivity? (Yes / No / Sometimes)
  - If "Sometimes": "Specify triggers (sun, actives, fragrance, pollution):" (text input)

### Section B — Current Skin History
- Do you have any diagnosed skin conditions? (textarea)
- Have you used prescription treatments? (textarea)
- Have you had professional treatments in the last 6 months? (textarea)

### Section C — Current Skincare Routine
- What products are you using daily? — repeated entries of Product name + How long? (product name uses autocomplete)
	- Product duration options: Less than 1 month, 1-3 months, 3-6 months, 6-12 months, 1-2 years, 2+ years
- Any product that caused irritation/breakouts/redness? (Specify) — tag/chip input with suggestions

### Section D — Main Concerns (customer picks 1–3)
- Main concerns list (choose up to 3): MARK EMPTY IF ANY CONCERN NOT CHOSEN
	- Acne ACNE 
	- Pigmentation PIGMENTATION_UV
	- Sensitivity SENSITIVITY
	- Fine lines & wrinkles (aging) TEXTURE but no value updation
	- Bumpy skin TEXTURE
	- Large pores PORES


When a concern is selected the form shows follow-up questions specific to that concern:

- Acne
	- What kind of breakouts do you usually notice? (Blackheads (tiny dark dots in pores), Whiteheads (small white bumps under the skin), Red pimples (inflamed, sometimes pus-filled), Large painful bumps (deep cystic acne), Mostly around jawline/chin, often before periods (hormonal))
	- Follow-up severity questions based on selected type:
		- Blackheads: A few, mostly on the nose (≤10) → Blue, Many in the T-zone (11–30) → Yellow, Widespread across face (30+) → Red
		- Whiteheads: A few, small area (≤10) → Blue, Many in several areas (11–20) → Yellow, Widespread across face (20+) → Red
		- Red Pimples: A few (1–3), mild → Blue, Several (4–10), some painful → Yellow, Many (10+), inflamed/widespread → Red
		- Cystic Acne: Rare (1 in last 2 weeks) → Blue, Frequent (1–3 per week) → Yellow, Persistent (4+ per week or multiple at once) → Red
		- Hormonal Acne: Mild monthly flare (1–3 pimples) → Blue, Clear monthly flare (several pimples/cyst lasting a week) → Yellow, Strong monthly flare (multiple cysts lasting >1 week) → Red

- Pigmentation
	- What type do you experience? (Red Pigmentation, Brown Pigmentation)
	- If red pigmentation: 
	   - Light red, only in a small area → Blue 
	   - Moderate red, noticeable in several zones → Yellow 
	   - Bright or deep red, widespread across the face → Red  

	- If brown pigmentation 
		- Light brown patches, visible up close but small in size → Blue 
		- Moderate brown spots/patches, noticeable in several areas → Yellow 
		- Dark brown patches, large or widespread across the face → Red 

- Redness / Sensitivity
	- Follow-up: Seven sensitivity questions (each is a choice, typically Yes/No):
	1. Do you often experience redness, burning, or stinging when using skincare products?
	2. Have you ever been diagnosed with sensitive skin, rosacea, or eczema?
	3. Does your skin get easily irritated by sun, heat, wind, or pollution?
	4. Have you noticed breakouts or irritation when using active ingredients (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?
	5. Do you have visible broken capillaries or flushing on your skin (cheeks, nose, etc.)?
	6. Are you under 20 years of age?
	7. Would you describe your skin baseline as very dry (tight, flaky, rough)?


- Fine lines & wrinkles
	- A few fine lines or slight looseness in some spots → Blue 
    - Wrinkles or sagging you can see in several areas → Yellow 
    - Deep wrinkles or sagging that’s easy to notice → Red 

- Large pores
	- Noticeable near the nose or small areas on close inspection → Blue 
    - Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow 
    - Large, obvious pores across much of the face, visible from a distance → Red 


### Section E — Lifestyle Inputs
- What type of diet do you follow? (Balanced, Oily/Spicy, Vegetarian, High Sugar)
- How much water do you typically drink daily? (Low, Medium, High)
- How many hours do you sleep on average? (Less than 5, 5-7, 7+)
- How would you rate your typical stress levels? (Low, Medium, High)
- What type of environment do you spend most time in? (Polluted city, Humid climate, Dry weather, Indoors A/C, Outdoors sun)

### Section F — Willingness & Preferences
- How many steps do you want in your skincare routine? (3-step, 4-step, 5+ step)
- How many serums are you comfortable using? (1, 2, 3)
- What texture do you prefer for your moisturizer? (Gel, Lotion, Cream, Rich Balm)
- What type of skincare approach do you prefer? (Natural, Minimal, Tech-driven, Active-based, Luxury)

### Additional / Misc fields
- Allergies (free text)
- Pregnancy / Breastfeeding (free text)
- Medications (free text)

Notes
- The "Irritating Products" field is implemented as a tag/chip input with autocomplete suggestions. Enter, comma, or Tab will create tags; tags can be removed by the × button.
- The Main Concerns selection dynamically injects follow-up steps. Pigmentation adds a "type" and "duration" step. Redness/Sensitivity injects the seven sensitivity questions. Other concerns add a single "type" step.


# Rule Based Questions:


## Decision Engine Rules (RULE_SPECS)

The decision engine reads a static rules spec at `src/lib/decisionRules.ts` and uses it to drive follow-ups and band updates. Below is a human-readable listing of all rules, so you can review and request edits. Notes:
- Category is “Sebum” everywhere (UI, flags, updates, mapping). The spec historically used the word “Grease”, but all updates/flags target the `sebum` metric and are shown as “Sebum: …”.
- “Dimension” only applies to Pigmentation (brown vs red).
- Outcomes use a simple when-grammar (AND/OR, equality, in {…}, includes/excludes, and numeric comparisons). See file comments for details.

Moisture
- Rule: `moisture_machineLow_customerNormal`
  - Trigger: Machine in {red,yellow} AND Customer in {green,blue}
  - Questions: none
  - Outcomes:
    - when: - → updates: Moisture: Blue (verdict: Machine dry vs user normal – treat as normal hydration)
- Rule: `moisture_machineNormal_customerDry`
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions:
    - Q2: Does skin feel tight all day even after moisturizer? (Yes/No)
    - Q3: Do you have visible flaking/rough patches? (Yes/No)
    - Q4: Current actives/meds in last 4 weeks? (Retinoids, BPO, AHA/BHA, Adapalene, Isotretinoin, None) [multi]
  - Outcomes:
    - Q2=Yes AND Q3=Yes → Moisture: Red; Verdict: TRUE DRY / COMPROMISED BARRIER (override machine; barrier repair focus)
    - Q2=Yes OR Q3=Yes OR Q4 includes Retinoids/Isotretinoin → Moisture: Yellow; Verdict: TRUE DRY / COMPROMISED BARRIER (override machine; barrier repair focus)
    - Q2=No AND Q3=No AND Q4 excludes Retinoids/Isotretinoin → Moisture: Blue; Verdict: NORMAL HYDRATION (trust machine)
    - Optional (only if we formalize a Q1 for product-film check): If Q1 indicates a film (e.g., heavy layers / cleansing residue) → Verdict: PRODUCT FILM AFFECTED; meanwhile still treat as DRY if Q2=Yes or Q3=Yes.

Sebum
- Rule: `sebum_machineNormal_customerOily`
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions:
    - Q1: How often do you blot/wash due to oil? (Never, 1–2x/day, ≥3x/day)
    - Q2: Is shine localized to T‑zone? (T‑zone, All over, No shine)
    - Q3: Used mattifying/clay/sheets within last 24h? (Yes/No)
    - Q5: Any mattifying primer/powder in last 8h? (Yes/No)
  - Outcomes:
    - Q1≥3x/day AND Q2=All over → Sebum: Red
    - Q1≥3x/day OR Q2=All over → Sebum: Yellow
    - Q2=T‑zone AND Q1=1–2x/day → Sebum: Yellow (verdict: COMBINATION)
    - If Q5=Yes (mattifying primer/powder used) OR Q3=Yes (recent mattifying/clay/sheets) → Verdict: PRODUCT FILM AFFECTED; still treat as Oily only if Q1≥3x/day OR Q2=All over
- Rule: `sebum_machineOily_customerNormal`
  - Trigger: Machine in {yellow,red} AND Customer in {green,blue}
  - Questions:
    - Q1: Shine within 2–4h after cleansing? (Yes/No)
    - Q2: Frequent blackheads/whiteheads? (Yes/No)
    - Q3: Using heavy creams/oils/sunscreens? (Yes/No)
  - Outcomes:
    - (Q1=Yes OR Q2=Yes) AND Q3=No → Sebum: Red
    - (Q1=Yes OR Q2=Yes) AND Q3=Yes → Sebum: Yellow
    - Q1=No AND Q2=No AND Q3=Yes → Sebum: Blue (product-induced shine)
    - Q1=No AND Q2=No AND Q3=No → Sebum: Green (possible lighting artifact)

Acne – Presence
- Rule: `acne_machinePresence_customerNone`
  - Trigger: Machine in {yellow,red} AND Customer in {green,blue}
  - Questions: Q1 (None/1–2/Several), Q2 (Yes/No), Q3 (Yes/No/NA), Q4 (Yes/No)
  - Outcomes:
    - Q1=1–2 OR Q3=Yes → Acne: Blue (verdict: ACNE – MILD; flags: hormonal if Q3=Yes)
    - Q2=Yes AND Q1 in {None,1–2} → Acne: Green (verdict: post‑acne marks; shift to pigmentation)
    - Q1=Several OR Q4=Yes → Acne: Yellow (flags: comedonal if Q4=Yes)
- Rule: `acne_machineClear_customerPresence`
  - Trigger: Machine in {green,blue} AND Customer in {yellow,red}
  - Questions: Q1 (None/1–5/6–15/≥15), Q2 (Yes/No), Q3 (None/<10/10–20/≥20), Q4 (Yes/No), Q5 (Yes/No/NA)
  - Outcomes:
    - Q2=Yes OR Q1≥15 → Acne: Red (flags: nodulocystic OR refer‑derm)
    - Q1=6–15 AND Q2=No → Acne: Yellow (flags: mild inflammatory)
    - Q1=1–5 AND Q3=<10 → Acne: Blue
    - Q1≥15 AND Q2=No → Acne: Red (flags: moderate inflammatory – pustular/papular after follow‑up)
    - Q1<5 AND Q3>10 → Acne: Yellow (flags: comedonal acne)
    - Q1<5 AND Q3<10 AND Q4=Yes → Acne: Blue (flags: situational acne)
    - Q5=Yes (Pregnancy/Breastfeeding) → Verdict: ACNE WITH PREGNANCY SAFETY FILTER (restrict high‑risk actives)
    - None of the above (0 inflamed, 0 comedones, no triggers) → Verdict: CLEAR SKIN (machine false positive likely)

Sensitivity
- Rule: `sensitivity_placeholder`
  - Trigger: Any machine/customer band
  - Notes: Refer to sensitivity questions and index (no direct updates specified here).

Pores
- Rule: `pores_machineHigh_customerNormal`
  - Trigger: Machine in {red,yellow} AND Customer in {green,blue}
  - Questions: Q1 (Yes/No), Q2 (Yes/No), Q3 (Low/Normal/High)
  - Outcomes:
    - Q1=Yes AND Q2=Yes AND Q3=High → Pores: Yellow
    - Q1=Yes OR Q2=Yes OR Q3=High → Pores: Blue
    - Q1=No AND Q2=No AND Q3 in {Low,Normal} → Pores: Green
- Rule: `pores_machineNormal_customerConcerned`
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions: Q1 (Yes/No), Q2 (Yes/No), Q3 (Yes/No)
  - Outcomes:
    - Q2=Yes OR Q3=Yes → Pores: Yellow
    - Q1=Yes AND Q2=No AND Q3=No → Pores: Green

Texture
- Rule: `texture_machineSmooth_customerAging`
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions: none
  - Outcomes:
    - age > 35 → Texture: Yellow (verdict: follow anti‑aging routine)
- Rule: `texture_machineSmooth_customerBumpy`
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions:
    - Q1: When you say “bumpy,” do you mean: (Pimples/breakouts, Tiny uneven dots (not pimples), Just feels uneven to touch)
    - Q2: Where do you notice this most? (Forehead, Chin, Cheeks, All over)
  - Outcomes:
    - Q1=Pimples / breakouts → Branch to Acne questions (route)
    - Q1=Tiny uneven dots AND Q2=Forehead → Ask about dandruff/oily scalp; if yes, recommend scalp analysis (verdict: consider scalp analysis)
    - Q1=Tiny uneven dots AND Q2 in {Chin, Cheeks, All over} → Texture: Yellow (verdict: clogged pores)
- Rule: `texture_machineBumpy_customerSmooth`
  - Trigger: Machine in {red,yellow} AND Customer in {green,blue}
  - Questions: Q1 (Cheeks/Chin/Forehead/Other/No), Q2 (Yes/No), Q3 (Yes/No)
  - Outcomes:
    - Q1 in {Chin, Cheeks, Other} → Pores: Yellow (verdict: clogged pores)
    - Q1=Forehead AND Q4=Yes (dandruff/oily scalp) → Recommend scalp analysis (remark)
    - Q2=Yes → Ask scar type (branch)
    - Q1=No AND Q2=No AND Q3=Yes (age > 40) → Texture: Yellow (verdict: anti-aging routine)

Pigmentation
- Rule: `pigmentation_machineHigh_customerNormal_brown` (dimension: brown)
  - Trigger: Machine in {red,yellow} AND Customer in {green,blue}
  - Questions: none
  - Outcomes: - → Pigmentation (Brown): Yellow
- Rule: `pigmentation_machineNormal_customerHigh_brown` (dimension: brown)
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions: none
  - Outcomes: - → Pigmentation (Brown): Yellow
- Rule: `pigmentation_machineNormal_customerHigh_red` (dimension: red)
  - Trigger: Machine in {green,blue} AND Customer in {red,yellow}
  - Questions: none
  - Outcomes: - → Pigmentation (Red): Yellow

Editing
- Edit the source of truth at `src/lib/decisionRules.ts`. The engine and UI consume these rules directly.
- If you change prompts/options/conditions, the follow-up pages and outcomes will update automatically without touching runtime code.
- If you want new categories or metrics, call them out and I can extend the mapper/evaluator safely.
