/**
 * Clean Sanity documents and re-populate with correct format
 *
 * Run: bun run scripts/clean-repopulate-sanity.ts
 */

const SANITY_PROJECT_ID = "3h4k8dye";
const SANITY_DATASET = "production";
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN || "";
const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}`;
const QUERY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}`;

if (!SANITY_TOKEN) {
  console.error("ERROR: SANITY_API_WRITE_TOKEN not set");
  process.exit(1);
}

async function sanityQuery(query: string) {
  const res = await fetch(`${QUERY_URL}?query=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
  });
  return res.json();
}

async function sanityMutate(mutations: object[]) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SANITY_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error: ${text}`);
    return null;
  }
  return res.json();
}

async function main() {
  // Step 1: Delete all products, articles, portfolio, spokeConfig
  console.log("🧹 Step 1: Deleting existing documents...");

  for (const docType of ["product", "article", "portfolioEntry", "spokeConfig", "companyInfo"]) {
    const result = await sanityQuery(`*[_type == "${docType}"]._id`);
    const ids = result.result || [];
    if (ids.length > 0) {
      const mutations = ids.map((id: string) => ({ delete: { id } }));
      // Chunk of 100
      for (let i = 0; i < mutations.length; i += 100) {
        await sanityMutate(mutations.slice(i, i + 100));
      }
      console.log(`  Deleted ${ids.length} ${docType} documents`);
    } else {
      console.log(`  No ${docType} documents to delete`);
    }
  }

  console.log("\n✅ Cleanup done. Now run populate-sanity.ts to re-create with correct format.");
}

main().catch(console.error);
