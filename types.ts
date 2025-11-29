export interface User {
  id: string;
  name: string;
  role: string;
  location: string;
  landSize?: string;
  crops?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  timestamp: Date;
  isError?: boolean;
}

export interface Scheme {
  id: number;
  title: string;
  description: string;
  category: 'Subsidy' | 'Insurance' | 'Loan' | 'Training';
  crops: string[];
  link: string;
}

export interface MandiRecord {
  id: number;
  state: string;
  district: string;
  market: string;
  crop: string;
  variety: string;
  grade: string;
  date: string;
  minPrice: number;
  maxPrice: number;
  price: number; // Modal Price
  trend: 'up' | 'down' | 'stable';
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
  forecast: { day: string; temp: number; icon: string }[];
}