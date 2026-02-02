import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/useCart";

export default function Cart() {
  const { items, total, loading, refresh, remove, setQty, checkout } = useCart();
  const [localQty, setLocalQty] = useState({});

  useEffect(() => {
    refresh();
     
  }, []);

  useEffect(() => {
    const next = {};
    for (const it of items) next[it.cart_item_id] = it.quantity;
    setLocalQty(next);
  }, [items]);

  const canCheckout = useMemo(() => items.length > 0 && items.every((it) => it.stock >= it.quantity), [items]);

  return (
    <div className="container">
      <h1 className="page-title">Cart</h1>

      {loading ? (
        <div className="card">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card">Your cart is empty.</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>Total</strong>
              <strong>₹{total}</strong>
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await checkout();
                  } catch (e) {
                    toast.error(e?.response?.data?.error || "Checkout failed");
                  }
                }}
                disabled={!canCheckout}
              >
                Checkout
              </button>
              {!canCheckout && (
                <span className="muted" style={{ marginLeft: 10 }}>
                  Fix stock issues before checkout.
                </span>
              )}
            </div>
          </div>

          <div className="grid">
            {items.map((it) => (
              <div className="card" key={it.cart_item_id}>
                {it.image_url ? <img className="img" src={it.image_url} alt={it.name} /> : <div className="img" />}
                <strong style={{ display: "block", marginTop: 10 }}>{it.name}</strong>
                <div className="muted" style={{ marginTop: 6 }}>
                  ₹{it.price} • qty {it.quantity} • subtotal ₹{it.subtotal}
                </div>
                {it.stock <= 0 && <div className="badge danger" style={{ marginTop: 10 }}>Out of stock</div>}
                <div className="row" style={{ marginTop: 12 }}>
                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(0, (localQty[it.cart_item_id] ?? it.quantity) - 1);
                        setLocalQty((p) => ({ ...p, [it.cart_item_id]: next }));
                      }}
                    >
                      -
                    </button>
                    <input
                      value={localQty[it.cart_item_id] ?? it.quantity}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d]/g, "");
                        setLocalQty((p) => ({ ...p, [it.cart_item_id]: v === "" ? 0 : Number(v) }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (localQty[it.cart_item_id] ?? it.quantity) + 1;
                        setLocalQty((p) => ({ ...p, [it.cart_item_id]: next }));
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      const qty = Number(localQty[it.cart_item_id] ?? it.quantity);
                      try {
                        await setQty(it.cart_item_id, qty);
                      } catch (e) {
                        toast.error(e?.response?.data?.error || "Failed to update");
                        await refresh();
                      }
                    }}
                  >
                    Update
                  </button>
                  <button className="btn btn-ghost" onClick={() => remove(it.cart_item_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

