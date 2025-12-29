import { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { GeneralSettings } from './GeneralSettings';
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
            <p className="text-gray-400">Gestiona tus preferencias y cuenta</p>
          </motion.div>
        </div>
      </div>

      <div className="px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6 bg-gray-950">
            <TabsTrigger value="general" className="flex-1">
              General
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1">
              Cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

