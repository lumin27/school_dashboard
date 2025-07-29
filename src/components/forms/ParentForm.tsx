"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  startTransition,
  useState,
} from "react";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchema";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Select from "react-select";

const ParentForm = ({
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
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [loading, setLoading] = useState(false);

  const [state, formAction] = React.useActionState(
    type === "create" ? createParent : updateParent,
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
      toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students } = relatedData;

  return (
    <form action='' className='p-4 flex flex-col gap-4' onSubmit={onSubmit}>
      <h1 className='text-xl font-semibold'>
        {type === "create" ? "Create a new parent" : "Update the parent"}
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
            defaultValue={data?.surname || ""}
            error={errors.surname}
          />
          <InputField
            label='Phone Number'
            type='text'
            register={register}
            name='phone'
            defaultValue={data?.phone || ""}
            error={errors.phone}
          />
          <InputField
            label='Address'
            name='address'
            type='text'
            register={register}
            defaultValue={data?.address || ""}
            error={errors.address}
          />
          {data && (
            <InputField
              label='Id'
              name='id'
              defaultValue={data?.id || ""}
              register={register}
              error={errors?.id}
              hidden
            />
          )}
          <div className='flex flex-col gap-2 w-full md:w-1/3'>
            <label className='text-xs text-gray-500'>Students</label>
            <select
              multiple
              className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
              {...register("students")}
              defaultValue={data?.students || []}>
              {students.map(
                (student: { id: string; name: string; surname: string }) => (
                  <option value={student.id} key={student.id}>
                    {student.name + " " + student.surname}
                  </option>
                )
              )}
            </select>
            {errors.students?.message && (
              <p className='text-xs text-red-400'>
                {errors.students.message.toString()}
              </p>
            )}
          </div>
        </div>
      </div>
      {state.error && <p className='text-red-500'>Something went wrong!</p>}
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

export default ParentForm;
