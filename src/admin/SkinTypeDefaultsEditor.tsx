import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductSlot, SkinTypeKey } from '../data/concernMatrix';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';

type SkinDefaultRow = {
  id: string;
  skin_type: SkinTypeKey;
  slot: ProductSlot;
  product_id: string;
};

type ProductRecord = {
  id: string;
  display_name: string;
  brand: string | null;
  category: string | null;
};

const SKIN_TYPES: SkinTypeKey[] = ['Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'];
const SLOTS: { slot: ProductSlot; label: string }[] = [
  { slot: 'cleanser', label: 'Cleanser' },
  { slot: 'coreSerum', label: 'Core serum' },
  { slot: 'secondarySerum', label: 'Secondary serum' },
  { slot: 'moisturizer', label: 'Moisturizer' },
  { slot: 'sunscreen', label: 'Sunscreen' },
];

interface DraftMap {
  [key: string]: string | null;
}

function slotKey(skinType: SkinTypeKey, slot: ProductSlot) {
  return `${skinType}_${slot}`;
}

const SkinTypeDefaultsEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<SkinDefaultRow[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});

  useEffect(() => {
    void loadData();
  }, []);

  const productOptions = useMemo(() => {
    const sortedProducts = products.slice().sort((a, b) => a.display_name.localeCompare(b.display_name));
    const ungroupedOptions: Array<{ value: string; label: string }> = [];
    const groupedOptions = new Map<string, Array<{ value: string; label: string }>>();

    sortedProducts.forEach(product => {
      const option = {
        value: product.id,
        label: product.brand ? `${product.display_name} - ${product.brand}` : product.display_name,
      };

      const category = product.category?.trim();
      if (!category) {
        ungroupedOptions.push(option);
        return;
      }

      if (!groupedOptions.has(category)) {
        groupedOptions.set(category, []);
      }
      groupedOptions.get(category)!.push(option);
    });

    return [
      ...ungroupedOptions,
      ...Array.from(groupedOptions.entries()).map(([group, items]) => ({
        group,
        items,
      })),
    ];
  }, [products]);

  const valueFor = (skinType: SkinTypeKey, slot: ProductSlot) => {
    const key = slotKey(skinType, slot);
    if (key in drafts) return drafts[key];
    const row = rows.find(item => item.skin_type === skinType && item.slot === slot);
    return row?.product_id ?? null;
  };

  const markDraft = (skinType: SkinTypeKey, slot: ProductSlot, productId: string | null) => {
    const key = slotKey(skinType, slot);
    setDrafts(prev => ({
      ...prev,
      [key]: productId,
    }));
  };

  const hasDrafts = useMemo(() => Object.keys(drafts).length > 0, [drafts]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [{ data: defaults, error: defaultError }, { data: productData, error: productError }] = await Promise.all([
        supabase.from('skin_type_default').select('id, skin_type, slot, product_id'),
        supabase.from('product').select('id, display_name, brand, category'),
      ]);

      if (defaultError) throw defaultError;
      if (productError) throw productError;

      setRows(defaults ?? []);
      setProducts(productData ?? []);
      setDrafts({});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const saveChanges = async () => {
    if (!hasDrafts) return;
    try {
      setSaving(true);
      setError(null);

      const payload = Object.entries(drafts).map(([key, productId]) => {
        const [skinType, slot] = key.split('_') as [SkinTypeKey, ProductSlot];
        const existing = rows.find(row => row.skin_type === skinType && row.slot === slot);
        return {
          id: existing?.id,
          skin_type: skinType,
          slot,
          product_id: productId,
        };
      });

      const { error: upsertError } = await supabase
        .from('skin_type_default')
        .upsert(payload, { onConflict: 'skin_type,slot' });
      if (upsertError) throw upsertError;

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Dynamic fallbacks</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              These defaults power the matrix whenever a slot points to the fallback token below.
            </p>
            <Badge className="bg-purple-600 text-white border-purple-700">
              SKINTYPE_DEFAULT
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="default"
            onClick={() => void loadData()}
            className="bg-slate-700 hover:bg-slate-800 text-white gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            disabled={!hasDrafts || saving}
            onClick={() => void saveChanges()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {saving && <Spinner className="h-4 w-4" />}
            <Save className="h-4 w-4" />
            Save defaults
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertDescription className="text-rose-800">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <Spinner className="h-6 w-6" />
          <span className="text-slate-600">Loading defaults…</span>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skin type</TableHead>
                    {SLOTS.map(slot => (
                      <TableHead key={slot.slot}>{slot.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SKIN_TYPES.map(skinType => (
                    <TableRow key={skinType}>
                      <TableCell>
                        <span className="font-semibold text-slate-900">{skinType}</span>
                      </TableCell>
                      {SLOTS.map(slot => (
                        <TableCell key={slot.slot}>
                          <Select
                            value={valueFor(skinType, slot.slot) ?? undefined}
                            onValueChange={value => markDraft(skinType, slot.slot, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((option) => {
                                if ('group' in option) {
                                  return (
                                    <SelectGroup key={option.group}>
                                      <SelectLabel>{option.group}</SelectLabel>
                                      {option.items.map(item => (
                                        <SelectItem key={item.value} value={item.value}>
                                          {item.label}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  );
                                }
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
      )}

      <p className="text-xs text-slate-600">
        Tip: use the Product Library tab to ensure each fallback product is well described and tagged for search.
      </p>
    </div>
  );
};

export default SkinTypeDefaultsEditor;
