import products from '../data/skincareProducts.json';

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: string;
  fullName: string;
}

class ProductSearchService {
  private products: Product[] = products;

  // Simple fuzzy search function
  private fuzzyMatch(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower === queryLower) return 100;
    
    // Check if query starts with text
    if (textLower.startsWith(queryLower)) return 90;
    
    // Check if text contains query
    if (textLower.includes(queryLower)) return 80;
    
    // Check word boundaries
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    let wordMatches = 0;
    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.startsWith(queryWord) || textWord.includes(queryWord)) {
          wordMatches++;
          break;
        }
      }
    }
    
    if (wordMatches > 0) {
      return Math.max(30, (wordMatches / queryWords.length) * 70);
    }
    
    return 0;
  }

  searchProducts(query: string, category?: string): Product[] {
    if (!query.trim()) return [];

    const results = this.products
      .map(product => {
        // Filter by category if specified
        if (category && product.category !== category) return null;

        // Calculate match scores for different fields
        const brandScore = this.fuzzyMatch(query, product.brand);
        const nameScore = this.fuzzyMatch(query, product.name);
        const fullNameScore = this.fuzzyMatch(query, product.fullName);

        // Take the highest score
        const maxScore = Math.max(brandScore, nameScore, fullNameScore);

        return maxScore > 0 ? { product, score: maxScore } : null;
      })
      .filter(Boolean) as Array<{ product: Product; score: number }>;

    // Sort by score (highest first) and return products
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to top 10 results
      .map(item => item.product);
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const id = product.fullName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    const newProduct = { ...product, id };
    this.products.push(newProduct);
    return newProduct;
  }
}

export const productSearchService = new ProductSearchService();
