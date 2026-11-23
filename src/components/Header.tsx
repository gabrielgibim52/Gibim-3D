"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/lib/cart";
import { Logo } from "./Logo";

export function Header() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    useCart.persist.rehydrate();
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = cartCount(items);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" aria-label="Gibim 3D, página inicial">
        <Logo />
      </Link>
      <nav className="site-nav">
        <Link href="/#loja">Loja</Link>
        <Link href="/#como-fazemos">Como fazemos</Link>
        <Link href="/produto/chaveiro-nome">Personalize</Link>
      </nav>
      <button className="cart-button" onClick={open} aria-label={`Abrir carrinho, ${count} itens`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
        <span>Carrinho</span>
        {count > 0 && <span className="cart-badge">{count}</span>}
      </button>
    </header>
  );
}
