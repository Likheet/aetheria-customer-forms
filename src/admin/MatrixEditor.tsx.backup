import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Select,
  Space,
  Stack,
  Table,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';
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

  const renderProductCell = (entry: MatrixEntryRow, field: keyof MatrixEntryRow) => {
    const value = getFieldValue(entry, field) as string | null;
    const product = value ? productDictionary.get(value) : null;
    if (!product) return <Text color="dimmed">-</Text>;
    return (
      <Stack spacing={0}>
        <Text weight={600} size="sm">
          {product.display_name}
        </Text>
        <Text size="xs" color="dimmed">
          {product.brand || 'Brand n/a'}
        </Text>
      </Stack>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <Stack spacing="xl">
        <div>
          <Text size="lg" weight={600}>
            Fine-tune the curated recommendations
          </Text>
          <Text size="sm" color="dimmed">
            Choose a concern, subtype, and skin-type band to adjust the cleansers, serums, moisturizers, and sunscreen recommendations in real time.
          </Text>
        </div>

        <Group spacing="md" align="flex-end">
          <Select
            label="Concern"
            placeholder="Select concern"
            data={[...new Set(subtypes.map(subtype => subtype.concern))].map(concern => ({
              value: concern,
              label: concern.replace(/^[a-z]/, s => s.toUpperCase()),
            }))}
            value={selectedConcern || null}
            onChange={value => {
              setSelectedConcern((value as ConcernKey) || '');
              setSelectedSubtype('');
            }}
            searchable
            nothingFoundMessage="No concerns"
          />

          <Select
            label="Subtype"
            placeholder={selectedConcern ? 'Select subtype' : 'Pick a concern first'}
            disabled={!selectedConcern}
            data={filteredSubtypes.map(subtype => ({
              value: subtype.id,
              label: subtype.label,
            }))}
            value={selectedSubtype || null}
            onChange={value => setSelectedSubtype(value || '')}
            searchable
            nothingFoundMessage="No subtype"
          />

          <Select
            label="Skin type"
            data={SKIN_TYPES.map(type => ({
              value: type,
              label: type,
            }))}
            value={selectedSkinType}
            onChange={value => setSelectedSkinType((value as SkinTypeKey) || 'Combo')}
          />

          <Space w="lg" />

          <Group spacing="sm">
            <Button
              variant="subtle"
              leftSection={<RefreshCcw size={16} />}
              onClick={() => void loadData()}
            >
              Refresh
            </Button>
            <Button
              variant="default"
              disabled={!hasDrafts || saving}
              onClick={resetDrafts}
            >
              Reset changes
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: 'teal', to: 'lime', deg: 120 }}
              disabled={!hasDrafts || saving}
              loading={saving}
              onClick={() => void saveChanges()}
            >
              Save matrix
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert icon={<AlertTriangle size={16} />} title="Something went wrong" color="red" variant="light">
            {error}
          </Alert>
        )}

        {successMessage && !error && (
          <Alert icon={<CheckCircle2 size={16} />} color="teal" variant="light">
            {successMessage}
          </Alert>
        )}

        {loading ? (
          <Group position="center" spacing="sm">
            <Loader />
            <Text color="dimmed">Loading matrix entries…</Text>
          </Group>
        ) : !visibleEntries.length ? (
          <Card withBorder radius="lg" padding="lg" className="border border-gray-200 bg-gray-50">
            <Stack spacing="xs">
              <Text weight={600}>
                No matrix entries match the current filters.
              </Text>
              <Text size="sm" color="dimmed">
                Try selecting a different subtype or skin type. If the subtype is brand new, add it from the Supabase table first and re-sync.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack spacing="lg">
            {BAND_ORDER.filter(band => visibleEntries.some(entry => entry.band === band)).map(band => {
              const entriesForBand = visibleEntries
                .filter(entry => entry.band === band)
                .sort((a, b) => a.skin_type.localeCompare(b.skin_type));

              return (
                <Card key={band} withBorder radius="lg" padding="lg" className="border border-gray-200 bg-gray-50">
                  <Group position="apart" align="center">
                    <Group spacing="sm">
                      <Badge
                        radius="xl"
                        size="lg"
                        color={
                          band === 'green' ? 'green' : band === 'blue' ? 'blue' : band === 'yellow' ? 'yellow' : 'red'
                        }
                        variant="filled"
                      >
                        {band.toUpperCase()} band
                      </Badge>
                      <Text size="sm" color="dimmed">
                        {entriesForBand.length} variant{entriesForBand.length === 1 ? '' : 's'} tailored to the selected filters.
                      </Text>
                    </Group>
                    <Text size="xs" color="dimmed">
                      Changes autosync with the customer view after saving.
                    </Text>
                  </Group>

                  <Space h="md" />
                  <Divider opacity={0.1} />
                  <Space h="md" />

                  {entriesForBand.map(entry => {
                    const subtype = subtypes.find(sub => sub.id === entry.subtype_id);

                    return (
                      <div key={entry.id} className="mb-10">
                        <Stack spacing="sm">
                          <Group spacing="lg">
                            <Badge variant="outline" color="gray" radius="sm">
                              {entry.skin_type}
                            </Badge>
                            <Text weight={600}>
                              {subtype?.label || 'Subtype not found'}
                            </Text>
                            <Tooltip
                              label={
                                entry.updated_at
                                  ? `Last touched ${new Date(entry.updated_at).toLocaleString()}`
                                  : 'Unversioned record'
                              }
                            >
                              <Anchor size="xs" color="dimmed">
                                View history
                              </Anchor>
                            </Tooltip>
                          </Group>

                          <Table
                            highlightOnHover
                            horizontalSpacing="md"
                            verticalSpacing="sm"
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                          >
                            <thead>
                              <tr>
                                <th className="w-[18%] text-gray-500">Slot</th>
                                <th className="w-[45%] text-gray-500">Current selection</th>
                                <th className="w-[37%] text-gray-500">Change to</th>
                              </tr>
                            </thead>
                            <tbody>
                              {SLOT_FIELDS.map(({ slot, label, key }) => (
                                <tr key={slot}>
                                  <td>
                                    <Text color="gray.3" size="sm" weight={500}>
                                      {label}
                                    </Text>
                                  </td>
                                  <td>{renderProductCell(entry, key)}</td>
                                  <td>
                                    <Select
                                      value={(getFieldValue(entry, key) as string | null) ?? null}
                                      onChange={value => markDraft(entry.id, { [key]: value } as Partial<MatrixEntryRow>)}
                                      data={productOptions}
                                      searchable
                                      clearable
                                      nothingFoundMessage="No product"
                                      placeholder="Pick a product"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>

                          <Textarea
                            label="Notes for consultants"
                            minRows={2}
                            maxRows={4}
                            autosize
                            value={(getFieldValue(entry, 'remarks') as string | null) ?? ''}
                            placeholder="Safety warnings, fallback guidance, or dermatologist escalation notes."
                            onChange={event => markDraft(entry.id, { remarks: event.currentTarget.value })}
                          />
                        </Stack>
                      </div>
                    );
                  })}
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default MatrixEditor;
