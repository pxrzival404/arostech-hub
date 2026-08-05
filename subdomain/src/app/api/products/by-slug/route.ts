import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/sanity/fetchers";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/products/by-slug?slug=xxx
 * Returns a single product from Sanity CMS by slug.
 * Used by RFQ page to look up products for direct RFQ submission.
 * Public endpoint — no auth required.
 * Force-dynamic to ensure new products are immediately available.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Parameter slug diperlukan" }, { status: 400 });
  }

  try {
    const subdomain = getSubdomainFromRequest(request) || undefined;
    const product = await getProductBySlug(slug, subdomain);

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Return only the fields needed by RFQ page
    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      images: product.images,
      highlights: product.highlights,
      isHighlight: product.isHighlight,
      tags: product.tags,
    });
  } catch (error) {
    console.error("[Products By Slug API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}
