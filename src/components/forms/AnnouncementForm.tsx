"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchema";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
  });

  const [loading, setLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);

  const resClasses = relatedData?.classes;
  const allSelected = selectedClasses?.length === resClasses?.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(resClasses?.map((c: any) => c.id));
    }
  };

  const [state, formAction] = React.useActionState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  useEffect(() => {
    setValue("classIds", selectedClasses);
  }, [selectedClasses, setValue]);

  useEffect(() => {
    if (type === "update") {
      const ids = data.classes.map((c: any) => c.class.id);
      setSelectedClasses(ids);
    }
  }, [type]);

  const onSubmit = handleSubmit((data) => {
    setLoading(true);
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success || state.error) {
      setLoading(false);
    }

    if (state.success) {
      toast(
        `Announcement has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData ?? {};

  return (
    <form
      className='flex flex-col gap-8'
      onSubmit={onSubmit}
      encType='multipart/form-data'
      method='POST'>
      <h1 className='text-xl font-semibold'>
        {type === "create"
          ? "Create a new announcement"
          : "Update the announcement"}
      </h1>

      <div className='flex justify-between flex-wrap gap-4'>
        <InputField
          label='
          Announcement Title'
          name='title'
          defaultValue={data?.title ?? ""}
          register={register}
          error={errors?.title}
        />
        <InputField
          label='Date'
          name='date'
          defaultValue={
            data?.date ? new Date(data.date).toISOString().split("T")[0] : ""
          }
          register={register}
          error={errors?.date}
          type='date'
        />
        {data && (
          <InputField
            label='Id'
            name='id'
            defaultValue={data?.id ?? ""}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className='flex flex-col gap-2 w-full md:w-1/2'>
          <label className='text-xs text-gray-500'>Classes</label>
          <div className='max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2'>
            <button
              type='button'
              className='text-xs text-blue-500 hover:text-blue-700 mb-2'
              onClick={() => {
                handleSelectAll();
              }}>
              <input type='hidden' {...register("classIds")} />
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            {classes?.map((classItem: { id: number; name: string }) => (
              <label
                key={classItem.id}
                className='flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer'>
                <input
                  type='checkbox'
                  value={classItem.id}
                  checked={selectedClasses.includes(classItem.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClasses((prev: number[]) => [
                        ...prev,
                        classItem.id,
                      ]);
                    } else {
                      setSelectedClasses((prev: number[]) =>
                        prev.filter((id) => id !== classItem.id)
                      );
                    }
                  }}
                />

                <span className='text-sm'>{classItem.name}</span>
              </label>
            ))}
          </div>
          {errors.classIds?.message && (
            <p className='text-xs text-red-400'>
              {errors.classIds.message.toString()}
            </p>
          )}
        </div>
        <textarea
          className='ring-[1.5px] ring-gray-300 rounded-md p-2 focus:outline-none text-sm w-full'
          {...register("description")}
          defaultValue={data?.description ?? ""}
          placeholder='Description'
        />
      </div>
      {state.error && (
        <span className='text-red-500'>Something went wrong!</span>
      )}
      <button
        className='bg-blue-400 text-white p-2 rounded-md flex justify-center items-center gap-2 disabled:opacity-60'
        type='submit'
        disabled={loading}>
        {loading ? (
          <>
            <svg
              className='animate-spin h-5 w-5 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
            {type === "create" ? "Creating" : "Updating"}
          </>
        ) : type === "create" ? (
          "Create"
        ) : (
          "Update"
        )}
      </button>
    </form>
  );
};

export default AnnouncementForm;
