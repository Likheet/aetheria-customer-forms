import { lazy, Suspense, useState } from 'react';
import { ShieldCheck, Table as TableIcon, Gauge, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';

interface AdminDashboardProps {
  onClose: () => void;
}

type AdminTab = 'matrix' | 'products' | 'defaults';

const MatrixEditor = lazy(() => import('./MatrixEditor'));
const ProductCatalogManager = lazy(() => import('./ProductCatalogManager'));
const SkinTypeDefaultsEditor = lazy(() => import('./SkinTypeDefaultsEditor'));

const TAB_LOADING_COPY: Record<AdminTab, string> = {
  matrix: 'Loading concern matrix…',
  products: 'Booting product library…',
  defaults: 'Fetching skin-type defaults…',
};

const TabLoader = ({ message }: { message: string }) => (
  <div className="flex h-[40vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
    <Spinner className="h-5 w-5" />
    <span>{message}</span>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('matrix');
  const [mountedTabs, setMountedTabs] = useState<Record<AdminTab, boolean>>({
    matrix: true,
    products: false,
    defaults: false,
  });

  const handleTabChange = (value: string) => {
    const tab = value as AdminTab;
    setActiveTab(tab);
    setMountedTabs(prev => (prev[tab] ? prev : { ...prev, [tab]: true }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Recommendation Command Studio
                </h1>
                <p className="text-muted-foreground">
                  Manage catalogue, tune the matrix, and update defaults.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Lounge
            </Button>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="matrix" className="gap-2 text-sm font-medium">
                <TableIcon className="h-4 w-4" />
                Concern Matrix
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Product Library
              </TabsTrigger>
              <TabsTrigger value="defaults" className="gap-2 text-sm font-medium">
                <Gauge className="h-4 w-4" />
                Skin-type Defaults
              </TabsTrigger>
            </TabsList>

            <Card className="mt-4">
              <CardContent className="p-0">
                <TabsContent value="matrix" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-6">
                      {mountedTabs.matrix ? (
                        <Suspense fallback={<TabLoader message={TAB_LOADING_COPY.matrix} />}>
                          <MatrixEditor />
                        </Suspense>
                      ) : (
                        <TabLoader message={TAB_LOADING_COPY.matrix} />
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="products" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-6">
                      {mountedTabs.products ? (
                        <Suspense fallback={<TabLoader message={TAB_LOADING_COPY.products} />}>
                          <ProductCatalogManager />
                        </Suspense>
                      ) : (
                        <TabLoader message={TAB_LOADING_COPY.products} />
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="defaults" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-6">
                      {mountedTabs.defaults ? (
                        <Suspense fallback={<TabLoader message={TAB_LOADING_COPY.defaults} />}>
                          <SkinTypeDefaultsEditor />
                        </Suspense>
                      ) : (
                        <TabLoader message={TAB_LOADING_COPY.defaults} />
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
