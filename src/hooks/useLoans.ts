import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Loan } from '../types';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
      // Dotaz nyní načítá i detail varianty, pokud byla půjčena
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          items (*),
          people (*),
          item_variants (*)
        `)
        .is('returned_at', null)
        .order('loaned_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funkce nyní přijímá i volitelné variantId
  const createLoan = async (itemId: string, personId: string, quantity: number, notes: string, variantId: string | null) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase
        .from('loans')
        .insert([
          {
            item_id: itemId,
            person_id: personId,
            quantity,
            notes,
            variant_id: variantId, // Uložíme ID varianty
          },
        ])
        .select(`
            *,
            items (*),
            people (*),
            item_variants (*)
        `)
        .single();

      if (error) throw error;
      setLoans(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  };
  
  // Ostatní funkce zůstávají stejné...
  const returnLoan = async (loanId: string) => {
    // ...
  };
  const updateLoanCondition = async (loanId: string, conditionNotes: string, conditionPhoto?: string) => {
    // ...
  };
  const uploadLoanPhoto = async (loanId: string, file: File) => {
    // ...
  };


  useEffect(() => {
    fetchLoans();
  }, []);

  return {
    loans,
    loading,
    createLoan,
    returnLoan,
    updateLoanCondition,
    // uploadLoanPhoto,
    refetch: fetchLoans,
  };
}
