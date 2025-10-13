import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCcw, ShieldAlert, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

type PriceTier = 'affordable' | 'mid' | 'premium' | '';

type ProductRecord = {
  id: string;
  display_name: string;
  brand: string | null;
  category: string | null;
  default_usage: 'am' | 'pm' | 'both' | null;
  pregnancy_unsafe: boolean | null;
  isotretinoin_unsafe: boolean | null;
  barrier_unsafe: boolean | null;
  notes: string | null;
  ingredient_keywords: string[] | null;
  created_at?: string;
  updated_at?: string;
};

interface ProductDraft extends Omit<ProductRecord, 'ingredient_keywords'> {
  ingredient_keywords: string[];
  priceTier: PriceTier;
  subcategory: string;
}

const TIER_LABELS: Record<Exclude<PriceTier, ''>, string> = {
  affordable: 'Affordable',
  mid: 'Mid range',
  premium: 'Premium',
};

const DEFAULT_TIER_OPTIONS = [
  { value: 'affordable', label: 'Affordable' },
  { value: 'mid', label: 'Mid range' },
  { value: 'premium', label: 'Premium' },
];

const DEFAULT_USAGE_OPTIONS = [
  { value: 'am', label: 'AM' },
  { value: 'pm', label: 'PM' },
  { value: 'both', label: 'Both' },
];

