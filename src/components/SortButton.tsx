"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import clsx from "clsx"; // Optional: if you're using Tailwind & clsx for cleaner class logic

export default function SortButton({
  field,
  icon = "/sort.png",
  alt = "Sort",
  size = 14,
  className = "w-8 h-8 flex items-center justify-center rounded-full bg-lmYellow",
}: {
  field: string;
  icon?: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const currentParams = new URLSearchParams(searchParams?.toString());
  const currentField = currentParams.get("field");
  const currentSort = currentParams.get("sort");

  const isSameField = currentField === field;
  const nextSort = isSameField && currentSort === "desc" ? "asc" : "desc";

  currentParams.set("field", field);
  currentParams.set("sort", nextSort);

  const isAscending = nextSort === "asc";

  return (
    <Link
      href={{
        query: Object.fromEntries(currentParams.entries()),
      }}
      aria-label={`Sort by ${field} ${nextSort}`}
      className={clsx(
        className,
        isSameField && "ring-2 ring-black ring-offset-1"
      )}>
      <Image
        src={icon}
        alt={alt}
        width={size}
        height={size}
        className={clsx(
          "transition-transform duration-200",
          isSameField && currentSort === "asc" && "rotate-180"
        )}
      />
    </Link>
  );
}
