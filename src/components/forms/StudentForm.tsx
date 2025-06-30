"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (type === "update" && data?.img) {
      setPreviewImage(data.img);
      setValue("img", data.img);
    }
  }, [type, data?.img, setValue]);
  const [state, formAction] = React.useActionState(
    type === "create" ? createStudent : updateStudent,
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

  const router = useRouter();

  useEffect(() => {
    if (state.error || state.success) {
      setLoading(false);
    }

    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData ?? {};
  console.log(relatedData, "related data");

  return (
    <form className='p-4 flex flex-col gap-4' onSubmit={onSubmit}>
      <h1 className='text-xl font-semibold'>
        {type === "create" ? "Create a new" : "Update the"} Student
      </h1>
      <span className='text-xs text-gray-400 font-medium'>
        Authentication Information
      </span>
      <div className='flex gap-4 justify-between flex-wrap'>
        <InputField
          label='Username'
          name='username'
          type='text'
          register={register}
          defaultValue={data?.username || ""}
          error={errors.username}
        />
        <InputField
          label='Email'
          type='email'
          register={register}
          name='email'
          defaultValue={data?.email || ""}
          error={errors.email}
        />
        <InputField
          label='Password'
          type='password'
          register={register}
          name='password'
          defaultValue={data?.password || ""}
          error={errors.password}
        />
      </div>
      <span className='text-xs text-gray-400 font-medium'>
        Personal Information
      </span>
      <div className='flex gap-4 justify-between flex-wrap'>
        <InputField
          label='First Name'
          name='name'
          type='text'
          register={register}
          defaultValue={data?.name || ""}
          error={errors.name}
        />
        <InputField
          label='Last Name'
          type='text'
          register={register}
          name='surname'
          defaultValue={data?.surname}
          error={errors.surname}
        />
        <InputField
          label='Phone Number'
          type='text'
          register={register}
          name='phone'
          defaultValue={data?.phone}
          error={errors.phone}
        />
        <InputField
          label='Address'
          name='address'
          type='text'
          register={register}
          defaultValue={data?.address}
          error={errors.address}
        />
        <InputField
          label='Blood Type'
          type='text'
          register={register}
          name='bloodType'
          defaultValue={data?.bloodType}
          error={errors.bloodType}
        />
        <InputField
          label='Birthday'
          type='date'
          register={register}
          name='birthday'
          defaultValue={data?.birthday.toISOString().split("T")[0]}
          error={errors.birthday}
        />
        <InputField
          label='Parent Id'
          type='text'
          register={register}
          name='parentId'
          defaultValue={data?.parentId}
          error={errors.parentId}
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
          <label className='text-xs text-gray-500'>Grade</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("gradeId")}
            defaultValue={data?.gradeId}>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className='text-xs text-red-400'>
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Class</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("classId")}
            defaultValue={data?.classId}>
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  ({classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacity)
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className='text-xs text-red-400'>
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
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

export default StudentForm;
