'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/supabase/types';
import { QuickCategoryDialog } from './QuickCategoryDialog';

interface CategoryDropdownProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showQuickCreate?: boolean;
}

export function CategoryDropdown({
  categories,
  value,
  onChange,
  placeholder = 'Select a category...',
  disabled = false,
  showQuickCreate = true,
}: CategoryDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [showQuickDialog, setShowQuickDialog] = React.useState(false);

  // Build hierarchy: main categories with their subcategories
  const mainCategories = categories.filter(cat => cat.isMain);
  const categoryMap = new Map<string, Category[]>();
  categories.forEach(cat => {
    if (cat.parentId) {
      const siblings = categoryMap.get(cat.parentId) || [];
      siblings.push(cat);
      categoryMap.set(cat.parentId, siblings);
    }
  });

  const selectedCategory = categories.find(cat => cat.id === value);

  const handleCategoryCreated = (categoryId: string) => {
    setShowQuickDialog(false);
    onChange(categoryId);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCategory ? (
              <div className="flex items-center gap-2">
                <span>{selectedCategory.icon}</span>
                <span>{selectedCategory.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No category found.</CommandEmpty>
              
              {mainCategories.map(mainCat => {
                const subCategories = categoryMap.get(mainCat.id) || [];
                
                return (
                  <CommandGroup key={mainCat.id} heading={mainCat.name}>
                    {/* Main category as selectable option */}
                    <CommandItem
                      key={mainCat.id}
                      value={mainCat.id}
                      onSelect={() => {
                        onChange(mainCat.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === mainCat.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="mr-2">{mainCat.icon}</span>
                      <span>{mainCat.name}</span>
                    </CommandItem>
                    
                    {/* Subcategories */}
                    {subCategories.map(subCat => (
                      <CommandItem
                        key={subCat.id}
                        value={subCat.id}
                        onSelect={() => {
                          onChange(subCat.id);
                          setOpen(false);
                        }}
                        className="pl-10"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === subCat.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="mr-2">{subCat.icon}</span>
                        <span>{subCat.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}

              {/* Orphaned categories (if any) */}
              {categories.filter(cat => !cat.isMain && !cat.parentId).length > 0 && (
                <CommandGroup heading="Other">
                  {categories
                    .filter(cat => !cat.isMain && !cat.parentId)
                    .map(cat => (
                      <CommandItem
                        key={cat.id}
                        value={cat.id}
                        onSelect={() => {
                          onChange(cat.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === cat.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="mr-2">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {showQuickCreate && (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowQuickDialog(true);
                    }}
                    className="text-orange-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new category
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <QuickCategoryDialog
        open={showQuickDialog}
        onOpenChange={setShowQuickDialog}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}
