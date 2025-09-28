import { useState, useEffect } from 'react';
import { Package, User, Plus, Minus } from 'lucide-react';
import type { Item, Person } from '../types';

interface LoanFormProps {
  items: Item[];
  people: Person[];
  onSubmit: (itemId: string, personId: string, quantity: number, notes: string, variantId: string | null) => Promise<void>;
}

export function LoanForm({ items, people, onSubmit }: LoanFormProps) {
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(''); // Nový stav pro variantu
  const [selectedPerson, setSelectedPerson] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItemData = items.find(item => item.id === selectedItem);
  const hasVariants = selectedItemData && selectedItemData.item_variants.length > 0;
  
  const selectedVariantData = hasVariants ? selectedItemData.item_variants.find(v => v.id === selectedVariant) : null;
  const maxQuantity = selectedVariantData?.available_quantity || selectedItemData?.available_quantity || 0;

  // Reset varianty při změně hlavní věci
  useEffect(() => {
    setSelectedVariant('');
    setQuantity(1);
  }, [selectedItem]);
  
  // Reset množství při změně varianty
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedPerson || quantity <= 0 || (hasVariants && !selectedVariant)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedItem, selectedPerson, quantity, notes, selectedVariant || null);
      
      setSelectedItem('');
      setSelectedVariant('');
      setSelectedPerson('');
      setQuantity(1);
      setNotes('');
    } catch (error) {
      console.error('Error submitting loan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Package className="w-8 h-8 text-green-600" />
        Půjčit věc
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Výběr věci
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
          >
            <option value="">Vyberte věc...</option>
            {items.map(item => {
              const isAvailable = item.item_variants.length > 0
                ? item.item_variants.some(v => v.available_quantity > 0)
                : item.available_quantity > 0;
              return (
                <option 
                  key={item.id} 
                  value={item.id}
                  disabled={!isAvailable}
                >
                  {item.name} {!isAvailable && '(Všechny varianty vypůjčeny)'}
                </option>
              )
            })}
          </select>
        </div>

        {/* NOVÝ DROPDOWN PRO VARIANTY - ZOBRAZÍ SE PODLE PODMÍNKY */}
        {hasVariants && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Specifikace (varianta)
            </label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg bg-white text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            >
              <option value="">Vyberte variantu...</option>
              {selectedItemData.item_variants.map(variant => (
                <option 
                  key={variant.id} 
                  value={variant.id}
                  disabled={variant.available_quantity === 0}
                >
                  {variant.name} (k dispozici: {variant.available_quantity})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Kdo si půjčuje
          </label>
          {/* ... zbytek formuláře (výběr osoby) zůstává stejný */}
        </div>

        {(selectedItem && !hasVariants || selectedVariant) && (
          <div>
            {/* ... zbytek formuláře (množství) zůstává stejný */}
          </div>
        )}

        <div>
           {/* ... zbytek formuláře (poznámka a tlačítko) zůstává stejný */}
        </div>
      </form>
    </div>
  );
}
