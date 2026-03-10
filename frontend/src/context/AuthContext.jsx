import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    function login(userData, authToken) {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() { return useContext(AuthContext); }
