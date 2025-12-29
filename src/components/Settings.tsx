import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GeneralSettings } from './GeneralSettings';
import { CategoriesSettings } from './CategoriesSettings';
import { AccountSettings } from './AccountSettings';
import { motion } from 'motion/react';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h1>Configuración</h1>
            <p className="text-gray-400">Personaliza tu experiencia</p>
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="categories" className="mt-0">
            <CategoriesSettings />
          </TabsContent>

          <TabsContent value="account" className="mt-0">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

