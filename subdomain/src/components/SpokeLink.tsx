"use client";

/**
 * SpokeLink — Next.js Link that auto-preserves ?subdomain=xxx on preview domains
 *
 * On production (xxx.dayaberkah.id), renders a normal Link.
 * On preview domains, automatically appends ?subdomain=xxx to the href
 * so navigation preserves the per-tab subdomain.
 *
 * Usage: Same as Next.js Link, just import SpokeLink instead.
 *   import { SpokeLink } from "@/components/SpokeLink";
 *   <SpokeLink href="/products">Products</SpokeLink>
 */

import Link from "next/link";
import { useSpoke } from "@/components/SpokeProvider";
import { type ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export function SpokeLink({ href, ...props }: LinkProps) {
  const { isPreviewDomain, subdomain, getSpokeUrl } = useSpoke();

  // On preview domains, add ?subdomain=xxx to the href
  const finalHref = isPreviewDomain && typeof href === "string"
    ? getSpokeUrl(href)
    : href;

  return <Link href={finalHref} {...props} />;
}
