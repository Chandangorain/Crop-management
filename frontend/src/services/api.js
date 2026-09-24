import axios from "axios";

// Prefer relative '/api' which Vite proxies to localhost:5000, or fallback to absolute
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor: automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: automatically handle 401 Unauthorized redirect
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if current page is not already login or register
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login?sessionExpired=true";
            }
        }
        return Promise.reject(error);
    }
);

// Authentication Services
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (profileData) => api.put("/auth/profile", profileData);

// Admin Services
export const getAllUsers = (params) => api.get("/admin/users", { params });
export const verifyUser = (userId, isVerified) => api.put(`/admin/users/${userId}/verify`, { isVerified });
export const getAdminAnalytics = () => api.get("/admin/analytics");
export const getAllCrops = () => api.get("/admin/crops");
export const getCropById = (cropId) => api.get(`/admin/crops/${cropId}`);
export const createCrop = (cropData) => api.post("/admin/crops", cropData);
export const updateCrop = (cropId, cropData) => api.put(`/admin/crops/${cropId}`, cropData);
export const deleteCrop = (cropId) => api.delete(`/admin/crops/${cropId}`);

// Mill Requirement Services
export const createMillRequirement = (data) => api.post("/mill-requirements/create", data);
export const getMyRequirements = () => api.get("/mill-requirements/my-requirements");
export const getAllActiveRequirements = () => api.get("/mill-requirements/active-requirements");
export const updateRequirementStatus = (requirementId, status) => api.put(`/mill-requirements/${requirementId}/status`, { status });
export const getMillOwnerInspections = () => api.get("/mill-requirements/my-inspections");

// Sell Offer Services
export const createSellOffer = (data) => api.post("/sell-offers/create", data);
export const getMyOffers = () => api.get("/sell-offers/my-offers");
export const getAllPendingOffers = () => api.get("/sell-offers/all-pending");
export const getOfferDetails = (offerId) => api.get(`/sell-offers/${offerId}`);

// Inspection Services
export const assignInspection = (data) => api.post("/inspections/assign", data);
export const getAllInspections = () => api.get("/inspections/all");
export const getMyInspections = () => api.get("/inspections/my-inspections");
export const getInspectionDetails = (inspectionId) => api.get(`/inspections/${inspectionId}`);
export const completeInspection = (inspectionId, data) => api.put(`/inspections/${inspectionId}/complete`, data);

export default api;
