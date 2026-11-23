"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatBRL } from "@/lib/catalog";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();
  const subtotal = cartSubtotal(items);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "is-open" : ""}`} onClick={close} aria-hidden="true" />
      <aside className={`cart-drawer ${isOpen ? "is-open" : ""}`} aria-label="Carrinho" aria-hidden={!isOpen} data-lenis-prevent>
        <div className="drawer-head">
          <h2>Seu carrinho</h2>
          <button className="icon-button" onClick={close} aria-label="Fechar carrinho">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Seu carrinho está vazio.</p>
            <Link href="/#loja" className="btn btn-ghost" onClick={close}>
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-items">
              {items.map((item) => (
                <li key={item.key} className="drawer-item">
                  <span className="drawer-swatch" style={{ background: item.colorHex }} />
                  <div className="drawer-item-info">
                    <Link href={`/produto/${item.slug}`} onClick={close} className="drawer-item-name">
                      {item.name}
                    </Link>
                    <span className="drawer-item-meta">
                      {item.colorName} · {item.materialName} · Tam. {item.size}
                      {item.text ? ` · “${item.text}”` : ""}
                      {item.secondaryColorName ? ` · texto ${item.secondaryColorName}` : ""}
                    </span>
                    <div className="qty">
                      <button onClick={() => setQty(item.key, item.qty - 1)} aria-label="Diminuir">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => setQty(item.key, item.qty + 1)} aria-label="Aumentar">+</button>
                      <button className="link-button" onClick={() => remove(item.key)}>Remover</button>
                    </div>
                  </div>
                  <span className="drawer-item-price">{formatBRL(item.unitPrice * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="drawer-total">
                <span>Subtotal</span>
                <strong>{formatBRL(subtotal)}</strong>
              </div>
              <p className="muted small">Frete e prazo calculados no checkout.</p>
              <Link href="/checkout" className="btn btn-primary btn-block" onClick={close}>
                Finalizar compra
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
