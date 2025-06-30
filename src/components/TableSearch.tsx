"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type TableSearchProps = {
  paramKey?: string; // defaults to "search"
  placeholder?: string;
};

const TableSearch = ({
  paramKey = "search",
  placeholder = "Search...",
}: TableSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const initialValue = searchParams.get(paramKey) || "";
    setInputValue(initialValue);
    if (inputRef.current) {
      inputRef.current.value = initialValue;
    }
  }, [paramKey, searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const search = (e.currentTarget[0] as HTMLInputElement).value;
    const params = new URLSearchParams(window.location.search);
    params.set(paramKey, search);
    const newPathname = `${window.location.pathname}?${params.toString()}`;
    router.push(newPathname);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete(paramKey);
    const newPathname = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.push(newPathname);
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className='w-full md:w-auto flex items-center gap-2 bg-[#F7F8FA] px-4 py-2 rounded-full text-sm ring-[1.5px] ring-gray-300'>
      <Image src='/search.png' alt='search' width={14} height={14} />
      <input
        type='text'
        placeholder={placeholder}
        className='w-[200px] bg-transparent border-0 focus:outline-none'
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <Image
          src='/close.png'
          alt='clear'
          width={14}
          height={14}
          className='cursor-pointer ml-auto'
          onClick={handleClearSearch}
        />
      )}
    </form>
  );
};

export default TableSearch;
