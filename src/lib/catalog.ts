// Catálogo do protótipo. Depois isso pode vir de um banco de dados / painel admin.

export type MaterialId = "pla-fosco" | "pla-silk" | "petg-translucido";

export type Filament = {
  id: string;
  name: string;
  hex: string;
};

export type Material = {
  id: MaterialId;
  name: string;
  description: string;
  priceMultiplier: number;
};

export type SizeOption = {
  id: "P" | "M" | "G";
  label: string;
  scale: number;
  priceMultiplier: number;
};

export type ModelKind =
  | "vaso-espiral"
  | "vaso-facetado"
  | "luminaria"
  | "chaveiro"
  | "suporte"
  | "colmeia";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  model: ModelKind;
  defaultColor: string; // id do filamento
  defaultMaterial: MaterialId;
  /** dimensões no tamanho M, em cm: [largura, altura, profundidade] */
  dimensions: [number, number, number];
  printHours: number;
  allowText?: { label: string; maxLength: number; default: string };
  allowSecondaryColor?: { label: string; default: string };
  allowGlow?: boolean;
  badge?: string;
};

export const FILAMENTS: Filament[] = [
  { id: "laranja-gibim", name: "Laranja Gibim", hex: "#ff5a1f" },
  { id: "grafite", name: "Grafite", hex: "#33353b" },
  { id: "branco-gelo", name: "Branco Gelo", hex: "#ecebe6" },
  { id: "azul-petroleo", name: "Azul Petróleo", hex: "#1f6075" },
  { id: "verde-salvia", name: "Verde Sálvia", hex: "#8fae8b" },
  { id: "rosa-quartzo", name: "Rosa Quartzo", hex: "#e9a7a1" },
  { id: "lilas", name: "Lilás", hex: "#9d8ee0" },
  { id: "dourado", name: "Dourado", hex: "#d0a63a" },
];

export const MATERIALS: Material[] = [
  {
    id: "pla-fosco",
    name: "PLA Fosco",
    description: "Acabamento aveludado, sem brilho. O clássico.",
    priceMultiplier: 1,
  },
  {
    id: "pla-silk",
    name: "PLA Silk",
    description: "Brilho acetinado, com reflexo metálico.",
    priceMultiplier: 1.2,
  },
  {
    id: "petg-translucido",
    name: "PETG Translúcido",
    description: "Deixa a luz passar. Lindo em luminárias.",
    priceMultiplier: 1.3,
  },
];

export const SIZES: SizeOption[] = [
  { id: "P", label: "Pequeno", scale: 0.8, priceMultiplier: 0.8 },
  { id: "M", label: "Médio", scale: 1, priceMultiplier: 1 },
  { id: "G", label: "Grande", scale: 1.25, priceMultiplier: 1.45 },
];

export const PRODUCTS: Product[] = [
  {
    slug: "vaso-espiral",
    name: "Vaso Espiral",
    tagline: "Curvas que torcem a luz.",
    description:
      "Um vaso com nervuras em espiral que mudam de aparência conforme você anda em volta dele. Impresso em modo vaso, numa única linha contínua de filamento.",
    basePrice: 129.9,
    model: "vaso-espiral",
    defaultColor: "laranja-gibim",
    defaultMaterial: "pla-silk",
    dimensions: [14, 22, 14],
    printHours: 9,
    badge: "Mais vendido",
  },
  {
    slug: "vaso-facetado",
    name: "Vaso Facetado",
    tagline: "Low-poly, alto impacto.",
    description:
      "Facetas geométricas que lembram uma pedra lapidada. Cada face reflete a luz de um jeito, então ele parece outro a cada hora do dia.",
    basePrice: 99.9,
    model: "vaso-facetado",
    defaultColor: "verde-salvia",
    defaultMaterial: "pla-fosco",
    dimensions: [13, 18, 13],
    printHours: 6,
  },
  {
    slug: "luminaria-onda",
    name: "Luminária Onda",
    tagline: "Luz que escorre pelas ondas.",
    description:
      "Cúpula ondulada pensada para PETG translúcido: acesa, as ondas brilham em degradê. Acompanha soquete e lâmpada LED morna.",
    basePrice: 219.9,
    model: "luminaria",
    defaultColor: "branco-gelo",
    defaultMaterial: "petg-translucido",
    dimensions: [17, 26, 17],
    printHours: 14,
    allowGlow: true,
    badge: "Novo",
  },
  {
    slug: "chaveiro-nome",
    name: "Chaveiro com Nome",
    tagline: "Seu nome, em alto-relevo.",
    description:
      "Chaveiro personalizado com o texto que você quiser, em duas cores. Ótimo para presente, brinde de evento ou para identificar a mochila.",
    basePrice: 34.9,
    model: "chaveiro",
    defaultColor: "grafite",
    defaultMaterial: "pla-fosco",
    dimensions: [7, 2.2, 0.6],
    printHours: 1,
    allowText: { label: "Texto do chaveiro", maxLength: 10, default: "GIBIM" },
    allowSecondaryColor: { label: "Cor do texto", default: "laranja-gibim" },
  },
  {
    slug: "suporte-celular",
    name: "Suporte de Celular Lounge",
    tagline: "Seu celular merece uma espreguiçadeira.",
    description:
      "Ângulo perfeito para chamadas de vídeo, receitas e séries. Base larga e estável, com borda que segura o celular até de capinha.",
    basePrice: 59.9,
    model: "suporte",
    defaultColor: "azul-petroleo",
    defaultMaterial: "pla-fosco",
    dimensions: [11, 12, 7.5],
    printHours: 4,
  },
  {
    slug: "organizador-colmeia",
    name: "Organizador Colmeia",
    tagline: "Ordem com cara de natureza.",
    description:
      "Sete células hexagonais em alturas diferentes para canetas, pincéis e ferramentas. Fica lindo na mesa de trabalho.",
    basePrice: 89.9,
    model: "colmeia",
    defaultColor: "dourado",
    defaultMaterial: "pla-silk",
    dimensions: [16, 10, 15],
    printHours: 8,
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFilament(id: string) {
  return FILAMENTS.find((f) => f.id === id) ?? FILAMENTS[0];
}

export function getMaterial(id: MaterialId) {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];
}

export function getSize(id: SizeOption["id"]) {
  return SIZES.find((s) => s.id === id) ?? SIZES[1];
}

export function computePrice(product: Product, material: MaterialId, size: SizeOption["id"]) {
  const raw = product.basePrice * getMaterial(material).priceMultiplier * getSize(size).priceMultiplier;
  // preços terminando em ,90
  return Math.max(Math.ceil(raw) - 0.1, 0);
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
