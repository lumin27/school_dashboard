"use client";

import {
  deleteAnnouncement,
  deleteAssignment,
  deleteClass,
  deleteEvent,
  deleteExam,
  deleteLesson,
  deleteParent,
  deleteResult,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteTransaction,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import Loader from "./Loader";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  transaction: deleteTransaction,
};

// USE LAZY LOADING

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <Loader />,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <Loader />,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <Loader />,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <Loader />,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <Loader />,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <Loader />,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <Loader />,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <Loader />,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <Loader />,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <Loader />,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <Loader />,
});
const TransactionForm = dynamic(() => import("./forms/TransactionForm"), {
  loading: () => <Loader />,
});

// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),

  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
  transaction: (setOpen, type, data, relatedData) => (
    <TransactionForm
      setOpen={setOpen}
      type={type}
      data={data}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lmYellow"
      : type === "update"
      ? "bg-lmSky"
      : "bg-lmPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction, isPending] = React.useActionState(
      async (currentState: any, formData: FormData) => {
        return await deleteActionMap[table](currentState, formData);
      },
      { success: false, error: false }
    );

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className='p-4 flex flex-col gap-4'>
        <input type='hidden' name='id' defaultValue={id} />
        <span className='text-center font-medium'>
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button
          type='submit'
          disabled={isPending}
          className='py-2 px-4 rounded-md bg-red-600 text-white'>
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}>
        <Image src={`/${type}.png`} alt='' width={16} height={16} />
      </button>
      {open && (
        <div className='fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center overflow-y-auto py-10 '>
          <div className='bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto '>
            <Form />
            <div
              className='absolute top-4 right-4 cursor-pointer '
              onClick={() => setOpen(false)}>
              <Image src='/close.png' alt='' width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
