import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export function CategoriesSettings() {
  const { customCategories, loadingCategories, createCategory, updateCategory, deleteCategory } = useSettings();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await createCategory(categoryName.trim());
      setCategoryName('');
      setShowCreateModal(false);
      toast.success('Categoría creada exitosamente');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('El nombre de categoría ya existe');
      } else {
        toast.error('Error al crear la categoría');
      }
    }
  };

  const handleEdit = async (id: string) => {
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await updateCategory(id, { name: categoryName.trim() });
      setCategoryName('');
      setEditingCategory(null);
      toast.success('Categoría actualizada exitosamente');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('El nombre de categoría ya existe');
      } else {
        toast.error('Error al actualizar la categoría');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCategory(id);
      setDeletingCategory(null);
      toast.success(result.warning || 'Categoría eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  const startEdit = (category: { _id: string; name: string }) => {
    setEditingCategory(category._id);
    setCategoryName(category.name);
  };

  if (loadingCategories) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Categorías Personalizadas</h4>
        <Button
          variant="primary"
          onClick={() => {
            setCategoryName('');
            setShowCreateModal(true);
          }}
          className="text-sm px-3 py-1.5"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      {customCategories.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No tienes categorías personalizadas</p>
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(true)}
              className="text-sm"
            >
              Crear primera categoría
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {customCategories.map((category) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-600" />
                    <span className="text-white">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => startEdit(category)}
                      className="text-sm px-3 py-1.5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setDeletingCategory(category._id)}
                      className="text-sm px-3 py-1.5 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Nombre de la categoría"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej: Orgánico"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateModal(false);
                  setCategoryName('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                className="flex-1"
              >
                Crear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Nombre de la categoría"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej: Orgánico"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => editingCategory && handleEdit(editingCategory)}
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              ¿Estás seguro de que deseas eliminar esta categoría? Los productos que la usan mantendrán el nombre pero la categoría ya no estará disponible para nuevas selecciones.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingCategory(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => deletingCategory && handleDelete(deletingCategory)}
                className="flex-1 bg-error hover:bg-error/90"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

