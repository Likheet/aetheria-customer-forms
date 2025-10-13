import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Space,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { RefreshCcw, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductSlot, SkinTypeKey } from '../data/concernMatrix';

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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Stack spacing="xl">
        <Group position="apart">
          <div>
            <Text weight={600} size="lg">
              Dynamic fallbacks
            </Text>
            <Stack spacing={4}>
              <Text size="sm" color="dimmed">
                These defaults power the matrix whenever a slot points to the fallback token below.
              </Text>
              <Badge color="violet" variant="light" radius="sm">
                SKINTYPE_DEFAULT
              </Badge>
            </Stack>
          </div>
          <Group>
            <Button
              variant="subtle"
              leftSection={<RefreshCcw size={16} />}
              onClick={() => void loadData()}
            >
              Refresh
            </Button>
            <Button
              leftSection={<Save size={16} />}
              disabled={!hasDrafts}
              loading={saving}
              onClick={() => void saveChanges()}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
            >
              Save defaults
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {loading ? (
          <Group position="center">
            <Loader />
            <Text color="dimmed">Loading defaults…</Text>
          </Group>
        ) : (
          <Card radius="lg" withBorder className="border border-gray-200 bg-gray-50">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Skin type</th>
                  {SLOTS.map(slot => (
                    <th key={slot.slot}>{slot.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SKIN_TYPES.map(skinType => (
                  <tr key={skinType}>
                    <td>
                      <Text weight={600}>
                        {skinType}
                      </Text>
                    </td>
                    {SLOTS.map(slot => (
                      <td key={slot.slot}>
                        <Select
                          data={productOptions}
                          placeholder="Select product"
                          searchable
                          nothingFoundMessage="No products"
                          value={valueFor(skinType, slot.slot)}
                          onChange={value => markDraft(skinType, slot.slot, value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        <Space h="sm" />
        <Text size="xs" color="dimmed">
          Tip: use the Product Library tab to ensure each fallback product is well described and tagged for search.
        </Text>
      </Stack>
    </div>
  );
};

export default SkinTypeDefaultsEditor;
