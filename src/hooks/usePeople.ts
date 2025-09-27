import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Person } from '../types';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPeople = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('name');

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      setPeople(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  return {
    people,
    loading,
    addPerson,
    refetch: fetchPeople,
  };
}