import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initProductSearch, searchProducts, Product } from '../lib/productSearchService';

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  category?: string;
  className?: string;
}

export default function ProductAutocomplete({
  value,
  onChange,
  placeholder = "e.g., CeraVe Foaming Cleanser",
  category,
  className = ""
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Initialize search worker on component mount
  useEffect(() => {
    console.log("ProductAutocomplete: Initializing search worker");
    initProductSearch();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      console.log("ProductAutocomplete: Searching for:", query, "category:", category);
      
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const searchResults = await searchProducts(query, category);
        console.log("ProductAutocomplete: Search results:", searchResults);
        setResults(searchResults);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error('ProductAutocomplete: Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200),
    [category]
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length > 0) {
      setIsOpen(true);
      debouncedSearch(newValue);
    } else {
      setIsOpen(false);
      setResults([]);
    }
  };

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    const fullName = `${product.b} ${product.n}`;
    onChange(fullName);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectProduct(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setResults([]);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.length > 0 && results.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoComplete="off"
      />
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-gray-900/95 backdrop-blur-sm border border-gray-700/40 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-300">
              <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2"></span>
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                className={`w-full text-left p-3 text-gray-200 hover:bg-gray-800/60 focus:bg-gray-800/60 focus:outline-none border-b border-gray-700/40 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-amber-900/40' : ''
                }`}
              >
                <div className="font-medium text-gray-100">{product.b}</div>
                <div className="text-sm text-gray-400">{product.n}</div>
                {product.c && (
                  <div className="text-xs text-gray-500 capitalize mt-1">
                    {product.c}
                  </div>
                )}
              </button>
            ))
          ) : value.length > 0 && !isLoading ? (
            <div className="p-3 text-gray-300 text-center">
              No products found. You can still add "{value}" manually.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
