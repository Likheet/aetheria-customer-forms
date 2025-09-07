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
- Main concerns list (choose up to 3):
	- Acne ACNE (mark green if acne not chosen)
	- Pigmentation PIGMENTATION_UV
	- Sensitivity SENSITIVITY
	- Dullness TREAT AS BROWN PIGMENTATION IF MARKED AS PRIORITY
	- Fine lines & wrinkles (aging) TEXTURE
	- Bumpy TEXTURE ADD 
	- Large pores PORES
	- Oiliness REMOVE
	- Dryness REMOVE

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
	- What type do you experience? (Red, Brown)
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

- Oiliness
	- What type do you experience? (T-zone only, Cheeks + T-zone, All over) REMOVE AS IT IS ASKED IN THE BEGINNING

- Dryness
	- What type do you experience? (Tight/rough, Flaky, Cracks/peels) REMOVE AS IT IS ASKED IN THE BEGINNING

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

