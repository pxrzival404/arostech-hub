import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllProducts } from "@/sanity/fetchers";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/products
 * Returns all products for the current subdomain from Sanity CMS.
 * Used by pricing management to dynamically populate product dropdowns.
 * Force-dynamic to ensure new products appear immediately in admin.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request) || "pju";
    const products = await getAllProducts(subdomain);

    // Return simplified product list with name, slug, and subcategory
    const simplified = products.map((p) => ({
      name: p.name,
      slug: p.slug,
      subcategory: p.subcategory || p.category || "",
    }));

    // Also get unique subcategories for category-level pricing
    const subcategories = Array.from(
      new Set(products.map((p) => p.subcategory || p.category).filter(Boolean))
    ).map((slug) => {
      const matchingProduct = products.find(
        (p) => (p.subcategory || p.category) === slug
      );
      return {
        name: slug
          ?.split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") || slug,
        slug: slug || "",
      };
    });

    return NextResponse.json({ products: simplified, subcategories });
  } catch (error) {
    console.error("[Admin Products API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}
