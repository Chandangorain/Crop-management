import React, { createContext, useState, useEffect, useCallback } from "react";
import { getMe } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) return null;

        try {
            const response = await getMe();
            if (response.data) {
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
                return response.data;
            }
        } catch (error) {
            console.warn("Session validation failed:", error.message);
            // Don't auto-logout on network error, only if unauthorized
            if (error.response && error.response.status === 401) {
                logout();
            }
        }
        return null;
    }, []);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                // Background verify session & fresh isVerified status
                refreshUser();
            } catch (e) {
                console.error("Failed to parse stored user data:", e);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, [refreshUser]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const updateUser = (updatedFields) => {
        setUser((prev) => {
            const merged = { ...prev, ...updatedFields };
            localStorage.setItem("user", JSON.stringify(merged));
            return merged;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role: user?.role,
                isVerified: !!user?.isVerified,
                isAuthenticated: !!token,
                login,
                logout,
                updateUser,
                refreshUser,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
