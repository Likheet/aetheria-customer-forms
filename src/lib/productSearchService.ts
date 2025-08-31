// Product search service with Web Worker for performance
let worker: Worker | undefined;
let isReady = false;
let queue: Array<() => void> = [];

export type Product = {
  id: string;
  b: string;  // brand
  n: string;  // name
  c: string;  // category
  al?: string[]; // aliases
  kw?: string[]; // keywords
};

/**
 * Initialize the product search worker
 * Call this once when the component mounts
 */
export function initProductSearch(): void {
  if (worker) return;
  
  worker = new Worker(
    new URL("../workers/productSearch.worker.ts", import.meta.url), 
    { type: "module" }
  );
  
  worker.postMessage({ type: "load" });
  
  worker.onmessage = (e: MessageEvent) => {
    if (e.data.type === "ready") {
      isReady = true;
      // Execute any queued searches
      for (const fn of queue) fn();
      queue = [];
    }
  };
}

/**
 * Search for products with fuzzy matching
 * @param query - Search query (e.g., "cer mo cr" for "CeraVe Moisturizing Cream")
 * @param category - Optional category filter
 * @returns Promise resolving to array of matching products
 */
export function searchProducts(
  query: string, 
  category?: string
): Promise<Product[]> {
  return new Promise((resolve) => {
    const executeSearch = () => {
      if (!worker) {
        resolve([]);
        return;
      }
      
      const onMessage = (e: MessageEvent) => {
        if (e.data.type === "results") {
          worker!.removeEventListener("message", onMessage);
          resolve(e.data.items);
        }
      };
      
      worker.addEventListener("message", onMessage);
      worker.postMessage({ type: "search", q: query, category });
    };
    
    if (isReady) {
      executeSearch();
    } else {
      queue.push(executeSearch);
    }
  });
}

/**
 * Cleanup function to terminate the worker
 * Call this when component unmounts if needed
 */
export function terminateProductSearch(): void {
  if (worker) {
    worker.terminate();
    worker = undefined;
    isReady = false;
    queue = [];
  }
}
