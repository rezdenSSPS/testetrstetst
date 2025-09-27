import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Item } from '../types';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (name: string, totalQuantity: number) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([
          {
            name,
            total_quantity: totalQuantity,
            available_quantity: totalQuantity,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setItems(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId: string, quantityChange: number) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newAvailableQuantity = item.available_quantity - quantityChange;
      
      const { error } = await supabase
        .from('items')
        .update({ available_quantity: newAvailableQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setItems(prev => 
        prev.map(i => 
          i.id === itemId 
            ? { ...i, available_quantity: newAvailableQuantity }
            : i
        )
      );
    } catch (error) {
      console.error('Error updating item quantity:', error);
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
    refetch: fetchItems,
  };
}