"use client";

import Link from "next/link";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatBRL } from "@/lib/catalog";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);

  return (
    <div className="checkout">
      <div className="checkout-main">
        <p className="eyebrow">Checkout</p>
        <h1>Quase lá.</h1>
        {items.length === 0 ? (
          <div className="checkout-empty">
            <p className="muted">Seu carrinho está vazio.</p>
            <Link href="/#loja" className="btn btn-primary">
              Ver produtos
            </Link>
          </div>
        ) : (
          <ul className="checkout-items">
            {items.map((i) => (
              <li key={i.key}>
                <span className="drawer-swatch" style={{ background: i.colorHex }} />
                <div>
                  <strong>
                    {i.qty}× {i.name}
                  </strong>
                  <span className="muted small">
                    {i.colorName} · {i.materialName} · Tam. {i.size}
                    {i.text ? ` · “${i.text}”` : ""}
                  </span>
                </div>
                <span>{formatBRL(i.qty * i.unitPrice)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <aside className="checkout-summary panel-glass">
          <div className="drawer-total">
            <span>Subtotal</span>
            <strong>{formatBRL(subtotal)}</strong>
          </div>
          <div className="drawer-total muted">
            <span>Frete</span>
            <span>calculado pelo CEP</span>
          </div>
          <div className="drawer-total accent">
            <span>No Pix (5% off)</span>
            <strong>{formatBRL(subtotal * 0.95)}</strong>
          </div>
          <button className="btn btn-primary btn-block" disabled>
            Pagar com Mercado Pago
          </button>
          <p className="muted small">
            Protótipo: o pagamento com Pix, cartão e boleto pelo Mercado Pago entra na próxima etapa.
          </p>
        </aside>
      )}
    </div>
  );
}
