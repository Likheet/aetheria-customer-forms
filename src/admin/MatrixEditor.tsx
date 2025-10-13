import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '../lib/supabase';
import type {
  ConcernKey,
  SkinTypeKey,
  BandColor,
  ProductSlot,
} from '../data/concernMatrix';

type MatrixEntryRow = {
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
  updated_at?: string | null;
  updated_by?: string | null;
};

type ConcernSubtype = {
  id: string;
  concern: ConcernKey;
  code: string;
  label: string;
};

type ProductRow = {
  id: string;
  display_name: string;
  brand: string | null;
  category: string | null;
  ingredient_keywords: string[] | null;
  notes: string | null;
};

const SKIN_TYPES: SkinTypeKey[] = ['Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'];
const BAND_ORDER: BandColor[] = ['green', 'blue', 'yellow', 'red'];
const SLOT_FIELDS: Array<{ slot: ProductSlot; label: string; key: keyof MatrixEntryRow }> = [
  { slot: 'cleanser', label: 'Cleanser', key: 'cleanser_id' },
  { slot: 'coreSerum', label: 'Core serum', key: 'core_serum_id' },
  { slot: 'secondarySerum', label: 'Secondary serum', key: 'secondary_serum_id' },
  { slot: 'moisturizer', label: 'Moisturizer', key: 'moisturizer_id' },
  { slot: 'sunscreen', label: 'Sunscreen', key: 'sunscreen_id' },
];

function formatProductOption(product: ProductRow): string {
  const parts = [product.display_name];
  if (product.brand) parts.push(`- ${product.brand}`);
  return parts.join(' ');
}

interface DraftMap {
  [id: string]: Partial<MatrixEntryRow>;
}

const MatrixEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [matrixEntries, setMatrixEntries] = useState<MatrixEntryRow[]>([]);
  const [subtypes, setSubtypes] = useState<ConcernSubtype[]>([]);

  const [selectedConcern, setSelectedConcern] = useState<ConcernKey | ''>('');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('');
  const [selectedSkinType, setSelectedSkinType] = useState<SkinTypeKey | ''>('');

  const [drafts, setDrafts] = useState<DraftMap>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const productOptions = useMemo(() => {
    const sortedProducts = products.slice().sort((a, b) => a.display_name.localeCompare(b.display_name));
    const ungroupedOptions: Array<{ value: string; label: string }> = [];
    const groupedOptions = new Map<string, Array<{ value: string; label: string }>>();

    sortedProducts.forEach(product => {
      const option = {
        value: product.id,
        label: formatProductOption(product),
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

  const productDictionary = useMemo(() => {
    const map = new Map<string, ProductRow>();
    products.forEach(product => map.set(product.id, product));
    return map;
  }, [products]);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedConcern && subtypes.length) {
      setSelectedConcern(subtypes[0].concern);
    }
  }, [subtypes, selectedConcern]);

  useEffect(() => {
    if (!selectedSubtype && filteredSubtypes.length) {
      setSelectedSubtype(filteredSubtypes[0]?.id ?? '');
    }
  }, [selectedSubtype, subtypes, selectedConcern]);

  useEffect(() => {
    if (!selectedSkinType) {
      setSelectedSkinType('Combo');
    }
  }, [selectedSkinType]);

  const filteredSubtypes = useMemo(
    () => subtypes.filter(subtype => !selectedConcern || subtype.concern === selectedConcern),
    [subtypes, selectedConcern]
  );

  const visibleEntries = useMemo(() => {
    return matrixEntries.filter(entry => {
      if (selectedConcern && entry.concern !== selectedConcern) return false;
      if (selectedSubtype && entry.subtype_id !== selectedSubtype) return false;
      if (selectedSkinType && entry.skin_type !== selectedSkinType) return false;
      return true;
    });
  }, [matrixEntries, selectedConcern, selectedSubtype, selectedSkinType]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [{ data: productData, error: productError }, { data: matrixData, error: matrixError }, { data: subtypeData, error: subtypeError }] =
        await Promise.all([
          supabase
            .from('product')
            .select('id, display_name, brand, category, ingredient_keywords, notes')
            .order('display_name', { ascending: true }),
          supabase.from('matrix_entry').select(
            'id, concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks, updated_at, updated_by'
          ),
          supabase.from('concern_subtype').select('id, concern, code, label').order('concern', { ascending: true }).order('label', { ascending: true }),
        ]);

      if (productError) throw productError;
      if (matrixError) throw matrixError;
      if (subtypeError) throw subtypeError;

      setProducts(productData ?? []);
      setMatrixEntries(matrixData ?? []);
      setSubtypes(
        (subtypeData ?? []).map(record => ({
          ...record,
          label: record.label ?? record.code,
        }))
      );
      setDrafts({});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const markDraft = (id: string, patch: Partial<MatrixEntryRow>) => {
    setDrafts(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        ...patch,
      },
    }));
  };

  const getFieldValue = (entry: MatrixEntryRow, key: keyof MatrixEntryRow) =>
    drafts[entry.id]?.[key] ?? entry[key];

  const hasDrafts = useMemo(() => Object.keys(drafts).length > 0, [drafts]);

  const saveChanges = async () => {
    if (!hasDrafts) return;
    try {
      setSaving(true);
      setSuccessMessage(null);

      const updates = Object.entries(drafts).map(([id, patch]) =>
        supabase
          .from('matrix_entry')
          .update(patch)
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const firstError = results.find(res => res.error)?.error;
      if (firstError) throw firstError;

      setSuccessMessage('Matrix entries updated successfully.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const resetDrafts = () => {
    setDrafts({});
    setSuccessMessage(null);
  };

  const getBadgeColor = (band: BandColor) => {
    switch (band) {
      case 'green':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'blue':
        return 'bg-blue-500 text-white border-blue-600';
      case 'yellow':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'red':
        return 'bg-red-500 text-white border-red-600';
    }
  };

  const renderProductCell = (entry: MatrixEntryRow, field: keyof MatrixEntryRow) => {
    const value = getFieldValue(entry, field) as string | null;
    const product = value ? productDictionary.get(value) : null;
    if (!product) return <span className="text-sm text-slate-400">—</span>;
    return (
      <div className="space-y-0.5">
        <div className="text-sm font-medium text-slate-900">{product.display_name}</div>
        <div className="text-xs text-slate-500">{product.brand || 'Brand n/a'}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Fine-tune the curated recommendations</h3>
        <p className="text-sm text-slate-600">
          Choose a concern, subtype, and skin-type band to adjust the cleansers, serums, moisturizers, and sunscreen recommendations in real time.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label htmlFor="concern-select">Concern</Label>
          <Select
            value={selectedConcern || undefined}
            onValueChange={(value) => {
              setSelectedConcern((value as ConcernKey) || '');
              setSelectedSubtype('');
            }}
          >
            <SelectTrigger id="concern-select">
              <SelectValue placeholder="Select concern" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set(subtypes.map(subtype => subtype.concern))].map(concern => (
                <SelectItem key={concern} value={concern}>
                  {concern.replace(/^[a-z]/, s => s.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label htmlFor="subtype-select">Subtype</Label>
          <Select
            value={selectedSubtype || undefined}
            onValueChange={(value) => setSelectedSubtype(value || '')}
            disabled={!selectedConcern}
          >
            <SelectTrigger id="subtype-select">
              <SelectValue placeholder={selectedConcern ? 'Select subtype' : 'Pick a concern first'} />
            </SelectTrigger>
            <SelectContent>
              {filteredSubtypes.map(subtype => (
                <SelectItem key={subtype.id} value={subtype.id}>
                  {subtype.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label htmlFor="skintype-select">Skin type</Label>
          <Select
            value={selectedSkinType || undefined}
            onValueChange={(value) => setSelectedSkinType((value as SkinTypeKey) || 'Combo')}
          >
            <SelectTrigger id="skintype-select">
              <SelectValue placeholder="Select skin type" />
            </SelectTrigger>
            <SelectContent>
              {SKIN_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            size="default"
            onClick={() => void loadData()}
            disabled={loading}
            className="bg-slate-700 hover:bg-slate-800 text-white gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            disabled={!hasDrafts || saving}
            onClick={resetDrafts}
          >
            Reset changes
          </Button>
          <Button
            disabled={!hasDrafts || saving}
            onClick={() => void saveChanges()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving && <Spinner className="h-4 w-4 mr-2" />}
            Save matrix
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="text-rose-800">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && !error && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <Spinner className="h-6 w-6" />
          <span className="text-slate-600">Loading matrix entries…</span>
        </div>
      ) : !visibleEntries.length ? (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">No matrix entries match the current filters.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Try selecting a different subtype or skin type. If the subtype is brand new, add it from the Supabase table first and re-sync.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {BAND_ORDER.filter(band => visibleEntries.some(entry => entry.band === band)).map(band => {
            const entriesForBand = visibleEntries
              .filter(entry => entry.band === band)
              .sort((a, b) => a.skin_type.localeCompare(b.skin_type));

            return (
              <Card key={band} className="bg-white border-slate-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getBadgeColor(band)} rounded-md px-3 py-1 font-semibold`}>
                        {band.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {entriesForBand.length} variant{entriesForBand.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      Changes autosync after saving
                    </span>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-6 space-y-8">

                  {entriesForBand.map(entry => {
                    const subtype = subtypes.find(sub => sub.id === entry.subtype_id);

                    return (
                      <div key={entry.id} className="mb-8 space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="border-slate-300 text-slate-700">
                            {entry.skin_type}
                          </Badge>
                          <span className="font-semibold text-slate-900">
                            {subtype?.label || 'Subtype not found'}
                          </span>
                          <span 
                            className="text-xs text-slate-500 cursor-help" 
                            title={
                              entry.updated_at
                                ? `Last touched ${new Date(entry.updated_at).toLocaleString()}`
                                : 'Unversioned record'
                            }
                          >
                            View history
                          </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-amber-50">
                                <TableHead className="w-[18%] text-slate-900 font-semibold">Slot</TableHead>
                                <TableHead className="w-[45%] text-slate-900 font-semibold">Current selection</TableHead>
                                <TableHead className="w-[37%] text-slate-900 font-semibold">Change to</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {SLOT_FIELDS.map(({ slot, label, key }) => (
                                <TableRow key={slot} className="hover:bg-amber-50">
                                  <TableCell>
                                    <span className="text-sm font-medium text-slate-700">
                                      {label}
                                    </span>
                                  </TableCell>
                                  <TableCell>{renderProductCell(entry, key)}</TableCell>
                                  <TableCell>
                                    <Select
                                      value={(getFieldValue(entry, key) as string | null) ?? undefined}
                                      onValueChange={value => markDraft(entry.id, { [key]: value } as Partial<MatrixEntryRow>)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pick a product" />
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`remarks-${entry.id}`} className="text-sm font-medium">
                            Notes for consultants
                          </Label>
                          <Textarea
                            id={`remarks-${entry.id}`}
                            rows={2}
                            value={(getFieldValue(entry, 'remarks') as string | null) ?? ''}
                            placeholder="Safety warnings, fallback guidance, or dermatologist escalation notes."
                            onChange={event => markDraft(entry.id, { remarks: event.currentTarget.value })}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatrixEditor;
