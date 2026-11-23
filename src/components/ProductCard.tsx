"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { type Product, getFilament, formatBRL, computePrice, SIZES } from "@/lib/catalog";

const ProductViewer = dynamic(() => import("./three/ProductViewer").then((m) => m.ProductViewer), { ssr: false });

export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const color = getFilament(product.defaultColor);
  const fromPrice = computePrice(product, "pla-fosco", SIZES[0].id);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/produto/${product.slug}`}
      className="product-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ["--card-color" as string]: color.hex }}
    >
      <div className="product-card-stage">
        {visible && (
          <ProductViewer
            interactive={false}
            autoRotate={hover}
            margin={1.5}
            config={{
              model: product.model,
              color: color.hex,
              material: product.defaultMaterial,
              text: product.allowText?.default,
              secondaryColor: product.allowSecondaryColor ? getFilament(product.allowSecondaryColor.default).hex : undefined,
              glow: product.allowGlow,
            }}
          />
        )}
        {product.badge && <span className="badge">{product.badge}</span>}
      </div>
      <div className="product-card-info">
        <div>
          <h3>{product.name}</h3>
          <p className="muted">{product.tagline}</p>
        </div>
        <div className="product-card-price">
          <span className="muted small">a partir de</span>
          <strong>{formatBRL(fromPrice)}</strong>
        </div>
      </div>
      <span className="product-card-cta">
        Personalizar <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
