"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  'aria-labelledby'?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Sélectionner des options...",
  className,
  disabled = false,
  'aria-labelledby': ariaLabelledBy,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && selected.length > 0) {
            onChange(selected.slice(0, -1))
          }
        }
        if (e.key === "Escape") {
          input.blur()
        }
      }
    },
    [selected, onChange]
  )

  const selectables = options.filter((option) => !selected.includes(option.value))

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className}`}
    >
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 items-center min-h-6">
          {/* Zone de défilement horizontale pour les badges */}
          {selected.length > 0 && (
            <ScrollArea className="max-w-[calc(100%-2rem)]">
              <div className="flex gap-1 w-max py-1 pb-3">
                {selected.map((selectedItem) => {
                  const option = options.find((opt) => opt.value === selectedItem)
                  return (
                    <Badge
                      key={selectedItem}
                      variant="secondary"
                      className="hover:bg-secondary flex-shrink-0"
                    >
                      {option?.label}
                      <button
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUnselect(selectedItem)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={() => handleUnselect(selectedItem)}
                        aria-label={`Supprimer ${option?.label}`}
                        type="button"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
          {/* Input toujours visible à droite */}
          <CommandPrimitive.Input
            ref={ref => {
              // Merge refs since inputRef is needed for keyboard navigation
              inputRef.current = ref as HTMLInputElement
            }}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : undefined}
            disabled={disabled}
            className={`${selected.length > 0 ? 'ml-2' : ''} bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-0`}
            aria-expanded={open}
            aria-labelledby={ariaLabelledBy}
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList
          className={`absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none ${
            open && selectables.length > 0 ? "block animate-in" : "hidden"
          }`}
        >
          {open && selectables.length > 0 && (
            <CommandGroup className="h-full overflow-auto max-h-60">
              {selectables.map((option) => {
                return (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                      setInputValue("")
                      onChange([...selected, option.value])
                    }}
                    className={"cursor-pointer"}
                    role="option"
                    aria-selected={selected.includes(option.value)}
                  >
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </div>
    </Command>
  )
}
