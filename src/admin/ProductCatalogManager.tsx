import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  MultiSelect,
  ScrollArea,
  SegmentedControl,
  Select,
  Space,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { Pencil, Plus, RefreshCcw, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
      <Stack spacing="xl">
        <Group position="apart">
          <div>
            <Title order={4}>
              Product library
            </Title>
            <Text size="sm" color="dimmed">
              Curate the cleansers, serums, moisturizers, and sunscreens that feed the recommendation engine.
            </Text>
          </div>
          <Group>
            <Button
              variant="subtle"
              leftSection={<RefreshCcw size={16} />}
              onClick={() => void loadProducts()}
            >
              Refresh
            </Button>
            <Button
              leftSection={<Plus size={18} />}
              onClick={() => openEditor()}
              variant="gradient"
              gradient={{ from: 'violet', to: 'cyan', deg: 135 }}
            >
              Add product
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="Unable to load catalogue" variant="light">
            {error}
          </Alert>
        )}

        <Card radius="lg" withBorder className="border border-gray-200 bg-gray-50">
          <Group spacing="md" align="flex-end">
            <TextInput
              label="Search catalogue"
              placeholder="Search name or brand"
              value={search}
              onChange={event => setSearch(event.currentTarget.value)}
              className="flex-1"
            />
            <Select
              label="Category"
              placeholder="All categories"
              data={categories.map(category => ({ value: category, label: category }))}
              value={categoryFilter}
              onChange={value => setCategoryFilter(value)}
              clearable
            />
            <Select
              label="Tier"
              placeholder="Any tier"
              data={DEFAULT_TIER_OPTIONS}
              value={tierFilter || null}
              onChange={value => setTierFilter((value as PriceTier) || '')}
              clearable
            />
          </Group>
        </Card>

        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <ScrollArea style={{ maxHeight: '60vh' }}>
            <Table highlightOnHover verticalSpacing="sm" fontSize="sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Tier</th>
                  <th>Usage</th>
                  <th>Safety</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const keywords = product.ingredient_keywords ?? [];
                  const tier = extractToken(keywords, 'tier:') as PriceTier;
                  const subcategory = extractToken(keywords, 'subcat:');
                  return (
                    <tr key={product.id} className="cursor-pointer transition hover:bg-gray-100" onClick={() => openEditor(product)}>
                      <td>
                        <Stack spacing={2}>
                          <Text weight={600}>
                            {product.display_name}
                          </Text>
                          {product.notes && (
                            <Text size="xs" color="dimmed">
                              {product.notes}
                            </Text>
                          )}
                        </Stack>
                      </td>
                      <td>{product.brand || <Text color="dimmed">—</Text>}</td>
                      <td>{product.category || <Text color="dimmed">—</Text>}</td>
                      <td>{subcategory || <Text color="dimmed">—</Text>}</td>
                      <td>
                        {tier ? (
                          <Badge radius="sm" color={tier === 'premium' ? 'grape' : tier === 'mid' ? 'cyan' : 'lime'}>
                            {TIER_LABELS[tier]}
                          </Badge>
                        ) : (
                          <Text color="gray.4">—</Text>
                        )}
                      </td>
                      <td>{product.default_usage?.toUpperCase() ?? 'Both'}</td>
                      <td>
                        <Group spacing="xs">
                          {product.pregnancy_unsafe && (
                            <Tooltip label="Pregnancy unsafe">
                              <Badge color="red" size="sm" radius="sm">
                                Pregnancy
                              </Badge>
                            </Tooltip>
                          )}
                          {product.isotretinoin_unsafe && (
                            <Tooltip label="Avoid during isotretinoin">
                              <Badge color="yellow" size="sm" radius="sm">
                                Isotretinoin
                              </Badge>
                            </Tooltip>
                          )}
                          {product.barrier_unsafe && (
                            <Tooltip label="Skip for compromised barriers">
                              <Badge color="orange" size="sm" radius="sm">
                                Barrier
                              </Badge>
                            </Tooltip>
                          )}
                          {!product.pregnancy_unsafe && !product.isotretinoin_unsafe && !product.barrier_unsafe && (
                            <Badge color="teal" size="sm" radius="sm" variant="light">
                              General safe
                            </Badge>
                          )}
                        </Group>
                      </td>
                      <td>
                        <ActionIcon variant="subtle" color="gray">
                          <Pencil size={18} />
                        </ActionIcon>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {!filteredProducts.length && (
              <Center py="xl">
                <Text color="dimmed">No products match the filters yet.</Text>
              </Center>
            )}
          </ScrollArea>
        )}
      </Stack>

      <Modal
        opened={editorState.open}
        onClose={closeEditor}
        centered
        size="lg"
        title={
          <Group spacing="xs">
            <ShieldCheck size={18} />
            <Text weight={600}>{editorState.product?.id ? 'Edit product' : 'Create product'}</Text>
          </Group>
        }
      >
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
      </Modal>

      <Modal
        opened={Boolean(deleteQueue)}
        onClose={() => setDeleteQueue(null)}
        title="Delete product"
        centered
      >
        <Stack spacing="md">
          <Alert icon={<ShieldAlert size={16} />} color="red" variant="light">
            Deleting removes the product from the library and the matrix. Handle with care.
          </Alert>
          <Group position="apart">
            <Button variant="default" onClick={() => setDeleteQueue(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={() => void handleDelete()} loading={saving}>
              Delete product
            </Button>
          </Group>
        </Stack>
      </Modal>
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
    <Stack spacing="md">
      {validationError && (
        <Alert color="red" variant="light">
          {validationError}
        </Alert>
      )}

      <TextInput
        label="Product name"
        placeholder="e.g. Cetaphil Oily Skin Cleanser"
        value={state.display_name}
        onChange={event => updateField('display_name', event.currentTarget.value)}
        required
      />

      <Group grow>
        <TextInput
          label="Brand"
          placeholder="e.g. Galderma"
          value={state.brand ?? ''}
          onChange={event => updateField('brand', event.currentTarget.value)}
        />
        <Select
          label="Usage"
          data={DEFAULT_USAGE_OPTIONS}
          value={state.default_usage ?? 'both'}
          onChange={value => updateField('default_usage', (value as ProductDraft['default_usage']) ?? 'both')}
        />
      </Group>

      <Select
        label="Category"
        placeholder="Select or type…"
        data={categorySuggestions.map(category => ({ value: category, label: category }))}
        value={state.category ?? ''}
        searchable
        creatable
        getCreateLabel={query => `Create "${query}"`}
        onChange={value => updateField('category', value ?? '')}
        onCreate={query => {
          const item = query.trim();
          updateField('category', item);
          return item;
        }}
        required
      />

      <TextInput
        label="Subcategory"
        placeholder="e.g. Foaming gel cleanser"
        value={state.subcategory}
        onChange={event => updateField('subcategory', event.currentTarget.value)}
      />

      <SegmentedControl
        fullWidth
        value={tierValue}
        onChange={value => updateField('priceTier', value as PriceTier)}
        data={[
          { label: 'No tier', value: '' },
          { label: 'Affordable', value: 'affordable' },
          { label: 'Mid range', value: 'mid' },
          { label: 'Premium', value: 'premium' },
        ]}
      />

      <Textarea
        label="Remarks"
        placeholder="Retail notes, availability, consultant reminders"
        minRows={3}
        value={state.notes ?? ''}
        onChange={event => updateField('notes', event.currentTarget.value)}
      />

      <MultiSelect
        label="Search keywords"
        description="Optional helper terms to improve lookup (aliases, nicknames)."
        placeholder="Add keywords"
        searchable
        data={[]}
        value={state.ingredient_keywords}
        onChange={value => updateField('ingredient_keywords', value)}
        nothingFoundMessage="Type and press enter"
        creatable
        getCreateLabel={query => `Add "${query}"`}
      />

      <Divider opacity={0.1} />

      <Group position="apart">
        <Stack spacing={6}>
          <Switch
            label="Pregnancy unsafe"
            checked={Boolean(state.pregnancy_unsafe)}
            onChange={event => updateField('pregnancy_unsafe', event.currentTarget.checked)}
          />
          <Switch
            label="Isotretinoin unsafe"
            checked={Boolean(state.isotretinoin_unsafe)}
            onChange={event => updateField('isotretinoin_unsafe', event.currentTarget.checked)}
          />
          <Switch
            label="Barrier unsafe"
            checked={Boolean(state.barrier_unsafe)}
            onChange={event => updateField('barrier_unsafe', event.currentTarget.checked)}
          />
        </Stack>

        <Group>
          {allowDelete && (
            <Button
              variant="outline"
              color="red"
              leftSection={<Trash2 size={16} />}
              onClick={onDelete}
              disabled={saving}
            >
              Delete
            </Button>
          )}
          <Button variant="default" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            leftSection={<Plus size={16} />}
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan', deg: 135 }}
          >
            Save changes
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}

export default ProductCatalogManager;
