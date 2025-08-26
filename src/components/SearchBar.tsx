import { useState, useEffect } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAddNew: () => void;
  searchQuery: string;
  hasResults: boolean;
  isNewWord: boolean;
}

const SearchBar = ({
  onSearch,
  onAddNew,
  searchQuery,
  hasResults,
  isNewWord
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  // Sincroniza o estado interno com o searchQuery do pai
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <header className="w-full mb-8 pt-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vocab Master</h1>
            <p className="text-muted-foreground">Learning English by Reading Books</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Type an English word..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "pl-12 pr-16 h-14 text-lg bg-card border-2 rounded-2xl",
                "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
                "transition-all duration-300"
              )}
            />
            
            {/* Add new word button - appears when searching and no results */}
            {query.length > 0 && isNewWord && (
              <Button
                onClick={onAddNew}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2",
                  "bg-learning hover:bg-learning/90 text-learning-foreground",
                  "rounded-xl px-4 py-2 gap-2 float-in"
                )}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>

          {/* Search Status */}
          {query.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              {hasResults ? (
                <span className="text-sm text-mastered font-medium">
                  ✓ Word found
                </span>
              ) : (
                <span className="text-sm text-learning font-medium">
                  ⚡ New discovery
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SearchBar;