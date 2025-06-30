"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchema";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createResult, updateResult } from "@/lib/actions";
import { useFormState } from "react-dom";

const ResultForm = ({
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
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
  });

  const [loading, setLoading] = useState(false);

  const [selectedExam, setSelectedExam] = useState(data?.examId || "");
  const [selectedAssignment, setSelectedAssignment] = useState(
    data?.assignmentId || ""
  );

  const [state, formAction] = React.useActionState(
    type === "create" ? createResult : updateResult,
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
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { exams, assignments, students } = relatedData;

  return (
    <form className='flex flex-col gap-8' onSubmit={onSubmit}>
      <h1 className='text-xl font-semibold'>
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className='flex justify-between flex-wrap gap-4'>
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
          <label className='text-xs text-gray-500'>Students</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("studentId")}
            defaultValue={data?.studentId || ""}>
            {students.map(
              (student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name + " " + student.surname}
                </option>
              )
            )}
          </select>
          {errors.studentId?.message && (
            <p className='text-xs text-red-400'>
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label='Score'
          name='score'
          defaultValue={data?.score || ""}
          register={register}
          error={errors?.score}
        />
      </div>
      <div className='flex justify-between flex-wrap gap-4'>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Assignment (optional)</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("assignmentId")}
            value={selectedAssignment}
            onChange={(e) => {
              setSelectedAssignment(e.target.value);
              setSelectedExam("");
            }}
            disabled={!!selectedExam}>
            <option value=''>-- Select Assignment --</option>
            {assignments.map((assignment: { id: number; title: string }) => (
              <option value={assignment.id.toString()} key={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {errors.assignmentId?.message && (
            <p className='text-xs text-red-400'>
              {errors.assignmentId.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 w-full md:w-1/4'>
          <label className='text-xs text-gray-500'>Exam (optional)</label>
          <select
            className='ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full'
            {...register("examId")}
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              setSelectedAssignment(""); // clear assignment if exam chosen
            }}
            disabled={!!selectedAssignment}>
            <option value=''>-- Select Exam --</option>
            {exams.map((exam: { id: number; title: string }) => (
              <option value={exam.id.toString()} key={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {errors.examId?.message && (
            <p className='text-xs text-red-400'>{errors.examId.message}</p>
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
export default ResultForm;
