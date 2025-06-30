"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, total }: { page: number; total: number }) => {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    const newPathname = `${window.location.pathname}?${params.toString()}`;
    router.push(newPathname);
  };

  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className='py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold
         disabled:opacity-50 disabled:cursor-not-allowed'>
        Prev
      </button>
      <div className='flex items-center gap-2'>
        {Array.from({ length: Math.ceil(total / ITEM_PER_PAGE) }, (_, i) => (
          <button
            onClick={() => handlePageChange(i + 1)}
            key={i}
            className={`${
              page === i + 1 ? "bg-lmSky" : ""
            } px-2 rounded-md font-semibold`}>
            {i + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === Math.ceil(total / ITEM_PER_PAGE)}
        className='py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold
         disabled:opacity-50 disabled:cursor-not-allowed'>
        Next
      </button>
    </div>
  );
};

export default Pagination;
