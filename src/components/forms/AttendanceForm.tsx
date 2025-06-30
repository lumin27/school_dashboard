"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import * as z from "zod";
import Image from "next/image";

import {
  getTeacherLessons,
  getStudentsByClass,
  getAttendanceForLessonAndDate,
  saveAttendance,
  getLessonDetails,
} from "@/lib/actions";

const formSchema = z.object({
  date: z.date({ required_error: "Select a date" }),
  lessonId: z.number({ required_error: "Select a lesson" }),
  attendance: z.array(
    z.object({ studentId: z.string(), present: z.boolean() })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormProps {
  userRole: string;
  userId: string;
}

export default function AttendanceForm({
  userRole,
  userId,
}: AttendanceFormProps) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [open, setOpen] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      lessonId: undefined,
      attendance: [],
    },
  });

  const selectedLessonId = Number(form.watch("lessonId"));
  const selectedDate = form.watch("date");

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const lessonsData = await getTeacherLessons();
        setLessons(lessonsData || []);
      } catch {
        toast.error("Error loading lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!selectedLessonId) return;
      try {
        const lesson = await getLessonDetails(selectedLessonId);
        setSelectedLesson(lesson);
      } catch {
        setSelectedLesson(null);
      }
    };

    fetchLessonDetails();
  }, [selectedLessonId]);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedLessonId) return;
      setLoadingStudents(true);

      try {
        const lesson = lessons.find((l) => l.id === selectedLessonId);
        if (!lesson) return toast.error("Lesson not found");
        const studentList = await getStudentsByClass(lesson.classId);
        setStudents(studentList);

        const initial = studentList.map((student: any) => ({
          studentId: student.id,
          present: false,
        }));

        const existing = await getAttendanceForLessonAndDate(
          selectedLessonId,
          selectedDate.toISOString()
        );

        if (existing.length > 0) {
          existing.forEach((record) => {
            const found = initial.find((a) => a.studentId === record.studentId);
            if (found) found.present = record.present;
          });
          setIsEditing(true);
        } else {
          setIsEditing(false);
        }
        form.setValue("attendance", initial);
      } catch {
        toast.error("Error loading students");
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedLessonId, selectedDate, lessons, form]);

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const result = await saveAttendance({
          date: data.date,
          lessonId: data.lessonId,
          attendance: data.attendance,
        });

        if (result.success) {
          toast("Saved successfully");
          form.reset({
            date: new Date(),
            lessonId: undefined,
            attendance: [],
          });
          setSelectedLesson(null);
          setStudents([]);
          setOpen(false);
        } else {
          toast.error("Save failed");
        }
      } catch {
        toast.error("Submit error");
      }
    });
  };

  // Mark students
  const handleMarkAll = (present: boolean) => {
    const updatedAttendance = students.map((student: any) => ({
      studentId: student.id,
      present,
    }));
    form.setValue("attendance", updatedAttendance);
    toast.success(`Marked all as ${present ? "present" : "absent"}`);
  };

  if (!open) return null;

  return (
    <div className='w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center'>
      <div className='bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]'>
        <div
          className='absolute top-4 right-4 cursor-pointer'
          onClick={() => setOpen(false)}>
          <Image src='/close.png' alt='Close' width={14} height={14} />
        </div>

        <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
          Attendance Form
        </h2>
        {loading ? (
          <div className='flex justify-center gap-2 items-center min-h-[200px]'>
            <div className='w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin' />
            <span className='text-gray-700 text-sm'>Loading...</span>
          </div>
        ) : lessons.length === 0 ? (
          <p className='text-center text-gray-500'>No lessons available</p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Date Field */}
            <div>
              <label
                htmlFor='date'
                className='block mb-1 font-medium text-gray-700'>
                Date:
              </label>
              <input
                id='date'
                type='datetime-local'
                {...form.register("date", { valueAsDate: true })}
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
              />
              {form.formState.errors.date && (
                <p className='text-red-600 mt-1 text-sm'>
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            {/* Lesson Select */}
            <div>
              <label
                htmlFor='lessonId'
                className='block mb-1 font-medium text-gray-700'>
                Lesson:
              </label>
              <select
                id='lessonId'
                {...form.register("lessonId", { setValueAs: (v) => Number(v) })}
                className='w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400'
                defaultValue={selectedLessonId || ""}
                disabled={isEditing}>
                <option value='' disabled>
                  Select lesson
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.name} ({lesson.subject.name})
                  </option>
                ))}
              </select>
              {form.formState.errors.lessonId && (
                <p className='text-red-600 mt-1 text-sm'>
                  {form.formState.errors.lessonId.message}
                </p>
              )}
            </div>

            {/* Mark All */}
            {students.length > 0 && (
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => handleMarkAll(true)}
                  className='flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'>
                  Mark All Present
                </button>
                <button
                  type='button'
                  onClick={() => handleMarkAll(false)}
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'>
                  Mark All Absent
                </button>
              </div>
            )}

            {/* Student List */}
            {loadingStudents ? (
              <p className='text-center text-gray-500'>Loading students...</p>
            ) : students.length === 0 ? (
              <p className='text-center text-gray-500'>
                No students found for this lesson
              </p>
            ) : (
              <div className='space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded p-4'>
                {students.map((student, index) => (
                  <label
                    key={student.id}
                    className='flex items-center justify-between gap-4 p-2 hover:bg-gray-50 rounded cursor-pointer'>
                    <span className='text-gray-900 font-medium'>
                      {student.name} {student.surname}
                    </span>
                    <input
                      type='checkbox'
                      {...form.register(`attendance.${index}.present`)}
                      className='h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                    />
                    <input
                      type='hidden'
                      {...form.register(`attendance.${index}.studentId`)}
                      value={student.id}
                    />
                  </label>
                ))}
              </div>
            )}

            <button
              type='submit'
              disabled={isPending}
              className='w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700 transition disabled:opacity-50'>
              {isPending ? "Saving..." : "Save Attendance"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
