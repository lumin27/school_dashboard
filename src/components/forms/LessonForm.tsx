"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createLesson, updateLesson } from "@/lib/actions";

const LessonForm = ({
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
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const [loading, setLoading] = useState(false);

  const [state, formAction] = React.useActionState(
    type === "create" ? createLesson : updateLesson,
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
    if (state.success || state.error) {
      setLoading(false);
    }

    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects, classes, teachers } = relatedData;

  return (
    <form className='flex flex-col gap-8' onSubmit={onSubmit}>
      <h1 className='text-xl font-semibold'>
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>

      <div className='flex justify-between flex-wrap gap-4'>
        <InputField
          label='Lesson Name'
          name='name'
          defaultValue={data?.name || ""}
          register={register}
          error={errors?.name}
        />
        <InputField
          label='Start Date'
          name='startTime'
          defaultValue={
            data?.endTime
              ? new Date(data.endTime).toISOString().slice(0, 16)
              : ""
          }
          register={register}
          error={errors?.startTime}
          type='datetime-local'
        />
        <InputField
          label='End Date'
          name='endTime'
          defaultValue={
            data?.endTime
              ? new Date(data.endTime).toISOString().slice(0, 16)
              : ""
          }
          register={register}
          error={errors?.endTime}
          type='datetime-local'
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
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Day</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("day")}
            defaultValue={data?.day || "MONDAY"}>
            <option value='MONDAY'>Monday</option>
            <option value='TUESDAY'>Tuesday</option>
            <option value='WEDNESDAY'>Wednesday</option>
            <option value='THURSDAY'>Thursday</option>
            <option value='FRIDAY'>Friday</option>
            <option value='SATURDAY'>Saturday</option>
            <option value='SUNDAY'>Sunday</option>
          </select>
          {errors.day?.message && (
            <p className='text-xs text-red-400'>
              {errors.day.message.toString()}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Class</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("classId")}
            defaultValue={data?.classId || ""}>
            {classes.map((classs: { id: number; name: string }) => (
              <option value={classs.id} key={classs.id}>
                {classs.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className='text-xs text-red-400'>
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Subject</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("subjectId")}
            defaultValue={data?.lessonId || ""}>
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className='text-xs text-red-400'>
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Teacher</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("teacherId")}
            defaultValue={data?.teacherId ?? ""}>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option value={teacher.id} key={teacher.id}>
                  {teacher.name + " " + teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.subjectId?.message && (
            <p className='text-xs text-red-400'>
              {errors.subjectId.message.toString()}
            </p>
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

export default LessonForm;
