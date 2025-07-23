/**
 *
 * - largura_base:      1366px
 * - padding_x_base:      86px
 * - padding_x_header:   100px
 * - font_size_root:      16px
 *
 *  6.296vw  = (padding_x_base / largura_base) * 100
 *  0.875rem = (padding_x_header - padding_x_base) / font_size_root
 */

export const MAIN_PADDING_X = "clamp(1rem, 6.296vw, 120px)";
export const UNDO_MAIN_PADDING_X = "clamp(-120px, -6.296vw, -1rem)";
export const HEADER_PADDING_X = "clamp(1.5rem, 7.32vw, 140px)";
