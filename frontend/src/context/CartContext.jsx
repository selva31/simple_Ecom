import { createContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";
import { useAuth } from "./useAuth";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      setCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart/");
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
      setCount(res.data?.count ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
     
  }, [user?.id]);

  const add = async (productId) => {
    await api.post(`/cart/add/${productId}`);
    toast.success("Added to cart");
    await refresh();
  };

  const remove = async (cartItemId) => {
    await api.delete(`/cart/remove/${cartItemId}`);
    toast.success("Removed from cart");
    await refresh();
  };

  const setQty = async (cartItemId, quantity) => {
    await api.patch(`/cart/item/${cartItemId}`, { quantity });
    toast.success("Cart updated");
    await refresh();
  };

  const checkout = async () => {
    const res = await api.post("/cart/checkout");
    toast.success(res.data?.message || "Checkout successful");
    await refresh();
    return res.data;
  };

  const value = useMemo(
    () => ({
      items,
      total,
      count,
      loading,
      refresh,
      add,
      remove,
      setQty,
      checkout,
    }),
    [items, total, count, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

