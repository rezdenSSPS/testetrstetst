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
        .select('*, item_variants(*)')
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
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase
        .from('items')
        .insert([{ name, total_quantity: totalQuantity, available_quantity: totalQuantity }])
        .select('*, item_variants(*)')
        .single();

      if (error) throw error;
      setItems(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId: string, quantityChange: number, variantId?: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      
      if (variantId) {
        const item = items.find(i => i.id === itemId);
        const variant = item?.item_variants.find(v => v.id === variantId);
        if (!variant) return;

        const newAvailableQuantity = variant.available_quantity - quantityChange;
        
        await supabase
          .from('item_variants')
          .update({ available_quantity: newAvailableQuantity })
          .eq('id', variantId);
        
        await fetchItems();

      } else {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newAvailableQuantity = item.available_quantity - quantityChange;
        
        await supabase
          .from('items')
          .update({ available_quantity: newAvailableQuantity })
          .eq('id', itemId);

        await fetchItems();
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  };

  const addVariant = async (itemId: string, name: string, totalQuantity: number) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase
        .from('item_variants')
        .insert({
          item_id: itemId,
          name,
          total_quantity: totalQuantity,
          available_quantity: totalQuantity,
        })
        .select()
        .single();
      
      if (error) throw error;
      await fetchItems(); 
      return data;
    } catch (error) {
      console.error('Error adding variant:', error);
      throw error;
    }
  };

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

  const deleteVariant = async (variantId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from('item_variants').delete().eq('id', variantId);
      if (error) throw error;
      await fetchItems();
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
    deleteItem,
    deleteVariant,
    refetch: fetchItems,
  };
}
