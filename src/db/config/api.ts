// FRONTEND - /proyecto-front-tite-master/src/db/config/api.ts
import axios from "axios";

// Se lee la variable del archivo .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ej: http://localhost:3000
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("API_URL:", import.meta.env.VITE_API_URL);


export { api };
