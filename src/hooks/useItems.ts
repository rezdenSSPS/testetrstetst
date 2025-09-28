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

  // NOVÁ FUNKCE PRO PŘIDÁNÍ VARIANTY
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

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    addVariant, // <-- Exportujeme novou funkci
    refetch: fetchItems,
  };
}```

---

### Krok 2: Aktualizace `src/App.tsx`

Zde si novou funkci `addVariant` vyzvedneme z hooku a vytvoříme pro ni "handler", který pak předáme do administrace.

**Nahraďte celý obsah souboru `src/App.tsx` tímto kódem:**
```typescript
import { useState } from 'react';
import { Loader2, Target, AlertCircle, Database } from 'lucide-react';
import { LoanForm } from './components/LoanForm';
import { LoanCard } from './components/LoanCard';
import { AdminPanel } from './components/AdminPanel';
import { useItems } from './hooks/useItems';
import { usePeople } from './hooks/usePeople';
import { useLoans } from './hooks/useLoans';
import { supabase } from './lib/supabase';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [notification, setNotification] = useState('');
  
  // Zde si vyzvedneme novou funkci
  const { items, loading: itemsLoading, addItem, updateItemQuantity, addVariant } = useItems();
  const { people, loading: peopleLoading, addPerson } = usePeople();
  const { 
    loans, 
    loading: loansLoading, 
    createLoan, 
    returnLoan, 
    updateLoanCondition,
    uploadLoanPhoto
  } = useLoans();

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLoanSubmit = async (itemId: string, personId: string, quantity: number, notes: string, variantId: string | null) => {
    try {
      await createLoan(itemId, personId, quantity, notes, variantId);
      await updateItemQuantity(itemId, quantity, variantId || undefined);
      showNotification('Věc byla úspěšně půjčena!');
    } catch (error) {
      console.error('Error creating loan:', error);
      showNotification('Chyba při půjčování věci!');
    }
  };

  const handleLoanReturn = async (loanId: string) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        await returnLoan(loanId);
        await updateItemQuantity(loan.item_id, -loan.quantity, loan.variant_id || undefined);
        showNotification('Věc byla úspěšně vrácena!');
      }
    } catch (error) {
      console.error('Error returning loan:', error);
      showNotification('Chyba při vracení věci!');
    }
  };

  const handleAddItem = async (name: string, quantity: number) => {
    try {
      await addItem(name, quantity);
      showNotification('Nová věc byla přidána!');
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Chyba při přidávání věci!');
    }
  };

  // NOVÝ HANDLER PRO PŘIDÁNÍ VARIANTY
  const handleAddVariant = async (itemId: string, name: string, quantity: number) => {
    try {
      await addVariant(itemId, name, quantity);
      showNotification('Varianta byla úspěšně přidána!');
    } catch (error) {
      console.error('Error adding variant:', error);
      showNotification('Chyba při přidávání varianty!');
    }
  };

  const handleAddPerson = async (name: string) => {
    try {
      await addPerson(name);
      showNotification('Nová osoba byla přidána!');
    } catch (error) {
      console.error('Error adding person:', error);
      showNotification('Chyba při přidávání osoby!');
    }
  };

  const loading = itemsLoading || peopleLoading || loansLoading;

  if (!supabase) {
    // ... (kód pro nenakonfigurovanou databázi)
  }

  if (loading) {
    // ... (kód pro načítání)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ... (header a notifikace) */}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <LoanForm
              items={items}
              people={people}
              onSubmit={handleLoanSubmit}
            />

            {showAdmin && (
              <AdminPanel
                items={items}
                people={people}
                onAddItem={handleAddItem}
                onAddPerson={handleAddPerson}
                onAddVariant={handleAddVariant} // <-- Předáme novou funkci jako prop
              />
            )}
          </div>

          <div>
            {/* ... (zobrazení aktivních půjček) */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
