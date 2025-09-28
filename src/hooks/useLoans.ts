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
            variant_id: variantId,
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
  
  const returnLoan = async (loanId: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase
        .from('loans')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', loanId);

      if (error) throw error;
      setLoans(prev => prev.filter(loan => loan.id !== loanId));
    } catch (error) {
      console.error('Error returning loan:', error);
      throw error;
    }
  };

  const updateLoanCondition = async (loanId: string, conditionNotes: string, conditionPhoto?: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const { data, error } = await supabase
        .from('loans')
        .update({ 
          condition_notes: conditionNotes,
          ...(conditionPhoto && { condition_photo: conditionPhoto })
        })
        .eq('id', loanId)
        .select(`
            *,
            items (*),
            people (*),
            item_variants (*)
        `)
        .single();

      if (error) throw error;
      
      setLoans(prev => 
        prev.map(loan => 
          loan.id === loanId 
            ? data
            : loan
        )
      );
    } catch (error) {
      console.error('Error updating loan condition:', error);
      throw error;
    }
  };

  const uploadLoanPhoto = async (loanId: string, file: File) => {
    try {
        if (!supabase) throw new Error("Supabase client is not initialized.");

      const filePath = `public/${loanId}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from('loan_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('loan_photos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        await updateLoanCondition(loanId, loan.condition_notes, publicUrl);
      }
      
      return publicUrl;

    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
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
    uploadLoanPhoto,
    refetch: fetchLoans,
  };
}
