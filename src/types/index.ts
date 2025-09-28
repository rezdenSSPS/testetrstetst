export interface ItemVariant {
   Person {
  id: string;
  name: string;
  created_at: string;
}

export interface Loan {
  id: string;
  item_id: string;
  person_id: string;
  variant_id: string | null; // Odkaz na půjčenou variantu
  quantity: number;
  notes: string;
  condition_photo: string;
  condition_notes: string;
  loaned_id: string;
  item_id: string;
  name: string;
  total_quantity: numberat: string;
  returned_at: string | null;
  items?: Item;
  people?: Person;
;
  available_quantity: number;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number  item_variants?: ItemVariant; // Detail půjčené varianty
}
