import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Item } from '../types';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
');
        setLoading(false);
        return;
      }
      
      const { data, error } =    }
  };

  const addItem = async (name: string, totalQuantity: number) => {
     await supabase
        .from('items')
        .select('*, item_variants(*)')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (errortry {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false); } = await supabase
        .from('items')
        .insert([
          {
            name,
            total_quantity: totalQuantity,
            available_quantity: totalQuantity,
          },
        ])
        .select('*, item_variants(*)')
        .single();

      if (error) throw error;
      setItems(prev
    }
  };

  const addItem = async (name: string, totalQuantity: number) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId: string, quantityChange: number, variantId?: string) => {
    try {

        .from('items')
        .insert([
          {
            name,
            total_quantity: totalQuantity,
            available_quantity: totalQuantity,
          },
        ])
        .select()
        .single      if (!supabase) throw new Error("Supabase not configured");
      
      if (variantId) {
        const item = items.find(i => i.id === itemId);
        const variant = item?.item_variants.();

      if (error) throw error;
      const newItem = { ...data, item_variants: []find(v => v.id === variantId);
        if (!variant) return;

        const newAvailableQuantity = variant.available_quantity - quantityChange;
        
        await supabase
          .from('item_variants')
 };
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

            .update({ available_quantity: newAvailableQuantity })
          .eq('id', variantId);
        const updateItemQuantity = async (itemId: string, quantityChange: number, variantId?: string) => {
    try {
        await fetchItems();

      } else {
        const item = items.find(i => i.
      if (!supabase) throw new Error("Supabase not configured");
      
      if (variantId)id === itemId);
        if (!item) return;

        const newAvailableQuantity = item.available_quantity {
        const item = items.find(i => i.id === itemId);
        const variant = item?. - quantityChange;
        
        await supabase
          .from('items')
          .update({ available_item_variants.find(v => v.id === variantId);
        if (!variant) return;

quantity: newAvailableQuantity })
          .eq('id', itemId);

        await fetchItems();
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
        const newAvailableQuantity = variant.available_quantity - quantityChange;
        
        await supabase
          .from('item_variants')
          .update({ available_quantity: newAvailableQuantity })
          .eq('id', variantId);
        
        await fetchItems();

      } else {
        const item = items.find(i =>    }
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
 i.id === itemId);
        if (!item) return;

        const newAvailableQuantity = item.available_quantity  };
}
