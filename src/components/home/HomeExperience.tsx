"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroState, HERO_COLORS } from "../three/heroState";
import { PRODUCTS } from "@/lib/catalog";
import { ProductCard } from "../ProductCard";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("../three/HeroScene").then((m) => m.HeroScene), { ssr: false });

const TOTAL_LAYERS = 1100;
const STEPS = [
  { title: "Modelagem", text: "Cada peça nasce como um modelo 3D pensado para impressão." },
  { title: "Fatiamento", text: "O modelo é dividido em mais de mil camadas de 0,2 mm." },
  { title: "Impressão", text: "O bico derrete o filamento a 210 °C e desenha camada por camada." },
  { title: "Acabamento", text: "Conferimos, limpamos e embalamos à mão antes de enviar." },
];
const COLOR_NAMES = ["Laranja Gibim", "Azul Petróleo", "Verde Sálvia", "Rosa Quartzo", "Branco Gelo"];

export function HomeExperience() {
  const root = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);
  const layerCount = useRef<HTMLSpanElement>(null);
  const layerBar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // reinicia o estado ao voltar para a home
    Object.assign(heroState, { rotation: 0, print: 0, color: 0, x: 0.12, y: 0, intro: 0 });

    const ctx = gsap.context(() => {
      // entrada: o vaso se imprime sozinho (quando o 3D estiver pronto) e o título sobe
      let started = false;
      const startIntro = () => {
        if (started) return;
        started = true;
        gsap.to(heroState, { print: 1, intro: 1, duration: reduce ? 0 : 3.2, ease: "power2.inOut" });
      };
      window.addEventListener("gibim:hero-ready", startIntro, { once: true });
      gsap.delayedCall(6, startIntro);
      gsap.from(".hero-title .word", { yPercent: 110, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.06, delay: 0.1 });
      gsap.from(".hero-fade", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.6 });

      // linha do tempo da história, controlada pelo scroll
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".story", start: "top top", end: "bottom bottom", scrub: 1 },
      });
      tl.to(heroState, { rotation: Math.PI * 0.75, x: 0, duration: 1 }, 0)
        .fromTo(heroState, { print: 1 }, { print: 0, duration: 0.7, immediateRender: false }, 0.3)
        .fromTo(heroState, { print: 0 }, { print: 1, duration: 3, immediateRender: false }, 1)
        .to(heroState, { rotation: Math.PI * 2.75, duration: 3 }, 1)
        .to(heroState, { color: HERO_COLORS.length - 1, x: -0.12, rotation: Math.PI * 3.75, duration: 2 }, 4)
        .to({}, { duration: 0.6 });

      // o canvas some quando a vitrine chega
      gsap.to(canvasWrap.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: "#loja", start: "top bottom", end: "top 35%", scrub: true },
      });

      // revelações de texto
      ScrollTrigger.batch(".reveal", {
        start: "top 85%",
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }),
      });
    }, root);

    // atualiza o painel de camadas / cores a cada frame
    const steps = root.current?.querySelectorAll<HTMLElement>(".step") ?? [];
    const colors = root.current?.querySelectorAll<HTMLElement>(".color-chip") ?? [];
    const update = () => {
      const p = Math.min(Math.max(heroState.print, 0), 1);
      if (layerCount.current) layerCount.current.textContent = Math.round(p * TOTAL_LAYERS).toLocaleString("pt-BR");
      if (layerBar.current) layerBar.current.style.transform = `scaleX(${p})`;
      const active = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
      steps.forEach((el, i) => el.classList.toggle("is-active", i === active));
      const c = Math.round(heroState.color);
      colors.forEach((el, i) => el.classList.toggle("is-active", i === c));
    };
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root}>
      <div ref={canvasWrap} className="hero-canvas" aria-hidden="true">
        <HeroScene />
      </div>

      <div className="story">
        <section className="story-hero">
          <div className="story-copy">
            <p className="eyebrow hero-fade">Impressão 3D sob encomenda</p>
            <h1 className="hero-title">
              {"Objetos que nascem camada por camada.".split(" ").map((w, i) => (
                <span key={i}>
                  <span className="word-mask">
                    <span className="word">{w}</span>
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="lead hero-fade">
              Vasos, luminárias e peças personalizadas que você gira, customiza e até coloca na sua sala antes de comprar.
            </p>
            <div className="hero-actions hero-fade">
              <Link href="#loja" className="btn btn-primary">
                Explorar a loja
              </Link>
              <Link href="/produto/chaveiro-nome" className="btn btn-ghost">
                Criar o meu
              </Link>
            </div>
          </div>
          <div className="scroll-hint hero-fade" aria-hidden="true">
            <span />
            Role para ver a peça sendo impressa
          </div>
        </section>

        <section className="story-print" id="como-fazemos">
          <div className="sticky-panel">
            <div className="story-copy panel-glass">
              <p className="eyebrow">Como fazemos</p>
              <h2>Camada por camada.</h2>
              <div className="layer-counter">
                <span ref={layerCount}>0</span>
                <small>/ {TOTAL_LAYERS.toLocaleString("pt-BR")} camadas</small>
              </div>
              <div className="layer-bar">
                <span ref={layerBar} />
              </div>
              <ol className="steps">
                {STEPS.map((s, i) => (
                  <li className="step" key={s.title}>
                    <span className="step-n">0{i + 1}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="story-colors">
          <div className="sticky-panel sticky-right">
            <div className="story-copy panel-glass">
              <p className="eyebrow">Sua cor, seu acabamento</p>
              <h2>Escolha a cor. A peça muda na hora.</h2>
              <p className="muted">
                São 8 cores de filamento e 3 acabamentos: fosco, silk metálico e translúcido. Em cada produto você vê o resultado em 3D antes de comprar.
              </p>
              <ul className="color-chips">
                {COLOR_NAMES.map((name, i) => (
                  <li className="color-chip" key={name}>
                    <span style={{ background: HERO_COLORS[i] }} />
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section id="loja" className="shop">
        <div className="section-head reveal">
          <p className="eyebrow">A loja</p>
          <h2>Escolha uma peça e deixe com a sua cara.</h2>
          <p className="muted">Gire, aproxime, troque a cor e veja no seu ambiente pela câmera do celular.</p>
        </div>
        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <div className="reveal" key={p.slug}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        {[
          { t: "Veja no seu ambiente", d: "Com realidade aumentada, a peça aparece na sua mesa em tamanho real, pela câmera do celular." },
          { t: "Feito sob demanda", d: "Nada de estoque parado: sua peça é impressa depois do pedido, do jeito que você escolheu." },
          { t: "Pix, cartão ou boleto", d: "Pagamento seguro pelo Mercado Pago, com desconto no Pix." },
        ].map((f) => (
          <div className="feature reveal" key={f.t}>
            <h3>{f.t}</h3>
            <p className="muted">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="cta-band reveal">
        <h2>Tem uma ideia que ainda não existe?</h2>
        <p className="muted">A gente modela e imprime peças sob medida. Comece por um chaveiro com o seu nome.</p>
        <Link href="/produto/chaveiro-nome" className="btn btn-primary">
          Personalizar agora
        </Link>
      </section>
    </div>
  );
}
