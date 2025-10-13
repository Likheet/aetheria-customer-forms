import { useState } from 'react';
import {
  Tabs,
  Group,
  Title,
  Button,
  Space,
  Divider,
  ThemeIcon,
  Badge,
  Container,
  Paper,
  Stack,
  Text,
  ScrollArea,
} from '@mantine/core';
import { ShieldCheck, Table as TableIcon, Gauge, ArrowLeft } from 'lucide-react';
import MatrixEditor from './MatrixEditor';
import ProductCatalogManager from './ProductCatalogManager';
import SkinTypeDefaultsEditor from './SkinTypeDefaultsEditor';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('matrix');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Container size="xl" px="md" py="xl">
        <Stack spacing="xl">
          <Group position="apart" align="center">
            <Group spacing="sm">
              <ThemeIcon radius="xl" size="xl" color="blue" variant="light">
                <Gauge size={20} />
              </ThemeIcon>
              <Stack spacing={2}>
                <Title order={2}>
                  Recommendation Command Studio
                </Title>
                <Group spacing={8}>
                  <Text size="sm" color="dimmed">
                    Manage catalogue data, tune the concern matrix, and update dynamic defaults.
                  </Text>
                  <Badge color="gray" variant="light" size="sm">
                    Internal
                  </Badge>
                </Group>
              </Stack>
            </Group>
            <Button
              size="md"
              leftSection={<ArrowLeft size={16} />}
              variant="outline"
              onClick={onClose}
            >
              Back to lounge
            </Button>
          </Group>

          <Paper
            radius="xl"
            shadow="sm"
            p="xl"
            withBorder
            className="bg-white"
          >
            <Stack spacing="lg">
              <div>
                <Title order={4}>
                  Console overview
                </Title>
                <Text size="sm" color="dimmed">
                  Pick a tab to review live data from Supabase. Panels are scrollable to keep editing controls in view.
                </Text>
              </div>

              <Divider />

              <Tabs
                value={activeTab}
                onChange={value => setActiveTab(value ?? 'matrix')}
                radius="md"
                keepMounted={false}
                variant="outline"
              >
                <Tabs.List grow>
                  <Tabs.Tab
                    value="matrix"
                    icon={<TableIcon size={16} />}
                  >
                    Concern Matrix
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="products"
                    icon={<ShieldCheck size={16} />}
                  >
                    Product Library
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="defaults"
                    icon={<Gauge size={16} />}
                  >
                    Skin-type Defaults
                  </Tabs.Tab>
                </Tabs.List>

                <Space h="lg" />

                <Tabs.Panel value="matrix">
                  <ScrollArea.Autosize mah="70vh" type="auto" offsetScrollbars>
                    <MatrixEditor />
                  </ScrollArea.Autosize>
                </Tabs.Panel>

                <Tabs.Panel value="products">
                  <ScrollArea.Autosize mah="70vh" type="auto" offsetScrollbars>
                    <ProductCatalogManager />
                  </ScrollArea.Autosize>
                </Tabs.Panel>

                <Tabs.Panel value="defaults">
                  <ScrollArea.Autosize mah="70vh" type="auto" offsetScrollbars>
                    <SkinTypeDefaultsEditor />
                  </ScrollArea.Autosize>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default AdminDashboard;
