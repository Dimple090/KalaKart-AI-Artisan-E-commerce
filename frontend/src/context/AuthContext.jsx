import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch {
            localStorage.removeItem('userInfo');
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('userInfo', JSON.stringify(user));
        } else {
            localStorage.removeItem('userInfo');
        }
    }, [user]);

    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(false);

    // Ensure session stays in sync with changes during the App's lifecycle

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const updateUserAvatar = async (imageUrl) => {
        if (!user || !user.token) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('http://localhost:5000/api/users/profile/avatar', { imageUrl }, config);

            // data returns updated user fields. We need to preserve the token.
            const updatedUser = { ...data, token: user.token };
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error("Failed to update avatar context:", error);
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
            }
            throw error.response?.data?.message || 'Avatar update failed';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUserAvatar }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
