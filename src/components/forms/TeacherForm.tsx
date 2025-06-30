"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

const TeacherForm = ({
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
    setValue,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [state, formAction] = React.useActionState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    setLoading(true);
    startTransition(() => {
      formAction(data);
    });
  });

  useEffect(() => {
    if (type === "update" && data?.img) {
      setPreviewImage(data.img);
      setValue("img", data.img);
    }
  }, [type, data?.img, setValue]);

  const router = useRouter();

  useEffect(() => {
    if (state.success || state.error) {
      setLoading(false);
    }

    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  return (
    <form className='flex flex-col gap-8' onSubmit={onSubmit}>
      <h1 className='text-xl font-semibold'>
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className='text-xs text-gray-400 font-medium'>
        Authentication Information
      </span>
      <div className='flex justify-between flex-wrap gap-4'>
        <InputField
          label='Username'
          name='username'
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label='Email'
          name='email'
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label='Password'
          name='password'
          type='password'
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className='text-xs text-gray-400 font-medium'>
        Personal Information
      </span>
      <div className='flex justify-between flex-wrap gap-4'>
        <InputField
          label='First Name'
          name='name'
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label='Last Name'
          name='surname'
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label='Phone'
          name='phone'
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label='Address'
          name='address'
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label='Blood Type'
          name='bloodType'
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label='Birthday'
          name='birthday'
          defaultValue={
            data?.birthday
              ? new Date(data.birthday).toISOString().split("T")[0]
              : ""
          }
          register={register}
          error={errors.birthday}
          type='date'
        />
        {data && (
          <InputField
            label='Id'
            name='id'
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Sex</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("sex")}
            defaultValue={data?.sex}>
            <option value='MALE'>Male</option>
            <option value='FEMALE'>Female</option>
          </select>
          {errors.sex?.message && (
            <p className='text-xs text-red-400'>
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Subjects</label>
          <select
            multiple
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("subjects")}
            defaultValue={data?.subjects?.map((sub: any) => sub.id)}>
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className='text-xs text-red-400'>
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <input type='hidden' {...register("img")} />

        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Profile Image</label>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue("img", file);
                setPreviewImage(URL.createObjectURL(file));
              } else if (data?.img) {
                setValue("img", data.img);
              }
            }}
          />

          {previewImage && (
            <Image
              src={previewImage}
              alt='Profile Preview'
              className='w-24 h-24 object-cover rounded-md mt-2'
            />
          )}
        </div>
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

export default TeacherForm;
