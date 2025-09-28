import { useState } from 'react';
import { Plus, Package, Users, Settings, GitCommitVertical } from 'lucide-react';
import type { Item, Person } from '../types';

interface AdminPanelProps {
  items: Item[];
  people: Person[];
  onAddItem: (name: string, quantity: number) => Promise<void>;
  onAddPerson: (name: string) => Promise<void>;
  onAddVariant: (itemId: string, name: string, quantity: number) => Promise<void>;
}

export function AdminPanel({ items, people, onAddItem, onAddPerson, onAddVariant }: AdminPanelProps) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stavy pro formulář varianty
  const [addingVariantTo, setAddingVariantTo] = useState<string | null>(null);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantQuantity, setNewVariantQuantity] = useState(1);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemQuantity <= 0) return;
    setIsSubmitting(true);
    await onAddItem(newItemName.trim(), newItemQuantity);
    setNewItemName('');
    setNewItemQuantity(1);
    setShowItemForm(false);
    setIsSubmitting(false);
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    setIsSubmitting(true);
    await onAddPerson(newPersonName.trim());
    setNewPersonName('');
    setShowPersonForm(false);
    setIsSubmitting(false);
  };
  
  const handleAddVariant = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!newVariantName.trim() || newVariantQuantity <= 0) return;
    setIsSubmitting(true);
    await onAddVariant(itemId, newVariantName.trim(), newVariantQuantity);
    setNewVariantName('');
    setNewVariantQuantity(1);
    setAddingVariantTo(null);
    setIsSubmitting(false);
  };

  const cancelAddVariant = () => {
    setAddingVariantTo(null);
    setNewVariantName('');
    setNewVariantQuantity(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        Administrace
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sekce Věci */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5" /> Věci
            </h3>
            <button onClick={() => setShowItemForm(!showItemForm)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          {showItemForm && (
            <form onSubmit={handleAddItem} className="space-y-3 p-4 bg-blue-50 rounded-lg">{/* ... formulář pro přidání věci ... */}</form>
          )}

          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {items.map(item => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <button onClick={() => setAddingVariantTo(item.id)} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md transition-colors">Přidat variantu</button>
                </div>
                {item.item_variants.length === 0 && (
                  <div className="text-sm text-gray-600">Dostupné: {item.available_quantity}/{item.total_quantity}</div>
                )}
                
                {item.item_variants.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
                    {item.item_variants.map(variant => (
                      <div key={variant.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <GitCommitVertical className="w-4 h-4 text-gray-400" />
                        {variant.name} <span className="text-gray-500">({variant.available_quantity}/{variant.total_quantity})</span>
                      </div>
                    ))}
                  </div>
                )}

                {addingVariantTo === item.id && (
                  <form onSubmit={(e) => handleAddVariant(e, item.id)} className="mt-3 space-y-2 p-3 bg-gray-100 rounded-lg">
                    <input type="text" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} placeholder="Název varianty..." className="w-full p-2 border border-gray-300 rounded-md text-sm" required />
                    <input type="number" value={newVariantQuantity} onChange={(e) => setNewVariantQuantity(parseInt(e.target.value) || 1)} placeholder="Množství" min="1" className="w-full p-2 border border-gray-300 rounded-md text-sm" required />
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm py-1 px-3 rounded-md transition-colors">{isSubmitting ? 'Přidávám...' : 'Přidat variantu'}</button>
                      <button type="button" onClick={cancelAddVariant} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">Zrušit</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sekce Lidé */}
        <div className="space-y-4">{/* ... kód pro sekci Lidé zůstává stejný ... */}</div>
      </div>
    </div>
  );
}
