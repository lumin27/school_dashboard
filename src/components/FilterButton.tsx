"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { set } from "date-fns";

const FilterButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(
    searchParams.get("className") || ""
  );
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (inputValue) {
      params.set("className", inputValue);
    } else {
      params.delete("className");
    }
    router.push(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("className");
    router.push(`?${params.toString()}`);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setIsOpen(false);
  };

  return (
    <div className='flex items-center gap-2 relative'>
      {isOpen ? (
        <form onSubmit={handleSubmit} className='flex items-center gap-2'>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Search by class name'
            className='border rounded px-2 py-1 text-sm'
          />
          {inputValue && (
            <button
              type='button'
              onClick={handleClearSearch}
              className='w-8 h-8 flex items-center justify-center rounded-full'>
              <Image src='/close.png' alt='clear' width={14} height={14} />
            </button>
          )}
        </form>
      ) : null}
      <button
        type='button'
        onClick={() => {
          if (isOpen) {
            handleClearSearch();
          } else {
            setIsOpen(true);
          }
        }}
        className='w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow'>
        <Image src='/filter.png' alt='filter' width={14} height={14} />
      </button>
    </div>
  );
};

export default FilterButton;
