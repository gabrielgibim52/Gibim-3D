"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type * as THREE from "three";

type Status = "exportando" | "pronto" | "erro";

/**
 * Exporta o modelo personalizado (cor, texto, tamanho) para GLB direto no navegador
 * e abre no <model-viewer>, que cuida do AR no Android (WebXR) e no iPhone (Quick Look).
 */
export function ARModal({ open, onClose, source, name }: { open: boolean; onClose: () => void; source: RefObject<THREE.Group | null>; name: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("exportando");
  const [canAR, setCanAR] = useState<boolean | null>(null);
  const viewer = useRef<HTMLElement & { canActivateAR?: boolean; activateAR?: () => void }>(null);

  useEffect(() => {
    if (!open) return;
    let revoked: string | null = null;
    let cancelled = false;
    setStatus("exportando");
    setUrl(null);
    setCanAR(null);

    (async () => {
      try {
        const [{ GLTFExporter }] = await Promise.all([
          import("three/examples/jsm/exporters/GLTFExporter.js"),
          import("@google/model-viewer"),
        ]);
        const group = source.current;
        if (!group) throw new Error("modelo não encontrado");
        const exporter = new GLTFExporter();
        const result = await exporter.parseAsync(group, { binary: true, onlyVisible: true });
        if (cancelled) return;
        const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
        revoked = URL.createObjectURL(blob);
        setUrl(revoked);
        setStatus("pronto");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("erro");
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [open, source]);

  useEffect(() => {
    const el = viewer.current;
    if (!el || !url) return;
    const onLoad = () => setCanAR(Boolean(el.canActivateAR));
    const onError = () => setStatus("erro");
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);
    // define o src direto no elemento já registrado (mais confiável que via prop do React)
    el.setAttribute("src", url);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ar-modal" role="dialog" aria-modal="true" aria-label={`Ver ${name} no seu ambiente`} data-lenis-prevent>
      <div className="ar-card">
        <div className="drawer-head">
          <h2>Ver no seu ambiente</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="ar-stage">
          {status === "exportando" && <p className="muted">Preparando sua peça personalizada…</p>}
          {status === "erro" && <p className="muted">Não foi possível preparar o modelo. Tente novamente.</p>}
          {url && (
            <model-viewer
              ref={viewer}
              alt={name}
              ar
              ar-modes="webxr quick-look"
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls=""
              auto-rotate=""
              shadow-intensity="1"
              environment-image="neutral"
              exposure="1.05"
              style={{ width: "100%", height: "100%", background: "transparent" }}
            />
          )}
        </div>
        <div className="ar-foot">
          {canAR ? (
            <button className="btn btn-primary btn-block" onClick={() => viewer.current?.activateAR?.()}>
              Abrir a câmera e posicionar
            </button>
          ) : (
            <p className="muted small">
              {canAR === false
                ? "Para ver em realidade aumentada, abra esta página no celular (Android com Chrome ou iPhone com Safari). Aqui você já pode girar a peça no tamanho real."
                : "Carregando…"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
