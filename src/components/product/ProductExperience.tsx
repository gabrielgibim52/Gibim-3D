"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState, useCallback } from "react";
import type * as THREE from "three";
import {
  type Product,
  type MaterialId,
  type SizeOption,
  FILAMENTS,
  MATERIALS,
  SIZES,
  PRODUCTS,
  getFilament,
  getMaterial,
  getSize,
  computePrice,
  formatBRL,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { ProductCard } from "../ProductCard";
import { ARModal } from "./ARModal";

const ProductViewer = dynamic(() => import("../three/ProductViewer").then((m) => m.ProductViewer), {
  ssr: false,
  loading: () => <div className="viewer-loading">Carregando 3D…</div>,
});

function Swatches({ value, onChange, label }: { value: string; onChange: (id: string) => void; label: string }) {
  return (
    <fieldset className="option-group">
      <legend>
        {label}: <strong>{getFilament(value).name}</strong>
      </legend>
      <div className="swatches">
        {FILAMENTS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`swatch ${value === f.id ? "is-selected" : ""}`}
            style={{ background: f.hex }}
            onClick={() => onChange(f.id)}
            aria-label={f.name}
            aria-pressed={value === f.id}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function ProductExperience({ product }: { product: Product }) {
  const [colorId, setColorId] = useState(product.defaultColor);
  const [secondaryId, setSecondaryId] = useState(product.allowSecondaryColor?.default ?? "branco-gelo");
  const [materialId, setMaterialId] = useState<MaterialId>(product.defaultMaterial);
  const [sizeId, setSizeId] = useState<SizeOption["id"]>("M");
  const [text, setText] = useState(product.allowText?.default ?? "");
  const [glow, setGlow] = useState(true);
  const [qty, setQty] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [arOpen, setArOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const groupRef = useRef<THREE.Group | null>(null);
  const add = useCart((s) => s.add);

  const color = getFilament(colorId);
  const secondary = getFilament(secondaryId);
  const material = getMaterial(materialId);
  const size = getSize(sizeId);
  const price = computePrice(product, materialId, sizeId);

  const config = useMemo(
    () => ({
      model: product.model,
      color: color.hex,
      secondaryColor: product.allowSecondaryColor ? secondary.hex : undefined,
      material: materialId,
      text: product.allowText ? text : undefined,
      glow: product.allowGlow ? glow : undefined,
    }),
    [product, color.hex, secondary.hex, materialId, text, glow],
  );

  const dims = product.dimensions.map((d) => (d * size.scale).toLocaleString("pt-BR", { maximumFractionDigits: 1 }));
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);
  const closeAR = useCallback(() => setArOpen(false), []);

  function addToCart() {
    add(
      {
        slug: product.slug,
        name: product.name,
        colorId,
        colorName: color.name,
        colorHex: color.hex,
        secondaryColorName: product.allowSecondaryColor ? secondary.name : undefined,
        materialId,
        materialName: material.name,
        size: sizeId,
        text: product.allowText ? text.trim().toUpperCase() : undefined,
        glow: product.allowGlow ? glow : undefined,
        unitPrice: price,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="product-layout" style={{ ["--product-color" as string]: color.hex }}>
        <div className="product-stage">
          <div className="stage-glow" />
          <ProductViewer config={config} scale={size.scale} autoRotate={autoRotate} groupRef={groupRef} />
          <div className="stage-hud">
            <span className="muted small">Arraste para girar · Pinça ou scroll para aproximar</span>
            <div className="stage-buttons">
              <button className="chip" onClick={() => setAutoRotate((v) => !v)} aria-pressed={autoRotate}>
                {autoRotate ? "Pausar giro" : "Girar sozinho"}
              </button>
              <button className="chip chip-accent" onClick={() => setArOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" />
                  <path d="M4 7.5 12 12l8-4.5M12 12v9" />
                </svg>
                Ver no seu ambiente
              </button>
            </div>
          </div>
        </div>

        <div className="product-panel">
          <nav className="breadcrumb small muted">
            <Link href="/">Início</Link> / <Link href="/#loja">Loja</Link> / <span>{product.name}</span>
          </nav>
          <h1>{product.name}</h1>
          <p className="lead">{product.tagline}</p>
          <div className="price-row">
            <strong className="price" key={price}>
              {formatBRL(price)}
            </strong>
            <span className="muted small">ou {formatBRL(price * 0.95)} no Pix</span>
          </div>

          <fieldset className="option-group">
            <legend>
              Acabamento: <strong>{material.name}</strong>
            </legend>
            <div className="material-options">
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`material-option ${materialId === m.id ? "is-selected" : ""}`}
                  onClick={() => setMaterialId(m.id)}
                  aria-pressed={materialId === m.id}
                >
                  <span className={`material-dot material-${m.id}`} style={{ ["--c" as string]: color.hex }} />
                  <span>
                    <strong>{m.name}</strong>
                    <small>{m.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <Swatches label="Cor" value={colorId} onChange={setColorId} />

          {product.allowText && (
            <fieldset className="option-group">
              <legend>{product.allowText.label}</legend>
              <div className="text-input">
                <input
                  value={text}
                  maxLength={product.allowText.maxLength}
                  onChange={(e) => setText(e.target.value.replace(/[^\p{L}\p{N} &!?.-]/gu, ""))}
                  placeholder="Digite aqui"
                  aria-label={product.allowText.label}
                />
                <span className="muted small">
                  {text.length}/{product.allowText.maxLength}
                </span>
              </div>
              <p className="muted small">Letras sem acento ficam com o melhor acabamento.</p>
            </fieldset>
          )}

          {product.allowSecondaryColor && <Swatches label={product.allowSecondaryColor.label} value={secondaryId} onChange={setSecondaryId} />}

          {product.allowGlow && (
            <fieldset className="option-group">
              <legend>Prévia da luz</legend>
              <button type="button" className={`toggle ${glow ? "is-on" : ""}`} onClick={() => setGlow((g) => !g)} aria-pressed={glow}>
                <span className="toggle-knob" />
                {glow ? "Acesa" : "Apagada"}
              </button>
            </fieldset>
          )}

          <fieldset className="option-group">
            <legend>
              Tamanho: <strong>{size.label}</strong> <span className="muted">({dims.join(" × ")} cm)</span>
            </legend>
            <div className="size-options">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`size-option ${sizeId === s.id ? "is-selected" : ""}`}
                  onClick={() => setSizeId(s.id)}
                  aria-pressed={sizeId === s.id}
                >
                  {s.id}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="buy-row">
            <div className="qty qty-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir quantidade">
                −
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar quantidade">
                +
              </button>
            </div>
            <button className={`btn btn-primary btn-grow ${added ? "is-added" : ""}`} onClick={addToCart} disabled={product.allowText && !text.trim()}>
              {added ? "Adicionado ✓" : `Adicionar · ${formatBRL(price * qty)}`}
            </button>
          </div>

          <ul className="facts">
            <li>
              <span>Produção</span>
              <strong>~{Math.round(product.printHours * size.priceMultiplier)} h de impressão</strong>
            </li>
            <li>
              <span>Envio</span>
              <strong>Em até 3 dias úteis após o pedido</strong>
            </li>
            <li>
              <span>Material</span>
              <strong>{material.name}</strong>
            </li>
          </ul>

          <p className="muted">{product.description}</p>
        </div>
      </div>

      <section className="related">
        <h2>Você também pode gostar</h2>
        <div className="product-grid">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <ARModal open={arOpen} onClose={closeAR} source={groupRef} name={product.name} />
    </>
  );
}
