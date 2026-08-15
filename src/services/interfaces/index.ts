

export interface GetAllOffersParams {
    limit: number;
    page: number;
    searchQuery?: string;
}

export interface Offer {
    id: number;
    title: string;
    description: string;
    price: number;
    category_id: number;
    status_id: number;
    user_id: number;
    created_date: Date;
    category_name: string;
    status_name: string;
    user_name: string;
}

export interface Thread {
    idthread: number;
    user_id: number;
    nextuser_id: number;
}

export interface Message {
    id: number;
    thread_id: number;
    sender_id: number;
    body: string;
    created_at: Date;
    sender_name?: string;
}

export interface ThreadWithLastMessage {
    thread_id: number;
    user_id: number;
    nextuser_id: number;
    other_user_name: string;
    last_message_id: number;
    last_message: string;
    last_message_date: Date;
    last_sender_id: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'customer';
    created_at: Date;
}

export interface Category {
    category_id: number;
    category_name: string;
}

export interface Status {
    status_id: number;
    status_name: string;
}