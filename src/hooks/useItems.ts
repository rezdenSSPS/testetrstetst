import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Item } from '../types';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    // ... (tato funkce zůstává stejná)
  };

  const addItem = async (name: string, totalQuantity: number) => {
    // ... (tato funkce zůstává stejná)
  };

  const updateItemQuantity = async (itemId: string, quantityChange: number, variantId?: string) => {
    // ... (tato funkce zůstává stejná)
  };

  const addVariant = async (itemId: string, name: string, totalQuantity: number) => {
    // ... (tato funkce zůstává stejná)
  };

  // NOVÁ FUNKCE PRO SMAZÁNÍ HLAVNÍ VĚCI
  const deleteItem = async (itemId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from('items').delete().eq('id', itemId);
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  // NOVÁ FUNKCE PRO SMAZÁNÍ VARIANTY
  const deleteVariant = async (variantId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from('item_variants').delete().eq('id', variantId);
      if (error) throw error;
      await fetchItems(); // Znovu načteme, aby se aktualizovaly počty
    } catch (error) {
      console.error('Error deleting variant:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    addVariant,
    deleteItem,    // <-- Exportujeme novou funkci
    deleteVariant, // <-- Exportujeme novou funkci
    refetch: fetchItems,
  };
}
