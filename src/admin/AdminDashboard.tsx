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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
                <Gauge className="h-7 w-7 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Recommendation Command Studio
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-600">
                    Manage catalogue data, tune the concern matrix, and update dynamic defaults.
                  </p>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-xs border-0">
                    INTERNAL
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="gap-2 border-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to lounge
            </Button>
          </div>

          {/* Main Content Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="space-y-3 pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-semibold text-slate-900">Console overview</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Pick a tab to review live data from Supabase. Panels are scrollable to keep editing controls in view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
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

                <TabsContent value="matrix" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                    <MatrixEditor />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="products" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                    <ProductCatalogManager />
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="defaults" className="mt-0">
                  <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                    <SkinTypeDefaultsEditor />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
