"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSchool } from "@/lib/actions";
import { toast } from "react-toastify";

const UpdateSchoolForm = ({
  schoolData,
}: {
  schoolData: {
    id: string;
    name: string;
    logo?: string;
    openingTime?: string;
    closingTime?: string;
  };
}) => {
  const [img, setImg] = useState<string>(schoolData?.logo || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [update, setUpdate] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await updateSchool(formData);
      if (res.success) {
        toast.success("School updated successfully");
        setUpdate(false);
        router.refresh();
      } else {
        toast.error("Failed to update school");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const imageSrc =
    img && typeof img === "string" && img.trim() !== "" ? img : "/logo.png";

  return (
    <form
      onSubmit={handleSubmit}
      className='relative px-4 pb-5 flex gap-4 flex-col ring-[1.5px] ring-gray-200 bg-white items-center rounded-lg m-4 md:m-20 lg:mx-40'>
      <div className='flex items-center w-full relative'>
        <h1 className='text-lg font-bold mt-4 mr-auto'>
          Update School Settings
        </h1>
        <div
          className='w-8 h-8 bg-gray-200 rounded-full top-3 right-1 absolute flex items-center justify-center cursor-pointer hover:bg-lmSky transition-all duration-300'
          onClick={() => setUpdate(!update)}>
          {update ? (
            <Image
              src='/close.png'
              alt='update'
              width={30}
              height={30}
              className='absolute w-4 h-4'
            />
          ) : (
            <Image
              src='/update.png'
              alt='update'
              width={30}
              height={30}
              className='absolute w-4 h-4'
            />
          )}
        </div>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <Image
          src={imageSrc}
          alt='school logo'
          width={300}
          height={200}
          className='w-40 h-40 object-contain rounded-full'
        />
        {update && (
          <input
            type='file'
            name='logo'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImg(URL.createObjectURL(file));
              }
            }}
            className='mt-2 p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
          />
        )}
      </div>
      <div className='flex mr-auto flex-col gap-2 w-full'>
        <span className='text-sm text-gray-400'>School Name</span>
        <input
          name='name'
          defaultValue={schoolData?.name ?? ""}
          disabled={!update}
          type='text'
          placeholder='School Name'
          className='p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
        />
      </div>
      <div className='flex w-full mb-4 justify-between '>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-400'>Start Time</span>
          <input
            disabled={!update}
            name='openingTime'
            defaultValue={schoolData?.openingTime ?? ""}
            type='time'
            className='mt-2 p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
          />
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-400'>End Time</span>
          <input
            disabled={!update}
            defaultValue={schoolData?.closingTime ?? ""}
            name='closingTime'
            type='time'
            className='mt-2 p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400'
          />
        </div>
      </div>

      <input type='hidden' name='id' value={schoolData?.id} />

      {loading ? (
        <div className='py-2 px-4 rounded-md bg-purple-400 text-white w-full flex items-center justify-center'>
          <div className='w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : (
        <div className='flex justify-end w-full transition-all duration-300'>
          {update && (
            <div
              className={`overflow-hidden w-full transition-all duration-300 ${
                update
                  ? "max-h-20 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 translate-y-2"
              }`}>
              <button
                type='submit'
                className='py-2 px-4 rounded-md bg-purple-400 text-white w-full transition-all duration-600'>
                Update
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default UpdateSchoolForm;
