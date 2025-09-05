import { useState, useEffect } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  // Sincroniza o estado interno com o searchQuery do pai
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <header className="w-full mb-8 pt-8 relative">
      <div className="max-w-4xl mx-auto px-6 relative">
        {/* Logo and Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-lg"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent tracking-tight">
                {t('appTitle')}
              </h1>
              <p className="text-muted-foreground/80 font-small">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="relative">
            <LanguageToggle />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative space-y-4">
          <div className="relative group">
            {/* Search icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search className="h-5 w-5" />
            </div>

            {/* Search input */}
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "pl-14 pr-20 h-16 text-lg rounded-2xl border-2 transition-all duration-300",
                "border-input hover:border-primary/30",
                "focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:shadow-xl",
                "placeholder:text-muted-foreground/60 placeholder:font-small",
                query.length > 0 && "border-primary/40 shadow-primary/10"
              )}
            />

            {/* Add new word button - appears when searching and no results */}
            {query.length > 0 && isNewWord && (
              <Button
                onClick={onAddNew}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                  "h-12 px-4 rounded-xl font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-learning to-learning/90",
                  "hover:from-learning/90 hover:to-learning/80",
                  "text-learning-foreground shadow-lg shadow-learning/25",
                  "hover:shadow-xl hover:shadow-learning/30 hover:scale-105",
                  "focus:ring-2 focus:ring-learning/30 focus:ring-offset-2",
                  "animate-in fade-in-0 slide-in-from-right-4 duration-500"
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-bold">{t('addButton')}</span>
              </Button>
            )}

            {/* Input glow effect when focused */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-learning/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl"></div>
          </div>

          {/* Search Status */}
          {query.length > 0 && (
            <div className="flex items-center justify-center">
              <div className={cn(
                "inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300",
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
                hasResults
                  ? [
                      "bg-gradient-to-r from-mastered/10 to-mastered/5",
                      "border-mastered/30 text-mastered shadow-lg shadow-mastered/20"
                    ]
                  : [
                      "bg-gradient-to-r from-learning/10 to-learning/5",
                      "border-learning/30 text-learning shadow-lg shadow-learning/20"
                    ]
              )}>
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full",
                  hasResults
                    ? "bg-mastered/20 text-mastered"
                    : "bg-learning/20 text-learning"
                )}>
                  <span className="text-sm font-bold">
                    {hasResults ? "✓" : "⚡"}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {hasResults ? t('wordFound') : t('newDiscovery')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SearchBar;