function extractToken(list: string[] = [], prefix: string): string {
  const found = list.find(value => value.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function applyToken(list: string[], prefix: string, value: string): string[] {
  const filtered = list.filter(item => !item.startsWith(prefix));
  if (!value) return filtered;
  return [...filtered, `${prefix}${value}`];
}

const ProductCatalogManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<PriceTier>('');
  const [editorState, setEditorState] = useState<{ open: boolean; product: ProductDraft | null }>({
    open: false,
    product: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState<string | null>(null);

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = useMemo(() => {
    const names = new Set<string>();
    products.forEach(product => {
      if (product.category) names.add(product.category);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (categoryFilter) {
      list = list.filter(product => product.category === categoryFilter);
    }
    if (tierFilter) {
      list = list.filter(product => extractToken(product.ingredient_keywords ?? [], 'tier:') === tierFilter);
    }
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      list = list.filter(product => product.display_name.toLowerCase().includes(query) || (product.brand ?? '').toLowerCase().includes(query));
    }
    return list.sort((a, b) => a.display_name.localeCompare(b.display_name));
  }, [products, categoryFilter, tierFilter, search]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from('product')
        .select(
          'id, display_name, brand, category, default_usage, pregnancy_unsafe, isotretinoin_unsafe, barrier_unsafe, ingredient_keywords, notes, created_at, updated_at'
        )
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (queryError) throw queryError;
      setProducts(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const openEditor = (product?: ProductRecord) => {
    if (!product) {
      setEditorState({
        open: true,
        product: {
          id: '',
          display_name: '',
          brand: '',
          category: categoryFilter ?? '',
          default_usage: 'both',
          pregnancy_unsafe: false,
          isotretinoin_unsafe: false,
          barrier_unsafe: false,
          notes: '',
          ingredient_keywords: [],
          priceTier: tierFilter || '',
          subcategory: '',
        },
      });
      return;
    }

    const keywordList = product.ingredient_keywords ?? [];
    setEditorState({
      open: true,
      product: {
        ...product,
        ingredient_keywords: [...keywordList.filter(value => !value.startsWith('tier:') && !value.startsWith('subcat:'))],
        priceTier: (extractToken(keywordList, 'tier:') as PriceTier) || '',
        subcategory: extractToken(keywordList, 'subcat:'),
      },
    });
  };

  const closeEditor = () => {
    setEditorState({ open: false, product: null });
  };

  const handleDelete = async () => {
    if (!deleteQueue) return;
    try {
      setSaving(true);
      const { error: deleteError } = await supabase.from('product').delete().eq('id', deleteQueue);
      if (deleteError) throw deleteError;
      setDeleteQueue(null);
      closeEditor();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (draft: ProductDraft) => {
    try {
      setSaving(true);
      const payload: Partial<ProductRecord> = {
        display_name: draft.display_name.trim(),
        brand: draft.brand?.trim() || null,
        category: draft.category?.trim() || null,
        default_usage: draft.default_usage ?? 'both',
        pregnancy_unsafe: Boolean(draft.pregnancy_unsafe),
        isotretinoin_unsafe: Boolean(draft.isotretinoin_unsafe),
        barrier_unsafe: Boolean(draft.barrier_unsafe),
        notes: draft.notes?.trim() || null,
        ingredient_keywords: applyToken(
          applyToken(draft.ingredient_keywords.map(keyword => keyword.trim()).filter(Boolean), 'tier:', draft.priceTier || ''),
          'subcat:',
          draft.subcategory.trim()
        ),
      };

      let response;
      if (draft.id) {
        response = await supabase.from('product').update(payload).eq('id', draft.id);
      } else {
        response = await supabase.from('product').insert(payload);
      }

      if (response.error) throw response.error;
      closeEditor();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Product library</h3>
          <p className="text-sm text-slate-600">
            Curate the cleansers, serums, moisturizers, and sunscreens that feed the recommendation engine.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="default"
            onClick={() => void loadProducts()}
            className="bg-slate-700 hover:bg-slate-800 text-white gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => openEditor()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load catalogue</AlertTitle>
          <AlertDescription className="text-rose-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-white">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search-input">Search catalogue</Label>
              <Input
                id="search-input"
                placeholder="Search name or brand"
                value={search}
                onChange={event => setSearch(event.currentTarget.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="category-select">Category</Label>
              <Select
                value={categoryFilter ?? undefined}
                onValueChange={value => setCategoryFilter(value === "_all_" ? null : value)}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="tier-select">Tier</Label>
              <Select
                value={tierFilter || undefined}
                onValueChange={value => setTierFilter(value === "_any_" ? '' : (value as PriceTier))}
              >
                <SelectTrigger id="tier-select">
                  <SelectValue placeholder="Any tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_any_">Any tier</SelectItem>
                  {DEFAULT_TIER_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <ScrollArea className="h-[60vh]">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => {
                  const keywords = product.ingredient_keywords ?? [];
                  const tier = extractToken(keywords, 'tier:') as PriceTier;
                  const subcategory = extractToken(keywords, 'subcat:');
                  return (
                    <TableRow key={product.id} className="cursor-pointer" onClick={() => openEditor(product)}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">
                            {product.display_name}
                          </div>
                          {product.notes && (
                            <div className="text-xs text-slate-600">
                              {product.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.brand || <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell>{product.category || <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell>{subcategory || <span className="text-slate-400">—</span>}</TableCell>
                      <TableCell>
                        {tier ? (
                          <Badge className={
                            tier === 'premium' ? 'bg-purple-600 text-white border-purple-700' :
                            tier === 'mid' ? 'bg-cyan-600 text-white border-cyan-700' :
                            'bg-lime-600 text-white border-lime-700'
                          }>
                            {TIER_LABELS[tier]}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>{product.default_usage?.toUpperCase() ?? 'BOTH'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 flex-wrap">
                          {product.pregnancy_unsafe && (
                            <Badge className="bg-red-600 text-white text-xs" title="Pregnancy unsafe">
                              Pregnancy
                            </Badge>
                          )}
                          {product.isotretinoin_unsafe && (
                            <Badge className="bg-orange-600 text-white text-xs" title="Avoid during isotretinoin">
                              Isotretinoin
                            </Badge>
                          )}
                          {product.barrier_unsafe && (
                            <Badge className="bg-amber-600 text-white text-xs" title="Skip for compromised barriers">
                              Barrier
                            </Badge>
                          )}
                          {!product.pregnancy_unsafe && !product.isotretinoin_unsafe && !product.barrier_unsafe && (
                            <Badge variant="outline" className="border-slate-300 text-slate-600 text-xs">
                              Safe
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {!filteredProducts.length && (
              <div className="flex items-center justify-center py-12">
                <span className="text-slate-600">No products match the filters yet.</span>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <Dialog open={editorState.open} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {editorState.product?.id ? 'Edit product' : 'Create product'}
            </DialogTitle>
          </DialogHeader>
          {editorState.product && (
            <ProductForm
              draft={editorState.product}
              onCancel={closeEditor}
              onSave={handleSave}
              onDelete={() => setDeleteQueue(editorState.product?.id ?? null)}
              saving={saving}
              allowDelete={Boolean(editorState.product.id)}
              categorySuggestions={categories}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteQueue)} onOpenChange={(open) => !open && setDeleteQueue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive" className="border-rose-200 bg-rose-50">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription className="text-rose-800">
                Deleting removes the product from the library and the matrix. Handle with care.
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteQueue(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void handleDelete()} disabled={saving}>
                {saving && <Spinner className="h-4 w-4 mr-2" />}
                Delete product
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ProductFormProps {
  draft: ProductDraft;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
  onDelete: () => void;
  saving: boolean;
  allowDelete: boolean;
  categorySuggestions: string[];
}

function ProductForm({ draft, onSave, onCancel, onDelete, saving, allowDelete, categorySuggestions }: ProductFormProps) {
  const [state, setState] = useState<ProductDraft>(draft);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setState(draft);
    setValidationError(null);
  }, [draft]);

  const updateField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setState(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!state.display_name.trim()) {
      setValidationError('Name is required.');
      return;
    }
    if (!state.category?.trim()) {
      setValidationError('Pick a category (Cleanser, Serum, etc.).');
      return;
    }
    setValidationError(null);
    onSave({
      ...state,
      ingredient_keywords: state.ingredient_keywords,
    });
  };

  const tierValue: PriceTier = state.priceTier;

  return (
    <div className="space-y-4">
      {validationError && (
        <Alert variant="destructive" className="border-rose-200 bg-rose-50">
          <AlertDescription className="text-rose-800">{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="product-name" className="text-slate-900 font-medium">Product name <span className="text-rose-500">*</span></Label>
        <Input
          id="product-name"
          placeholder="e.g. Cetaphil Oily Skin Cleanser"
          value={state.display_name}
          onChange={event => updateField('display_name', event.currentTarget.value)}
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-slate-900 font-medium">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g. Galderma"
            value={state.brand ?? ''}
            onChange={event => updateField('brand', event.currentTarget.value)}
            className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage" className="text-slate-900 font-medium">Usage</Label>
          <Select
            value={state.default_usage ?? 'both'}
            onValueChange={value => updateField('default_usage', (value as ProductDraft['default_usage']) ?? 'both')}
          >
            <SelectTrigger id="usage" className="bg-white border-slate-300 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_USAGE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-slate-900 font-medium">Category <span className="text-rose-500">*</span></Label>
        <Select
          value={state.category ?? undefined}
          onValueChange={value => updateField('category', value ?? '')}
        >
          <SelectTrigger id="category" className="bg-white border-slate-300 text-slate-900">
            <SelectValue placeholder="Select or type…" />
          </SelectTrigger>
          <SelectContent>
            {categorySuggestions.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subcategory" className="text-slate-900 font-medium">Subcategory</Label>
        <Input
          id="subcategory"
          placeholder="e.g. Foaming gel cleanser"
          value={state.subcategory}
          onChange={event => updateField('subcategory', event.currentTarget.value)}
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-900 font-medium">Price tier</Label>
        <div className="flex gap-2">
          {[
            { label: 'No tier', value: '' },
            { label: 'Affordable', value: 'affordable' },
            { label: 'Mid range', value: 'mid' },
            { label: 'Premium', value: 'premium' },
          ].map(option => (
            <Button
              key={option.value}
              type="button"
              variant={tierValue === option.value ? 'default' : 'outline'}
              onClick={() => updateField('priceTier', option.value as PriceTier)}
              className={tierValue === option.value ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-white' : 'flex-1 bg-white border-slate-300 hover:bg-slate-50 text-slate-900'}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks" className="text-slate-900 font-medium">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Retail notes, availability, consultant reminders"
          rows={3}
          value={state.notes ?? ''}
          onChange={event => updateField('notes', event.currentTarget.value)}
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords" className="text-slate-900 font-medium">Search keywords</Label>
        <p className="text-sm text-slate-600">Optional helper terms to improve lookup (aliases, nicknames).</p>
        <Input
          id="keywords"
          placeholder="Enter keywords (comma-separated)"
          value={state.ingredient_keywords.join(', ')}
          onChange={event => updateField('ingredient_keywords', event.currentTarget.value.split(',').map(k => k.trim()).filter(Boolean))}
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <Separator />

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="pregnancy"
              checked={Boolean(state.pregnancy_unsafe)}
              onCheckedChange={checked => updateField('pregnancy_unsafe', checked)}
            />
            <Label htmlFor="pregnancy" className="cursor-pointer text-slate-900 font-medium">Pregnancy unsafe</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="isotretinoin"
              checked={Boolean(state.isotretinoin_unsafe)}
              onCheckedChange={checked => updateField('isotretinoin_unsafe', checked)}
            />
            <Label htmlFor="isotretinoin" className="cursor-pointer text-slate-900 font-medium">Isotretinoin unsafe</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="barrier"
              checked={Boolean(state.barrier_unsafe)}
              onCheckedChange={checked => updateField('barrier_unsafe', checked)}
            />
            <Label htmlFor="barrier" className="cursor-pointer text-slate-900 font-medium">Barrier unsafe</Label>
          </div>
        </div>

        <div className="flex gap-2">
          {allowDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={saving}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {saving && <Spinner className="h-4 w-4" />}
            <Plus className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductCatalogManager;
