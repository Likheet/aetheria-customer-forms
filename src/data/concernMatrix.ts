import { supabase } from '../lib/supabase';
import { IngredientTag } from '../services/ingredientInteractions';

export type ConcernKey =
  | 'acne'
  | 'pigmentation'
  | 'pores'
  | 'texture'
  | 'sebum'
  | 'acnescars';

export type SkinTypeKey = 'Dry' | 'Combo' | 'Oily' | 'Sensitive' | 'Normal';
export type BandColor = 'green' | 'blue' | 'yellow' | 'red';

export type ProductSlot = 'cleanser' | 'coreSerum' | 'secondarySerum' | 'moisturizer' | 'sunscreen';

export interface ProductInfo {
  name: string;
  ingredientTags: IngredientTag[];
  ingredientKeywords: string[];
  defaultUsage?: 'am' | 'pm' | 'both';
  pregnancyUnsafe?: boolean;
  isotretinoinUnsafe?: boolean;
  barrierUnsafe?: boolean;
  notes?: string;
  isReferral?: boolean;
}

export interface MatrixProduct extends ProductInfo {
  slot: ProductSlot;
  rawName: string;
  isDynamic?: boolean;
}

export interface MatrixEntry {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
  cleanser: MatrixProduct;
  coreSerum: MatrixProduct;
  secondarySerum?: MatrixProduct | null;
  moisturizer: MatrixProduct;
  sunscreen: MatrixProduct;
  remarks?: string;
}

type ProductRegistry = Map<string, ProductInfo>;
type ProductSlotDefaults = Partial<Record<ProductSlot, string>>;

interface ProductRow {
  id: string;
  slug: string;
  display_name: string;
  brand: string | null;
  category: string | null;
  default_usage: 'am' | 'pm' | 'both' | null;
  pregnancy_unsafe: boolean | null;
  isotretinoin_unsafe: boolean | null;
  barrier_unsafe: boolean | null;
  is_referral: boolean | null;
  is_virtual: boolean | null;
  ingredient_keywords: string[] | null;
  notes: string | null;
}

interface AliasRow {
  product_id: string;
  alias: string;
}

interface ProductTagRow {
  product_id: string;
  tag_id: string;
}

interface SkinTypeDefaultRow {
  skin_type: SkinTypeKey;
  slot: ProductSlot;
  product_id: string;
}

interface MatrixEntryRow {
  id: string;
  concern: ConcernKey;
  subtype_id: string;
  skin_type: SkinTypeKey;
  band: BandColor;
  cleanser_id: string | null;
  core_serum_id: string | null;
  secondary_serum_id: string | null;
  moisturizer_id: string | null;
  sunscreen_id: string | null;
  remarks: string | null;
}

interface ConcernSubtypeRow {
  id: string;
  concern: ConcernKey;
  code: string;
}

interface LoadedProduct {
  id: string;
  slug: string;
  displayName: string;
  info: ProductInfo;
  isVirtual: boolean;
}

const productRegistry: ProductRegistry = new Map();
const productsById = new Map<string, LoadedProduct>();

let skinTypeDefaults: Record<SkinTypeKey, ProductSlotDefaults> = createEmptySkinTypeDefaults();

let matrixIndex: Record<
  ConcernKey,
  Record<string, Record<SkinTypeKey, Record<BandColor, MatrixEntry>>>
> = Object.create(null);

let loadState: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;

