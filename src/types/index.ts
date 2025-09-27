export interface Item {
  id: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  created_at: string;
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
  quantity: number;
  notes: string;
  condition_photo: string;
  condition_notes: string;
  loaned_at: string;
  returned_at: string | null;
  items?: Item;
  people?: Person;
}