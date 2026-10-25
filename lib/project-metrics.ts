/**
 * Count/stat badges such as "296K+ CVEs", "40+ tools", or "24+ products".
 * Qualitative highlights and Winter Hunt's genre / Steam / tracker lines
 * stay on the card — they are content, not metrics.
 */
export function isCountStatMetric(metric: string): boolean {
  const firstToken = metric.trim().split(/\s+/, 1)[0] ?? "";
  return /^~?\d[\d,]*(?:\.\d+)?(?:[KMB])?\+?(?:KB|MB|GB)?$/i.test(firstToken);
}

export function qualitativeHighlights(metrics: readonly string[]): string[] {
  return metrics.filter((metric) => !isCountStatMetric(metric));
}
