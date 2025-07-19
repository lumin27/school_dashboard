"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchool, updateSchool } from "@/lib/actions";
import { toast } from "react-toastify";

const CreateSchoolForm = () => {
  const [loading, setLoading] = useState(false);
  const [create, setCreate] = useState(false);
  const [img, setImg] = useState<string>("");

  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [minTime, setMinTime] = useState("08:00");
  const [maxTime, setMaxTime] = useState("22:00");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await createSchool(formData);
      if (res && res.success) {
        toast.success("School created successfully");
        setCreate(false);
        router.refresh();
      } else {
        toast.error("Failed to create school");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setName("");
      setMinTime("08:00");
      setMaxTime("22:00");
    }
  };

  const imageSrc =
    img && typeof img === "string" && img.trim() !== "" ? img : "/logo.png";

  return (
    <form
      onSubmit={handleSubmit}
      className='relative px-4 pb-8 flex gap-4 flex-col ring-[1.5px] ring-gray-200 bg-white items-center rounded-lg m-4 md:m-20 lg:mx-40'>
      <div className='flex items-center w-full relative'>
        <h1 className='text-lg font-bold mt-4 mr-auto'>Create New School</h1>
        <div
          className='w-8 h-8 bg-gray-200 rounded-full top-3 right-1 absolute flex items-center justify-center cursor-pointer hover:bg-lmSky transition-all duration-300'
          onClick={() => setCreate(!create)}>
          {create ? (
            <Image
              src='/close.png'
              alt='create'
              width={30}
              height={30}
              className='absolute w-4 h-4'
            />
          ) : (
            <Image
              src='/create.png'
              alt='create'
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
          width={100}
          height={100}
          className='w-30 h-30 object-contain rounded-full'
        />
        {create && (
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
          disabled={!create}
          name='name'
          onChange={(e) => setName(e.target.value)}
          value={name}
          type='text'
          placeholder='School Name'
          className='p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
        />
      </div>
      <div className='flex w-full mb-4 justify-between '>
        <div>
          <span className='text-sm text-gray-400'>Opening Time</span>
          <input
            disabled={!create}
            name='openingTime'
            type='time'
            value={minTime}
            onChange={(e) => setMinTime(e.target.value)}
            className='mt-2 p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
          />
        </div>
        <div>
          <span className='text-sm text-gray-400'>Closing Time</span>
          <input
            disabled={!create}
            name='closingTime'
            type='time'
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            className='mt-2 p-2 border-[1.5px] border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-400 w-full'
          />
        </div>
      </div>
      {loading ? (
        <div className='py-2 px-4 rounded-md bg-purple-400 text-white w-full flex items-center justify-center'>
          <div className='w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : (
        <div className='flex justify-end w-full transition-all duration-300'>
          {create && (
            <div
              className={`overflow-hidden w-full transition-all duration-300 ${
                create
                  ? "max-h-20 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 translate-y-2"
              }`}>
              <button
                type='submit'
                className='py-2 px-4 rounded-md bg-purple-400 text-white w-full transition-all duration-600'>
                Create
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default CreateSchoolForm;
