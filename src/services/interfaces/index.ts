export interface GetAllOffersParams {
    limit: number;
    page: number;
    searchQuery?: string;
}
export interface Offer {
  id: number;
  title: string;
  description: string;
  category_id: number;
  status_id: number;
  user_id: number;
  created_date: Date;
  category_name: string;
  status_name: string;
  user_name: string;
}