import axios from 'axios';

// Cliente para MockAPI (datos propios para los favoritos)
export const mockApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_MOCKAPI_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Cliente para Rick and Morty API (datos públicos de los personajes de la serie)
export const rickMortyApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_RM_API_URL,
  timeout: 15000,
});