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
      console.log('Supabase URL:', supabase.supabaseUrl);
      console.log('Environment check - URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
      console.log('Environment check - Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Filter out date_of_birth and photo_url if they don't exist in the database
      const sanitizedData = peopleData.map(person => ({
        name: person.name,
        // Only include date_of_birth and photo_url if they're not null/undefined
        ...(person.date_of_birth && { date_of_birth: person.date_of_birth }),
        ...(person.photo_url && { photo_url: person.photo_url })
      }));
      
      const { data, error } = await supabase
        .from('people')
        .insert(sanitizedData)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }
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
      // Sanitize filename to avoid invalid characters
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .toLowerCase();
      
      const filePath = `public/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('person_photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

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