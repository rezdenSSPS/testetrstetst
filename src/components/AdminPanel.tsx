import { useState } from 'react';
import { Plus, Package, Users, Settings, GitCommitVertical, Trash2, CreditCard } from 'lucide-react';
import type { Item, Person } from '../types';
import { IdCardManager } from './IdCardManager';

interface AdminPanelProps {
  items: Item[];
  people: Person[];
  onAddItem: (name: string, quantity: number, consumable: boolean) => Promise<void>;
  onAddPerson: (name: string) => Promise<void>;
  onAddVariant: (itemId: string, name: string, quantity: number) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onDeleteVariant: (variantId: string) => Promise<void>;
  batchAddPeople: (peopleData: Omit<Person, 'id' | 'created_at'>[]) => Promise<any[] | null>;
  uploadPersonPhoto: (file: File) => Promise<string | undefined>;
}

export function AdminPanel({ 
    items, 
    people, 
    onAddItem, 
    onAddPerson, 
    onAddVariant, 
    onDeleteItem, 
    onDeleteVariant, 
    batchAddPeople, 
    uploadPersonPhoto 
}: AdminPanelProps) {
  const [showItemForm, setShowItemForm] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newPersonName, setNewPersonName] = useState('');
  const [isConsumable, setIsConsumable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addingVariantTo, setAddingVariantTo] = useState<string | null>(null);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantQuantity, setNewVariantQuantity] = useState(1);
  const [showIdCardManager, setShowIdCardManager] = useState(false);

  // --- DEBUGGING LOG ---
  // This will tell us if the function arrived in this component.
  console.log('AdminPanel.tsx: Received uploadPersonPhoto prop is', typeof uploadPersonPhoto);
  // --- END DEBUGGING LOG ---

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemQuantity <= 0) return;
    setIsSubmitting(true);
    try {
        await onAddItem(newItemName.trim(), newItemQuantity, isConsumable);
        setNewItemName('');
        setNewItemQuantity(1);
        setShowItemForm(false);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    setIsSubmitting(true);
    try {
        await onAddPerson(newPersonName.trim());
        setNewPersonName('');
        setShowPersonForm(false);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleAddVariant = async (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!newVariantName.trim() || newVariantQuantity <= 0) return;
    setIsSubmitting(true);
    try {
        await onAddVariant(itemId, newVariantName.trim(), newVariantQuantity);
        setNewVariantName('');
        setNewVariantQuantity(1);
        setAddingVariantTo(null);
    } finally {
        setIsSubmitting(false);
    }
  };

  const cancelAddVariant = () => {
    setAddingVariantTo(null);
    setNewVariantName('');
    setNewVariantQuantity(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Administrace
        </div>
        <button 
            onClick={() => setShowIdCardManager(!showIdCardManager)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2"
        >
            <CreditCard className="w-4 h-4"/>
            {showIdCardManager ? 'Skrýt ID Manager' : 'Správa ID Karet'}
        </button>
      </h2>

      {showIdCardManager && (
        <IdCardManager 
            people={people}
            batchAddPeople={batchAddPeople}
            uploadPersonPhoto={uploadPersonPhoto}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5" /> Věci
            </h3>
            <button onClick={() => setShowItemForm(!showItemForm)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
          {showItemForm && (
            <form onSubmit={handleAddItem} className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Název nové věci..." className="w-full p-3 border border-gray-300 rounded-lg" required />
                <input type="number" value={newItemQuantity} onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)} placeholder="Množství" min="1" className="w-full p-3 border border-gray-300 rounded-lg" required />
                <div className="flex items-center gap-2">
                  <input id="is-consumable" type="checkbox" checked={isConsumable} onChange={(e) => setIsConsumable(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                  <label htmlFor="is-consumable" className="text-sm text-gray-700 select-none">Spotřební zboží (nezobrazí se v aktivních půjčkách)</label>
                </div>
                <div className="flex gap-2">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg">{isSubmitting ? 'Přidávám...' : 'Přidat věc'}</button>
                    <button type="button" onClick={() => setShowItemForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Zrušit</button>
                </div>
            </form>
          )}
          <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
            {items.map(item => (
              <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAddingVariantTo(item.id)} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md">Přidat variantu</button>
                    <button onClick={() => onDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {item.item_variants.length === 0 && (<div className="text-sm text-gray-600">Dostupné: {item.available_quantity}/{item.total_quantity}</div>)}
                {item.item_variants.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
                    {item.item_variants.map(variant => (
                      <div key={variant.id} className="text-sm text-gray-700 flex justify-between items-center group">
                        <div className="flex items-center gap-2"><GitCommitVertical className="w-4 h-4 text-gray-400" />{variant.name} <span className="text-gray-500">({variant.available_quantity}/{variant.total_quantity})</span></div>
                        <button onClick={() => onDeleteVariant(variant.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5" /> Lidé</h3>
                <button onClick={() => setShowPersonForm(!showPersonForm)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            {showPersonForm && (
                <form onSubmit={handleAddPerson} className="space-y-3 p-4 bg-green-50 rounded-lg">
                    <input type="text" value={newPersonName} onChange={(e) => setNewPersonName(e.target.value)} placeholder="Jméno nové osoby..." className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <div className="flex gap-2">
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg">{isSubmitting ? 'Přidávám...' : 'Přidat osobu'}</button>
                        <button type="button" onClick={() => setShowPersonForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Zrušit</button>
                    </div>
                </form>
            )}
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {people.map(person => (
                <div key={person.id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    {person.photo_url && <img src={person.photo_url} alt={person.name} className="w-8 h-8 rounded-full object-cover" />}
                    <div className="font-medium text-gray-800">{person.name}</div>
                </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}