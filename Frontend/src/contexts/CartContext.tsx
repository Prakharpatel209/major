import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  image: string;
  title: string;
  pricePerDay: number;
  location: string;
  rating: string;
  category: string;
  fromDate: string;
  toDate: string;
  days: number;
  deposit: number;
  insurance: string;
  insuranceCost: number;
}

interface AddToCartItem {
  image: string;
  title: string;
  pricePerDay: number;
  location: string;
  rating: string;
  category: string;
  fromDate?: string;
  toDate?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const calculateDays = (fromDate: string, toDate: string): number => {
    if (!fromDate || !toDate) return 1;
    try {
      // Handle date strings in format YYYY-MM-DD
      const from = fromDate.includes('T') 
        ? new Date(fromDate) 
        : new Date(fromDate + 'T12:00:00');
      const to = toDate.includes('T') 
        ? new Date(toDate) 
        : new Date(toDate + 'T12:00:00');
      
      if (isNaN(from.getTime()) || isNaN(to.getTime())) return 1;
      
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1; // Minimum 1 day
    } catch {
      return 1;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // Handle date strings in format YYYY-MM-DD
      const date = dateString.includes('T') 
        ? new Date(dateString) 
        : new Date(dateString + 'T12:00:00');
      
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const addToCart = (item: AddToCartItem) => {
    // Get dates from item or use defaults
    const fromDateStr = item.fromDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const toDateStr = item.toDate || new Date(Date.now() + 259200000).toISOString().split('T')[0];
    
    // Calculate days based on actual dates
    const days = calculateDays(fromDateStr, toDateStr);
    
    // Format dates for display
    const fromDate = formatDate(fromDateStr);
    const toDate = formatDate(toDateStr);

    const newItem: CartItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      fromDate,
      toDate,
      days,
      insurance: "Standard",
      insuranceCost: 15,
      deposit: Math.round(item.pricePerDay * days),
    };

    setItems((prev) => [...prev, newItem]);
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart for ${days} day${days !== 1 ? 's' : ''}.`,
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => items.length;

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + item.pricePerDay * item.days, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
