import { useState } from 'react';
import { ShieldCheck, Table as TableIcon, Gauge, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import MatrixEditor from './MatrixEditor';
import ProductCatalogManager from './ProductCatalogManager';
import SkinTypeDefaultsEditor from './SkinTypeDefaultsEditor';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('matrix');

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                      <MatrixEditor />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="products" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-6">
                      <ProductCatalogManager />
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="defaults" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="p-6">
                      <SkinTypeDefaultsEditor />
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
