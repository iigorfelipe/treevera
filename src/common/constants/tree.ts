import type { Kingdom } from "../types/api";

// #region KINGDOM
export const NAME_KINGDOM_BY_KEY: { [key: number]: Kingdom } = {
  1: "animalia",
  2: "archaea",
  3: "bacteria",
  4: "chromista",
  5: "fungi",
  6: "plantae",
  7: "protozoa",
};

export const KEY_KINGDOM_BY_NAME: { [name in Kingdom]: number } = {
  animalia: 1,
  archaea: 2,
  bacteria: 3,
  chromista: 4,
  fungi: 5,
  plantae: 6,
  protozoa: 7,
};

export const COLOR_KINGDOM_BY_KEY: { [key: number]: string } = {
  1: "#ff6b4d",
  2: "#b561ff",
  3: "#2fb5a0",
  4: "#ffb700",
  5: "#c84726",
  6: "#5bbd38",
  7: "#2196f3",
};

export const COLOR_KINGDOM_BY_NAME: { [name in Kingdom]: string } = {
  animalia: "#ff6b4d",
  archaea: "#b561ff",
  bacteria: "#2fb5a0",
  chromista: "#ffb700",
  fungi: "#c84726",
  plantae: "#5bbd38",
  protozoa: "#2196f3",
};

export const BORDER_KINGDOM_BY_KEY: { [key: number]: string } = {
  1: "border-[#ff6b4d]",
  2: "border-[#b561ff]",
  3: "border-[#2fb5a0]",
  4: "border-[#ffb700]",
  5: "border-[#c84726]",
  6: "border-[#5bbd38]",
  7: "border-[#2196f3]",
};

// #region LAYOUT

// Estas constantes controlam o espaçamento, alinhamento e dimensões dos
// conectores e do botão de expandir/colapsar.

/**
 * Quanto menor o valor, mais próximas ficam as colunas verticais.
 */
export const TREE_LEVEL_INDENT_PX = 20;

/**
 * Espessura (largura) das linhas dos conectores (em px).
 */
export const TREE_CONNECTOR_LINE_WIDTH_PX = 2;

/**
 * Comprimento fixo dos braços horizontais (em px).
 */
export const TREE_CONNECTOR_HORIZONTAL_LENGTH_PX = 20;

/**
 * Diâmetro (largura/altura) do botão circular de expandir/colapsar (em px).
 */
export const TREE_TOGGLE_BUTTON_DIAMETER_PX = 20;

/**
 * Deslocamento horizontal do botão circular em relação ao conteúdo (em px).
 * Valor negativo "empurra" o círculo para a esquerda,
 * garantindo que ele se alinhe com os conectores horizontais.
 */
export const TREE_TOGGLE_BUTTON_OFFSET_X_PX = -9;
