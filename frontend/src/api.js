import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import { useNavigate } from "react-router-dom"; // Ensure React Router is used in your app

const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
});

// Add request interceptor for attaching the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling 404 errors
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response && error.response.status === 404) {
      const navigate = useNavigate(); // Use React Router's navigation
      navigate("/login"); // Redirect to login page (adjust to register if needed)
    }
    return Promise.reject(error);
  }
);

export default api;
