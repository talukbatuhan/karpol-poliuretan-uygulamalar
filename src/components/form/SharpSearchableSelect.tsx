"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { sharpInputClassName } from "@/components/form/SharpField";
import type { LookupOption } from "@/types/lookup";

interface SharpSearchableSelectProps {
  id?: string;
  options: LookupOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

function normalizeTurkish(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function SharpSearchableSelect({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Seçiniz",
  disabled = false,
  "aria-invalid": ariaInvalid,
}: SharpSearchableSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeTurkish(query.trim());
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      normalizeTurkish(option.label).includes(normalizedQuery),
    );
  }, [options, query]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setHighlightIndex(0);
  }, []);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      close();
      inputRef.current?.blur();
    },
    [close, onChange],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close, onBlur]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, isOpen]);

  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={ariaInvalid}
        autoComplete="off"
        disabled={disabled}
        value={displayValue}
        placeholder={placeholder}
        className={`${sharpInputClassName} pr-9`}
        onFocus={() => {
          setIsOpen(true);
          setQuery(selectedOption?.label ?? "");
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          if (value) onChange("");
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setIsOpen(true);
            setHighlightIndex((prev) =>
              Math.min(prev + 1, Math.max(filteredOptions.length - 1, 0)),
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (isOpen && filteredOptions[highlightIndex]) {
              selectOption(filteredOptions[highlightIndex].value);
            }
          } else if (event.key === "Escape") {
            close();
            inputRef.current?.blur();
          }
        }}
        onBlur={() => {
          if (!containerRef.current?.contains(document.activeElement)) {
            onBlur?.();
          }
        }}
      />

      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-charcoal"
        aria-hidden
      >
        ▼
      </span>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-0 max-h-52 w-full overflow-y-auto border border-black border-t-0 bg-white"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className={`w-full border-b border-slate-200 px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 ${
                value === "" ? "bg-slate-100 font-medium" : ""
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption("")}
            >
              {placeholder}
            </button>
          </li>
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  className={`w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-charcoal last:border-b-0 hover:bg-slate-100 ${
                    value === option.value || highlightIndex === index
                      ? "bg-slate-100 font-medium"
                      : ""
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option.value)}
                  onMouseEnter={() => setHighlightIndex(index)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
