import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Add request interceptor for attaching Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 401) {
            const refreshToken = localStorage.getItem("REFRESH_TOKEN");
            if (refreshToken) {
                try {
                    const response = await axios.post("/api/token/refresh/", { refresh: refreshToken });
                    localStorage.setItem("ACCESS_TOKEN", response.data.access);
                    error.config.headers.Authorization = `Bearer ${response.data.access}`;
                    return axios(error.config);
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    const { logout } = useContext(AuthContext);
                    logout();
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
