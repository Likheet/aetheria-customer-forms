// src/workers/productSearch.worker.ts

let products: any[] = [];
let isReady = false;

// Define message types for better type safety
type LoadMessage = { type: "load" };
type SearchMessage = { type: "search"; q: string; category?: string };
type WorkerMessage = LoadMessage | SearchMessage;

// Simple search without FlexSearch for testing
function simpleSearch(query: string, category?: string): any[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const results: any[] = [];
  
  for (const product of products) {
    // Filter by category if specified
    if (category && product.c !== category) continue;
    
    // Search in brand, name, and aliases
    const brandMatch = product.b.toLowerCase().includes(searchTerm);
    const nameMatch = product.n.toLowerCase().includes(searchTerm);
    const aliasMatch = product.al?.some((alias: string) => 
      alias.toLowerCase().includes(searchTerm)
    ) || false;
    
    if (brandMatch || nameMatch || aliasMatch) {
      // Calculate relevance score
      let score = 0;
      if (product.b.toLowerCase().startsWith(searchTerm)) score += 10;
      if (product.n.toLowerCase().startsWith(searchTerm)) score += 8;
      if (brandMatch) score += 5;
      if (nameMatch) score += 3;
      if (aliasMatch) score += 1;
      
      results.push({ ...product, score });
    }
  }
  
  // Sort by relevance score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // Return top 10 results
  return results.slice(0, 10);
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data;
  
  if (type === "load") {
    try {
      console.log("Loading product data...");
      
      // Load product data
      const productsResponse = await fetch("/data/products.min.json");
      
      if (!productsResponse.ok) {
        throw new Error(`Failed to fetch product data: ${productsResponse.status}`);
      }
      
      const productsArray = await productsResponse.json();
      products = productsArray; // Store as array
      
      isReady = true;
      console.log(`Search ready with ${productsArray.length} products`);
      self.postMessage({ type: "ready" });
      
    } catch (error) {
      console.error("Failed to load product search data:", error);
      self.postMessage({ type: "error", message: "Failed to load search data" });
    }
  }
  
  if (type === "search") {
    if (!isReady) {
      self.postMessage({ type: "results", items: [] });
      return;
    }
    
    const { q, category } = e.data as SearchMessage;
    
    try {
      const results = simpleSearch(q, category);
      self.postMessage({ type: "results", items: results });
      
    } catch (error) {
      console.error("Search error:", error);
      self.postMessage({ type: "results", items: [] });
    }
  }
};