export async function loadConcernMatrixData(force = false): Promise<void> {
  if (loadState === 'loaded' && !force) return;
  if (loadState === 'loading' && loadPromise) return loadPromise;

  loadState = 'loading';

  const runner = async () => {
    clearCaches();

    const [productsResult, aliasResult, tagResult, skinDefaultsResult, subtypeResult, matrixResult] =
      await Promise.all([
        supabase
          .from('product')
          .select(
            [
              'id',
              'slug',
              'display_name',
              'brand',
              'category',
              'default_usage',
              'pregnancy_unsafe',
              'isotretinoin_unsafe',
              'barrier_unsafe',
              'is_referral',
              'is_virtual',
              'ingredient_keywords',
              'notes',
            ].join(', ')
          ),
        supabase.from('product_alias').select('product_id, alias'),
        supabase.from('product_ingredient_tag').select('product_id, tag_id'),
        supabase.from('skin_type_default').select('skin_type, slot, product_id'),
        supabase.from('concern_subtype').select('id, concern, code'),
        supabase.from('matrix_entry').select(
          [
            'id',
            'concern',
            'subtype_id',
            'skin_type',
            'band',
            'cleanser_id',
            'core_serum_id',
            'secondary_serum_id',
            'moisturizer_id',
            'sunscreen_id',
            'remarks',
          ].join(', ')
        ),
      ]);

    assertSupabaseResult(productsResult, 'product');
    assertSupabaseResult(aliasResult, 'product_alias');
    assertSupabaseResult(tagResult, 'product_ingredient_tag');
    assertSupabaseResult(skinDefaultsResult, 'skin_type_default');
    assertSupabaseResult(subtypeResult, 'concern_subtype');
    assertSupabaseResult(matrixResult, 'matrix_entry');

    const aliasMap = buildAliasMap(aliasResult.data ?? []);
    const tagMap = buildTagMap(tagResult.data ?? []);

    registerProducts(productsResult.data ?? [], aliasMap, tagMap);
    registerSkinTypeDefaults(skinDefaultsResult.data ?? []);
    matrixIndex = buildMatrixIndex(matrixResult.data ?? [], subtypeResult.data ?? []);
  };

  loadPromise = runner()
    .then(() => {
      loadState = 'loaded';
      loadError = null;
    })
    .catch(err => {
      loadState = 'error';
      loadError = ensureError(err);
      throw loadError;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

export function isConcernMatrixLoaded(): boolean {
  return loadState === 'loaded';
}

export function getConcernMatrixLoadError(): Error | null {
  return loadError;
}

export function assertConcernMatrixLoaded(): void {
  if (loadState === 'loaded') return;
  if (loadState === 'error' && loadError) {
    throw new Error(`Concern matrix failed to load: ${loadError.message}`);
  }
  throw new Error('Concern matrix data not loaded. Call loadConcernMatrixData() before using.');
}

export function lookupMatrixEntry(params: {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
}): MatrixEntry | undefined {
  assertConcernMatrixLoaded();
  return matrixIndex[params.concern]?.[params.subtype]?.[params.skinType]?.[params.band];
}

export function listSubtypes(concern: ConcernKey): string[] {
  assertConcernMatrixLoaded();
  return Object.keys(matrixIndex[concern] || {});
}

export function getProductInfo(rawName: string): ProductInfo | undefined {
  assertConcernMatrixLoaded();
  return lookupProductInfo(rawName);
}

function registerProducts(
  products: ProductRow[],
  aliasMap: Map<string, string[]>,
  tagMap: Map<string, IngredientTag[]>
) {
  for (const product of products) {
    const info: ProductInfo = {
      name: product.display_name,
      ingredientTags: tagMap.get(product.id) ?? [],
      ingredientKeywords: buildKeywordList(product, aliasMap.get(product.id) ?? []),
      defaultUsage: (product.default_usage ?? 'both') as ProductInfo['defaultUsage'],
      pregnancyUnsafe: product.pregnancy_unsafe ?? false,
      isotretinoinUnsafe: product.isotretinoin_unsafe ?? false,
      barrierUnsafe: product.barrier_unsafe ?? false,
      notes: product.notes ?? undefined,
      isReferral: product.is_referral ?? false,
    };

    const loadedProduct: LoadedProduct = {
      id: product.id,
      slug: product.slug,
      displayName: product.display_name,
      info,
      isVirtual: product.is_virtual ?? false,
    };

    productsById.set(product.id, loadedProduct);

    const baseAliases = new Set<string>();
    baseAliases.add(product.display_name);
    baseAliases.add(product.slug);
    if (product.brand) baseAliases.add(`${product.brand} ${product.display_name}`);
    (aliasMap.get(product.id) ?? []).forEach(alias => baseAliases.add(alias));

    registerProductAliases(loadedProduct, Array.from(baseAliases));
  }
}

function registerSkinTypeDefaults(rows: SkinTypeDefaultRow[]) {
  const nextDefaults = createEmptySkinTypeDefaults();
  for (const row of rows) {
    nextDefaults[row.skin_type] = nextDefaults[row.skin_type] || {};
    nextDefaults[row.skin_type][row.slot] = row.product_id;
  }
  skinTypeDefaults = nextDefaults;
}

function buildMatrixIndex(
  rows: MatrixEntryRow[],
  subtypes: ConcernSubtypeRow[]
): Record<ConcernKey, Record<string, Record<SkinTypeKey, Record<BandColor, MatrixEntry>>>> {
  const subtypeMap = new Map<string, ConcernSubtypeRow>();
  subtypes.forEach(sub => subtypeMap.set(sub.id, sub));

  const nextIndex: Record<
    ConcernKey,
    Record<string, Record<SkinTypeKey, Record<BandColor, MatrixEntry>>>
  > = Object.create(null);

  for (const row of rows) {
    const subtype = subtypeMap.get(row.subtype_id);
    if (!subtype) {
      console.warn(`Skipping matrix entry ${row.id}: unknown subtype ${row.subtype_id}`);
      continue;
    }

    const cleanser = createMatrixProduct('cleanser', row.cleanser_id, row.skin_type);
    const coreSerum = createMatrixProduct('coreSerum', row.core_serum_id, row.skin_type);
    const secondarySerum = createMatrixProduct('secondarySerum', row.secondary_serum_id, row.skin_type);
    const moisturizer = createMatrixProduct('moisturizer', row.moisturizer_id, row.skin_type);
    const sunscreen = createMatrixProduct('sunscreen', row.sunscreen_id, row.skin_type);

    if (!cleanser || !coreSerum || !moisturizer || !sunscreen) {
      throw new Error(`Matrix entry ${row.id} is missing required products.`);
    }

    const entry: MatrixEntry = {
      concern: row.concern,
      subtype: subtype.code,
      skinType: row.skin_type,
      band: row.band,
      cleanser,
      coreSerum,
      secondarySerum: secondarySerum ?? null,
      moisturizer,
      sunscreen,
      remarks: row.remarks ?? undefined,
    };

    const concernBucket = (nextIndex[row.concern] =
      nextIndex[row.concern] || Object.create(null));
    const subtypeBucket = (concernBucket[subtype.code] = concernBucket[subtype.code] || Object.create(null));
    const skinBucket = (subtypeBucket[row.skin_type] = subtypeBucket[row.skin_type] || Object.create(null));
    skinBucket[row.band] = entry;
  }

  return nextIndex;
}

function createMatrixProduct(
  slot: ProductSlot,
  productId: string | null,
  skinType: SkinTypeKey
): MatrixProduct | null {
  if (!productId) return null;

  const product = productsById.get(productId);
  if (!product) {
    throw new Error(`No product found for ID ${productId} (${slot}).`);
  }

  if (product.info.isReferral) {
    return {
      ...product.info,
      slot,
      rawName: product.displayName,
    };
  }

  if (product.isVirtual) {
    const fallback = resolveDynamicDefault(slot, skinType);
    if (!fallback) {
      throw new Error(`No skin-type default defined for ${slot} (${skinType}).`);
    }
    return {
      ...fallback,
      slot,
      rawName: product.displayName,
      isDynamic: true,
    };
  }

  return {
    ...product.info,
    slot,
    rawName: product.displayName,
  };
}

function resolveDynamicDefault(slot: ProductSlot, skinType: SkinTypeKey): ProductInfo | null {
  const fallbackId = skinTypeDefaults[skinType]?.[slot];
  if (!fallbackId) return null;

  const product = productsById.get(fallbackId);
  if (!product) {
    throw new Error(
      `Skin-type default references missing product ${fallbackId} for ${slot} (${skinType}).`
    );
  }

  if (product.isVirtual) {
    throw new Error(
      `Skin-type default for ${slot} (${skinType}) points to another virtual product (${product.slug}).`
    );
  }

  return product.info;
}

function lookupProductInfo(rawName: string): ProductInfo | undefined {
  const normalized = normalizeKey(rawName);
  if (!normalized) return undefined;
  return productRegistry.get(normalized);
}

function registerProductAliases(product: LoadedProduct, aliases: string[]) {
  const seen = new Set<string>();
  aliases.forEach(alias => {
    const normalized = normalizeKey(alias);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    productRegistry.set(normalized, product.info);
  });
}

function buildKeywordList(product: ProductRow, aliases: string[]): string[] {
  const keywords = new Set<string>();

  (product.ingredient_keywords ?? []).forEach(kw => {
    const trimmed = kw.trim();
    if (trimmed) keywords.add(trimmed);
  });

  [product.display_name, product.brand ?? '']
    .flatMap(value => value.split(/\s+/))
    .forEach(token => {
      const trimmed = token.trim();
      if (trimmed) keywords.add(trimmed.toLowerCase());
    });

  aliases.forEach(alias => {
    alias
      .split(/\s+/)
      .map(part => part.trim())
      .filter(Boolean)
      .forEach(part => keywords.add(part.toLowerCase()));
  });

  return Array.from(keywords);
}

function buildAliasMap(rows: AliasRow[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.alias) continue;
    const list = map.get(row.product_id) ?? [];
    list.push(row.alias);
    map.set(row.product_id, list);
  }
  return map;
}

function buildTagMap(rows: ProductTagRow[]): Map<string, IngredientTag[]> {
  const map = new Map<string, IngredientTag[]>();
  for (const row of rows) {
    if (!row.tag_id) continue;
    const list = map.get(row.product_id) ?? [];
    list.push(row.tag_id as IngredientTag);
    map.set(row.product_id, list);
  }
  return map;
}

function createEmptySkinTypeDefaults(): Record<SkinTypeKey, ProductSlotDefaults> {
  return {
    Dry: {},
    Combo: {},
    Oily: {},
    Sensitive: {},
    Normal: {},
  };
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function clearCaches() {
  productRegistry.clear();
  productsById.clear();
  skinTypeDefaults = createEmptySkinTypeDefaults();
  matrixIndex = Object.create(null);
}

function assertSupabaseResult<T>(
  result: { data: T | null; error: unknown },
  table: string
): asserts result is { data: T; error: null } {
  if (result.error) {
    throw ensureError(result.error, `Failed to fetch ${table} data`);
  }
  if (!result.data) {
    throw new Error(`No data returned for ${table}`);
  }
}

function ensureError(err: unknown, prefix?: string): Error {
  if (err instanceof Error) {
    return prefix ? new Error(`${prefix}: ${err.message}`) : err;
  }
  return new Error(prefix ? `${prefix}: ${String(err)}` : String(err));
}
