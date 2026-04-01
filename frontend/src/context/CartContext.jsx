import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const cart = localStorage.getItem('cartItems');
            return cart ? JSON.parse(cart) : [];
        } catch {
            localStorage.removeItem('cartItems');
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty = 1) => {
        const existItem = cartItems.find((x) => x._id === product._id);
        if (existItem) {
            const newQty = existItem.qty + qty;
            if (newQty <= 0) {
                removeFromCart(product._id);
            } else {
                setCartItems(
                    cartItems.map((x) =>
                        x._id === product._id ? { ...existItem, qty: newQty } : x
                    )
                );
            }
        } else {
            if (qty > 0) {
                setCartItems([...cartItems, { ...product, qty }]);
            }
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
