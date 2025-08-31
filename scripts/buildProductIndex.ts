// scripts/buildProductIndex.ts - Simplified version
import { promises as fs } from "fs";
import path from "path";

type Product = { 
  id: string; 
  b: string;   // brand
  n: string;   // name
  c: string;   // category
  al?: string[]; // aliases
  kw?: string[]; // keywords
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\p{Letter}\p{Number}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function generateKeywords(p: Product): string[] {
  const base = `${p.b} ${p.n} ${(p.al || []).join(" ")}`;
  const normalized = normalize(base);
  const tokens = normalized.split(" ").filter(t => t.length > 0);
  
  // Generate initials like "cmc" for "cerave moisturizing cream"
  const initials = tokens.map(t => t[0]).join("");
  
  // Generate compact version without spaces
  const compact = normalized.replace(/\s+/g, "");
  
  return Array.from(new Set([...tokens, initials, compact]));
}

async function buildIndex() {
  try {
    console.log("🔄 Building product search data...");
    
    // Read products data
    const productsPath = path.join(process.cwd(), "src", "data", "skincareProducts.json");
    const rawData = await fs.readFile(productsPath, "utf8");
    const products: Product[] = JSON.parse(rawData);
    
    // Process products and add keywords
    const processedProducts = products.map(p => ({
      ...p,
      kw: generateKeywords(p)
    }));
    
    // Ensure public/data directory exists
    const publicDataDir = path.join(process.cwd(), "public", "data");
    await fs.mkdir(publicDataDir, { recursive: true });
    
    // Write the processed products file
    const minDataPath = path.join(publicDataDir, "products.min.json");
    await fs.writeFile(minDataPath, JSON.stringify(processedProducts));
    
    console.log(`✅ Built search data for ${products.length} products`);
    console.log(`📁 Data: ${minDataPath}`);
    console.log("🎯 Search index will be built at runtime in the browser");
    
  } catch (error) {
    console.error("❌ Error building data:", error);
    process.exit(1);
  }
}

// Run the build
buildIndex();
