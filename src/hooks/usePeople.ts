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

  const getPersonById = async (id: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  };

  const addPerson = async (name: string) => {
    try {
      if (!supabase) throw new Error("Supabase not configured");
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

  const batchAddPeople = async (peopleData: Omit<Person, 'id' | 'created_at'>[]) => {
    if (!supabase) throw new Error("Supabase not configured");
    try {
      console.log('Saving people data:', peopleData);
      const { data, error } = await supabase
        .from('people')
        .insert(peopleData)
        .select();

      if (error) throw error;
      console.log('Successfully saved people:', data);
      await fetchPeople();
      return data;
    } catch (error) {
      console.error('Error batch adding people:', error);
      throw error;
    }
  };

  const uploadPersonPhoto = async (file: File) => {
    if (!supabase) throw new Error("Supabase client is not initialized.");
    try {
      const filePath = `public/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('person_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('person_photos')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;

    } catch (error) {
      console.error('Error uploading photo:', error);
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
    getPersonById,
    batchAddPeople,   // FIXED
    uploadPersonPhoto, // FIXED
    refetch: fetchPeople,
  };
}