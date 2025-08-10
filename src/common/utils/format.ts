export const formatNumber = (value: number) => {
  if (value >= 1_000_000) {
    const truncated = Math.floor(value / 100_000) / 10; // Trunca para 1 casa decimal
    return `${Number.isInteger(truncated) ? truncated.toFixed(0) : truncated}M`;
  }

  if (value >= 1_000) {
    return `${Math.floor(value / 1_000)}K`;
  }

  return value.toString();
};
