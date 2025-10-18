# Quick Reference: Post Acne Scarring Feature

## 🎯 What's Done

| Component | Status | Details |
|-----------|--------|---------|
| Types | ✅ | 4 new fields, PostAcneScarringSubtype type |
| Decision Rules | ✅ | 4 rules for scar type → severity/color flow |
| Concern Matrix | ✅ | 'postacnescars' added as ConcernKey |
| Form UI | ✅ | Concern selection + 2-step follow-up |
| Validation | ✅ | Full validation for all paths |
| Build | ✅ | No TypeScript errors |
| Supabase Setup | ⏳ | Needs concern_subtype + concern_matrix entries |

## 🎮 User Flow

```
Pick "Post Acne Scarring" 
    ↓
Choose Type (4 options)
    ↓
Answer Details
├─ If PIH → pick color (Red/Brown/Both)
└─ If other → pick severity (Mild/Moderate/Severe)
    ↓
Get recommendations
```

## 📊 Form Fields

**On Selection:**
- `postAcneScarringType` - User's chosen type string

**After Severity Step:**
- `postAcneScarringSubtype` - Mapped to enum (IcePick|Rolling|PostInflammatoryPigmentation|Keloid)
- `postAcneScarringSeverity` - Blue/Yellow/Red (except PIH)
- `postAcneScarringColor` - Red/Brown/Both (only PIH)

## 🔍 Scar Types

| Type | Characteristics | Follow-up Question | Recommendation Focus |
|------|-----------------|-------------------|----------------------|
| **Ice Pick** | Small, shallow, round pits | Severity | Texture smoothing, resurfacing |
| **Rolling** | Broad, shallow depressions | Severity | Texture smoothing, resurfacing |
| **Post-inflammatory Pigmentation** | Flat/slightly raised dark marks | Color | Depigmenting or anti-inflammatory |
| **Keloid** | Raised, thick scars | Severity | Supportive only, refer professional |

## 📈 Severity Levels

| Band | Severity | Coverage | Recommendation |
|------|----------|----------|-----------------|
| **Blue** | Mild | <10% face | Supportive routine |
| **Yellow** | Moderate | 10-30% face | Active treatment routine |
| **Red** | Severe | >30% face | Professional treatment + supportive |

## 💊 Product Strategy

**For Depressed Scars (Ice Pick/Rolling):**
- Core: Resurfacing (AHA/BHA) or Brightening (Vit C, Niacinamide)
- Secondary: Complementary
- Focus: Cell turnover + texture improvement

**For PIH Red Marks:**
- Core: Anti-inflammatory (Azelaic, Niacinamide)
- Secondary: Soothing
- Focus: Reduce inflammation + fade marks

**For PIH Brown Marks:**
- Core: Depigmenting (Vitamin C, Tranexamic, Kojic)
- Secondary: Brightening
- Focus: Target pigmentation

**For Keloid:**
- Only for Blue/Yellow severity
- Red: Refer dermatologist
- Focus: Minimal routine, professional intervention

## 📋 SQL Needed

```sql
-- Step 1: Add subtypes
INSERT INTO concern_subtype (...) VALUES
('postacnescars', 'IcePick', ...),
('postacnescars', 'Rolling', ...),
('postacnescars', 'PostInflammatoryPigmentation', ...),
('postacnescars', 'Keloid', ...);

-- Step 2: Add ~60 matrix entries
INSERT INTO concern_matrix 
(concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, ...)
VALUES
('postacnescars', 'IcePick', 'Combo', 'blue', ...),
-- ... 59 more entries
```

See `scripts/postacnescars_supabase_setup.sql` for full SQL.

## 🧪 Quick Test

1. Open form
2. Select "Post Acne Scarring" from concerns
3. Verify it appears in concern priority screen
4. Answer scar type question
5. Answer severity/color question
6. Check that formData has all 4 fields set
7. Verify recommendations generate

## 🔑 Key Files

- **Frontend**: `src/components/UpdatedConsultForm.tsx`
- **Types**: `src/types.ts`
- **Rules**: `src/lib/decisionRules.ts`
- **Matrix**: `src/data/concernMatrix.ts`
- **Setup**: `scripts/postacnescars_supabase_setup.sql`
- **Docs**: `POSTACNE_*.md` files

## ⚠️ Important Notes

- **No machine bands**: Entirely user-reported
- **Sun protection**: SPF always in routine (PIH darkens with sun)
- **Red severity**: Always refer to professional treatments
- **Independent concern**: Can exist alongside active acne
- **2-step flow**: Type first, then details based on type

## 📞 Debugging

**Check these if something's wrong:**
- ✅ Are subtypes in concern_subtype table?
- ✅ Are matrix entries in concern_matrix table?
- ✅ Are product IDs valid in concern_matrix?
- ✅ Does form show "Post Acne Scarring" option?
- ✅ Does severity/color step appear correctly?
- ✅ Do recommendations look up the right matrix entries?

---

**Ready to deploy** after Supabase setup is complete.

