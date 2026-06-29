import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext({ count: 0, refresh: () => {} });

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [count, setCount] = useState(0);

    const refresh = useCallback(async () => {
        if (!user) { setCount(0); return; }
        try {
            const res = await api.get('/api/subscriptions/cart/count/');
            setCount(res.data.count || 0);
        } catch {
            setCount(0);
        }
    }, [user]);

    useEffect(() => { refresh(); }, [refresh]);

    return (
        <CartContext.Provider value={{ count, refresh }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
