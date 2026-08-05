// P2: Server component - fetch company info from Sanity (with fallback hardcoded)
import { getCompanyInfo } from "@/sanity/fetchers";
import { AboutPageClient } from "./AboutPageClient";

// Force dynamic rendering so Studio updates are reflected immediately
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const companyInfo = await getCompanyInfo();

  return <AboutPageClient companyInfo={companyInfo} />;
}
