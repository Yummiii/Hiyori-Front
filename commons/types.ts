export interface Book {
  id: string;
  name: string;
  collection_id: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface Page {
  id: string;
  file_name: string;
  page_number: number;
}
