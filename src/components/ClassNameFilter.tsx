"use client";

import prisma from "@/lib/prisma";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ClassItem = {
  id: number;
  name: string;
};

const ClassNameFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedId, setSelectedId] = useState(
    searchParams.get("classId") || ""
  );

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await prisma.class.findMany({
        select: { id: true, name: true },
      });
      const data = res.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(data);
    };
    fetchClasses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("classId", value);
    } else {
      params.delete("classId");
    }

    router.push(`?${params.toString()}`);
    setSelectedId(value);
  };

  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor='class-filter' className='text-sm'>
        Filter by Class
      </label>
      <select
        id='class-filter'
        value={selectedId}
        onChange={handleChange}
        className='border px-2 py-1 rounded text-sm'>
        <option value=''>All</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClassNameFilter;
