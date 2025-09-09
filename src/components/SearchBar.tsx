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
  isNewWord: boolean;
}

const SearchBar = ({
  onSearch,
  onAddNew,
  searchQuery,
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
              <div className="relative flex items-center justify-center w-14 h-14 bg-blue-500/10 rounded-2xl">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {t('appTitle')}
              </h1>
              <p className="text-muted-foreground/95 font-small">
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
              <Search className="h-5 w-5 text-muted-foreground/95" />
            </div>

            {/* Search input */}
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className={cn(
                "pl-12 pr-20 h-14 text-lg rounded-2xl border-2 transition-all duration-300",
                "border-input hover:border-primary/30",
                "focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:shadow-xl",
                "placeholder:text-muted-foreground/95 placeholder:font-small",
                query.length > 0 && "border-primary/40 shadow-primary/10"
              )}
            />

            {/* Add new word button - appears when searching and no results */}
            {query.length > 0 && isNewWord && (
              <Button
                onClick={onAddNew}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                  "h-9 px-3 rounded-lg font-medium transition-all duration-300",
                  "bg-orange-500/10 border border-orange-500/20",
                  "hover:bg-orange-500/20 hover:border-orange-500/30",
                  "text-orange-600"
                )}
              >
                <Plus className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium text-orange-600">{t('addButton')}</span>
              </Button>
            )}

            {/* Input glow effect when focused */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/3 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl"></div>
          </div>


        </div>
      </div>
    </header>
  );
};

export default SearchBar;