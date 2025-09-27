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
          items (
            id,
            name,
            total_quantity,
            available_quantity
          ),
          people (
            id,
            name
          )
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

  const createLoan = async (itemId: string, personId: string, quantity: number, notes: string) => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([
          {
            item_id: itemId,
            person_id: personId,
            quantity,
            notes,
          },
        ])
        .select(`
          *,
          items (
            id,
            name,
            total_quantity,
            available_quantity
          ),
          people (
            id,
            name
          )
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
      const { error } = await supabase
        .from('loans')
        .update({ 
          condition_notes: conditionNotes,
          condition_photo: conditionPhoto || '',
        })
        .eq('id', loanId);

      if (error) throw error;
      
      setLoans(prev => 
        prev.map(loan => 
          loan.id === loanId 
            ? { ...loan, condition_notes: conditionNotes, condition_photo: conditionPhoto || '' }
            : loan
        )
      );
    } catch (error) {
      console.error('Error updating loan condition:', error);
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
    refetch: fetchLoans,
  };
}