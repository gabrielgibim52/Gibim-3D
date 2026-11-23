# Gibim 3D

E-commerce de peças impressas em 3D com experiência interativa: o cliente gira os produtos em 3D, personaliza cor, acabamento, tamanho e texto, e vê a peça no próprio ambiente com realidade aumentada (AR) pelo celular.

> **Status:** protótipo visual. Catálogo, personalizador, carrinho e AR funcionando. O pagamento (Mercado Pago: Pix, cartão e boleto) entra na próxima etapa.

## O que tem

- **Home com história em scroll**: o vaso se imprime camada por camada conforme a pessoa rola a página, com contador de camadas e troca de cores.
- **Produtos em 3D**: 6 peças geradas por código (sem arquivos de modelo), com textura imitando as camadas da impressão.
- **Personalizador**: cor do filamento, acabamento (PLA fosco, PLA silk, PETG translúcido), tamanho P/M/G, texto em alto-relevo (chaveiro) e prévia da luz (luminária). O preço atualiza na hora.
- **Ver no seu ambiente (AR)**: exporta a peça personalizada para GLB no navegador e abre no `<model-viewer>` (Android com Chrome e iPhone com Safari).
- **Carrinho** lateral salvo no navegador e página de checkout (resumo e desconto no Pix).

## Rodando localmente

Requisitos: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

Build de produção:

```bash
npm run build
npm start
```

## Estrutura

```
src/
  app/                      páginas (home, produto/[slug], checkout)
  components/
    home/HomeExperience     história em scroll (GSAP + ScrollTrigger)
    product/                página de produto, personalizador e modal de AR
    three/                  cenas 3D (React Three Fiber), geometrias e materiais
  lib/
    catalog.ts              produtos, cores, acabamentos, tamanhos e preços
    cart.ts                 carrinho (zustand, salvo no localStorage)
```

Para adicionar ou alterar produtos, preços e cores, edite `src/lib/catalog.ts`.

## Tecnologias

Next.js 16, React 19, Three.js com React Three Fiber e drei, GSAP com ScrollTrigger, Lenis (scroll suave), `@google/model-viewer` (AR) e zustand.

## Próximos passos

1. Checkout com Mercado Pago (Pix, cartão e boleto) e cálculo de frete pelo CEP.
2. Banco de dados de produtos e pedidos, com painel admin.
3. Fotos reais das peças e modelos 3D exportados do fatiador.
4. Deploy (por exemplo, Vercel) e domínio próprio.
