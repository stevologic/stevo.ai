import type { ComponentProps } from "react";

/**
 * GitHub Pages serves full exported documents. Native navigation avoids
 * depending on router/prefetch requests for framework-specific RSC files.
 */
export default function DocumentLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
