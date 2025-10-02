export interface ItemVariant {
  id: string;
  item_id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  created_at: string;
  consumable: boolean;
  item_variants: ItemVariant[];
}

export interface Person {
  id: string;
  name: string;
  created_at: string;
}

export interface Loan {
  id: string;
  item_id: string;
  person_id: string;
  variant_id: string | null;
  quantity: number;
  notes: string;
  condition_photo: string;
  condition_notes: string;
  loaned_at: string;
  returned_at: string | null;
  items?: Item;
  people?: Person;
  item_variants?: ItemVariant;
}
