import { useState } from 'react';
import { Package, User, Plus, Minus } from 'lucide-react';
import type { Item, Person } from '../types';

interface LoanFormProps {
  items: Item[];
  people: Person[];
  onSubmit: (itemId: string, personId: string, quantity: number, notes: string) => Promise<void>;
}

export function LoanForm({ items, people, onSubmit }: LoanFormProps) {
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItemData = items.find(item => item.id === selectedItem);
  const maxQuantity = selectedItemData?.available_quantity || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedPerson || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedItem, selectedPerson, quantity, notes);
      
      // Reset form
      setSelectedItem('');
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
        {/* Item Selection */}
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
            {items.map(item => (
              <option 
                key={item.id} 
                value={item.id}
                disabled={item.available_quantity === 0}
              >
                {item.name} (k dispozici: {item.available_quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Person Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Kdo si půjčuje
          </label>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
          >
            <option value="">Vyberte osobu...</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        {selectedItem && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Množství
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
                className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <span className="text-2xl font-bold text-gray-800 min-w-[60px] text-center">
                {quantity}
              </span>
              
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                disabled={quantity >= maxQuantity}
                className="p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600">
                (max: {maxQuantity})
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Poznámka
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Volitelná poznámka..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedItem || !selectedPerson || quantity <= 0 || isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-3"
        >
          <User className="w-6 h-6" />
          {isSubmitting ? 'Půjčuji...' : 'Půjčit'}
        </button>
      </form>
    </div>
  );
}