"use server";

import { auth } from "@clerk/nextjs/server";
import {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceFormSchema,
  attendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  LessonSchema,
  messageSchema,
  ParentSchema,
  ResultSchema,
  schoolSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  transactionSchema,
  TransactionSchema,
} from "./formValidationSchema";
import { clerkClient } from "@clerk/express";
import { revalidatePath } from "next/cache";
import cloudinary from "./cloundinary";
import { Parent, Prisma } from "@prisma/client";
import prisma from "./prisma";

type CurrentState = {
  success: boolean;
  error: boolean;
};

export async function createSchool(formData: FormData) {
  const { name, openingTime, closingTime } = schoolSchema.parse(
    Object.fromEntries(formData)
  );
  const file = formData.get("logo");
  if (!file) return { success: false, error: true };

  if (name.length < 3) return { success: false, error: true };
  if (
    file instanceof File &&
    typeof file.arrayBuffer === "function" &&
    file.size > 0
  ) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
      folder: "school-images",
    });
    const logo = uploadResponse.secure_url;
    try {
      await prisma.school.create({
        data: {
          name,
          logo,
          openingTime,
          closingTime,
        },
      });
      revalidatePath("/list/settings");
      return { success: true, error: false };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  }
}

export const updateSchool = async (formData: FormData) => {
  const { id, name, openingTime, closingTime } = schoolSchema.parse(
    Object.fromEntries(formData)
  );
  const file = formData.get("logo") as File | null;

  if (name.length < 3) return { success: false, error: true };

  if (!id) throw new Error("Missing school ID");

  const existingSchool = await prisma.school.findUnique({
    where: { id },
    select: { logo: true },
  });

  if (!existingSchool) throw new Error("School not found");

  let logo = existingSchool.logo ?? "https://default-logo.com/logo.png";

  if (
    file instanceof File &&
    typeof file.arrayBuffer === "function" &&
    file.size > 0
  ) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
      folder: "school-images",
    });
    logo = uploadResponse.secure_url;
  }
  try {
    await prisma.school.update({
      where: { id },
      data: {
        name,
        logo,
        openingTime,
        closingTime,
      },
    });
    revalidatePath("/list/settings");
    return { success: true, error: false };
  } catch (error) {
    console.error("Update failed:", error);
    return { success: false, error: true };
  }
};

// SUBJECT DATA

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// CLASS DATA
export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId,
        gradeId: data.gradeId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// TEACHER DATA
export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const file = data.img;
    let imageUrl: string | null = null;

    if (
      file instanceof File &&
      typeof file.arrayBuffer === "function" &&
      file.size > 0
    ) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: "school-images",
      });
      imageUrl = uploadResponse.secure_url;
    }
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday || null,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.log("Clerk error:", err.errors);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const file = data.img as File;
    let imageUrl: string | null = null;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: data.id },
      select: { img: true },
    });

    imageUrl = existingTeacher?.img ?? null;
    if (
      file instanceof File &&
      typeof file.arrayBuffer === "function" &&
      file.size > 0
    ) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: "school-images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // Use transaction to ensure data consistency between Clerk and database
    await prisma.$transaction(async (tx) => {
      // Update user in Clerk
      await clerkClient.users.updateUser(data.id!, {
        username: data.username,
        ...(data.password !== "" && { password: data.password }),
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "teacher" },
      });

      // Update teacher in database (remove password field since Clerk handles auth)
      await tx.teacher.update({
        where: { id: data.id },
        data: {
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          birthday: data.birthday || null,
          address: data.address,
          img: imageUrl || null,
          bloodType: data.bloodType,
          sex: data.sex,
          subjects: {
            set: data.subjects?.map((subjectId) => ({
              id: parseInt(subjectId),
            })),
          },
        },
      });
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (error: any) {
    console.log("Update teacher error:", error.errors || error);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: { id: id },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// STUDENT DATA
export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const file = data.img;
    let imageUrl: string | null = null;

    if (
      file instanceof File &&
      typeof file.arrayBuffer === "function" &&
      file.size > 0
    ) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: "school-images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (
      classItem &&
      classItem.capacity != null &&
      classItem.capacity === classItem._count.students
    ) {
      return { success: false, error: true, message: "Class is full." };
    }

    let parent;
    if (data.parentId) {
      parent = await prisma.parent.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        return {
          success: false,
          error: true,
          message: "Invalid parent ID.",
        };
      }
    }

    let user;
    try {
      user = await clerkClient.users.createUser({
        username: data.username,
        password: data.password,
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "student" },
      });
    } catch (err: any) {
      if (err?.errors?.[0]?.code === "form_identifier_exists") {
        return {
          success: false,
          error: true,
          message: "Username is already taken. Please choose another.",
        };
      }
      throw err;
    }

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        address: data.address,
        img: imageUrl || null,
        bloodType: data.bloodType,
        sex: data.sex,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Clerk error:", JSON.stringify(err, null, 2));
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const file = data.img as File;
    let imageUrl: string | null = null;

    const existingStudent = await prisma.student.findUnique({
      where: { id: data.id },
      select: { img: true },
    });

    imageUrl = existingStudent?.img ?? null;
    if (
      file instanceof File &&
      typeof file.arrayBuffer === "function" &&
      file.size > 0
    ) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
        folder: "school-images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday || null,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: { id: id },
    });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// EXAM DATA

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.exam.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// PARENT DATA

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });
    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Error creating parent:", JSON.stringify(err, null, 2));
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" },
    });
    console.log("Updated parent in database...", data);

    await prisma.parent.update({
      where: { id: data.id },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: { id: id },
    });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
// LESSON DATA

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        teacherId: data.teacherId,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        teacherId: data.teacherId,
        classId: data.classId,
        subjectId: data.subjectId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.lesson.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// ASSIGNMENT DATA

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.assignment.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

//  RESULT DATA

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.assignmentId && !data.examId) {
    return { success: false, error: true };
  }

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.result.create({
      data: {
        score: Number(data.score),
        examId: data.examId ? Number(data.examId) : null,
        studentId: data.studentId,
        assignmentId: data.assignmentId ? Number(data.assignmentId) : null,
      },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error(error);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.assignmentId && !data.examId) {
    return { success: false, error: true };
  }

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        examId: data.examId || null,
        studentId: data.studentId,
        assignmentId: data.assignmentId || null,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.result.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

//  EVENT DATA

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description as string,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

//  ANNOUNCEMENT DATA

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description as string,
        date: data.date,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};
export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: Number(id),
      },
    });
    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
};

// ATTENDANCE DATA

export async function saveAttendance(data: AttendanceFormSchema) {
  const validatedData = attendanceSchema.parse(data);

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  if (role === "teacher") {
    const hasAccess = await canTeacherAccessLesson(
      userId as string,
      validatedData.lessonId
    );
    if (!hasAccess) {
      return {
        success: false,
        error: "You are not authorized to record attendance for this lesson",
      };
    }
  }

  try {
    const attendanceDate = new Date(validatedData.date);

    const start = new Date(attendanceDate);
    const end = new Date(start.getTime() + 60 * 1000);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.attendance.deleteMany({
          where: {
            lessonId: validatedData.lessonId,
            date: {
              gte: start,
              lt: end,
            },
          },
        });

        const records = validatedData.attendance.map((record) => ({
          date: attendanceDate,
          present: record.present,
          studentId: String(record.studentId),
          lessonId: validatedData.lessonId,
        }));

        const created = await tx.attendance.createMany({
          data: records,
          skipDuplicates: false,
        });

        return created;
      }
    );

    revalidatePath("/attendance");

    return {
      success: true,
      message: `Recorded attendance for ${
        validatedData.attendance.filter((r) => r.present).length
      } students`,
    };
  } catch (error) {
    console.error("Error saving attendance:", error);
    return { success: false, error: "Failed to save attendance records" };
  }
}

export async function getTeacherLessons() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;
  if (!userId || !role) {
    return [];
  }

  if (role === "admin") {
    return await prisma.lesson.findMany({
      where: {},
      include: { subject: true, class: true },
      orderBy: { name: "asc" },
    });
  } else if (role === "teacher") {
    return await prisma.lesson.findMany({
      where: {
        teacherId: userId,
      },
      include: {
        subject: true,
        class: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } else {
    console.error("Unauthorized role:", role);
    return [];
  }
}

export async function getStudentsByClass(classId: number) {
  try {
    return await prisma.student.findMany({
      where: {
        classId,
      },
      orderBy: [{ name: "asc" }, { surname: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export async function getAttendanceForLessonAndDate(
  lessonId: number,
  date: string
) {
  const attendanceDate = new Date(date);
  const startOfMinute = new Date(attendanceDate.getTime());
  const endOfMinute = new Date(attendanceDate.getTime() + 60 * 1000);

  return await prisma.attendance.findMany({
    where: {
      lessonId,
      date: {
        gte: startOfMinute,
        lt: endOfMinute,
      },
    },
  });
}

async function canTeacherAccessLesson(teacherId: string, lessonId: number) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        teacherId: true,
      },
    });

    return lesson?.teacherId === teacherId;
  } catch (error) {
    console.error("Error checking lesson access:", error);
    return false;
  }
}

export async function getAttendanceForStudent(studentId: string) {
  const total = await prisma.attendance.count({
    where: { studentId },
  });

  const present = await prisma.attendance.count({
    where: {
      studentId,
      present: true,
    },
  });

  return {
    total,
    present,
  };
}

export async function getAttendanceForTeacher(teacherId: string) {
  const total = await prisma.attendance.count({
    where: {
      lesson: {
        teacherId,
      },
    },
  });

  const present = await prisma.attendance.count({
    where: {
      lesson: {
        teacherId,
      },
      present: true,
    },
  });

  return {
    total,
    present,
  };
}

// Get lesson details
export async function getLessonDetails(lessonId: number) {
  try {
    return await prisma.lesson.findFirst({
      where: {
        id: Number(lessonId),
      },
      include: {
        subject: true,
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching lesson details:", error);
    return null;
  }
}

export async function getAttendanceByClass(classId: number) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
      student: {
        classId,
      },
    },
    select: {
      date: true,
      present: true,
    },
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    Object.fromEntries(
      daysOfWeek.map((day) => [day, { present: 0, absent: 0 }])
    );

  resData.forEach((item: { date: Date; present: boolean }) => {
    const itemDate = new Date(item.date);
    const dayName = daysOfWeek[itemDate.getDay()];
    if (item.present) {
      attendanceMap[dayName].present += 1;
    } else {
      attendanceMap[dayName].absent += 1;
    }
  });

  return daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));
}

//  TRNSACTION DATA

export async function createTransaction(
  prevState: CurrentState,
  data: TransactionSchema
): Promise<CurrentState> {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;

  if (!userId || (role !== "accountant" && role !== "admin")) {
    return { success: false, error: true };
  }

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation error", parsed.error.format());
    return { success: false, error: true };
  }

  const { type, amount, description, date } = parsed.data;

  try {
    await prisma.transaction.create({
      data: {
        type,
        amount,
        description: description || "",
        accountId: userId,
        date,
      },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: true };
  }
}

export async function getTransactions(
  currentState: CurrentState,
  data: FormData
) {
  const { userId } = await auth();
  try {
    return await prisma.transaction.findMany({
      where: {
        accountId: userId!,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function updateTransaction(
  currentState: CurrentState,
  data: TransactionSchema
) {
  try {
    await prisma.transaction.update({
      where: { id: data.id },
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: true };
  }
}

export async function deleteTransaction(
  currentState: CurrentState,
  data: FormData
) {
  const id = data.get("id") as string;
  try {
    await prisma.transaction.delete({
      where: { id },
    });
    revalidatePath("/list/transactions");
    return { success: true, error: false };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: true };
  }
}

//  MESSAGE DATA

export async function fetchRecipients() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return [];
  const role = (sessionClaims?.metadata as { role: string })?.role;

  switch (role) {
    case "admin": {
      const [teachers, students, parents] = await Promise.all([
        prisma.teacher.findMany(),
        prisma.student.findMany(),
        prisma.parent.findMany(),
      ]);
      return [...teachers, ...students, ...parents].map((u) => ({
        value: u.id,
        label: `${u.name} ${u.surname} (${u.username})`,
      }));
    }
    case "teacher": {
      const teacher = await prisma.teacher.findUnique({
        where: { id: userId },
        include: {
          lessons: {
            include: {
              class: { include: { students: { include: { parent: true } } } },
            },
          },
        },
      });
      const lessons = teacher?.lessons || [];
      const students = lessons.flatMap((lesson) => lesson.class.students);
      const parents = students.map((s: { parent: Parent }) => s.parent);
      const admin = await prisma.admin.findMany();
      const allowed = [...admin, ...parents];
      if (students.length > 0) allowed.push(...students);
      return allowed.map((u) => ({
        value: u.id,
        label: `${u.name} ${u.surname} (${u.username})`,
      }));
    }
    case "student": {
      const student = await prisma.student.findUnique({
        where: { id: userId },
        include: { class: { include: { supervisor: true } } },
      });
      const supervisor = student?.class.supervisor;
      const admin = await prisma.admin.findMany();
      const allowed = [...admin];
      if (supervisor) allowed.push(supervisor);
      return allowed.map((u) => ({
        value: u.id,
        label: ` ${u.name} ${u.surname} (${u.username})`,
      }));
    }
    case "parent": {
      const parent = await prisma.parent.findUnique({
        where: { id: userId },
        include: {
          students: { include: { class: { include: { supervisor: true } } } },
        },
      });
      const supervisors = parent?.students
        ?.map((s: any) => s.class?.supervisor)
        .filter(Boolean);

      const admin = await prisma.admin.findMany();
      const unique = [...(supervisors ?? []), ...admin]
        .map((u) => [u?.id, u])
        .filter(Boolean)
        .map(([id, u]) => u);

      return unique
        .map((u) => {
          if (typeof u === "object" && u !== null) {
            return {
              value: u.id,
              label: `${u.name} ${u.surname} (${u.username})`,
            };
          } else {
            return null;
          }
        })
        .filter(Boolean);
    }
    default:
      return [];
  }
}

export async function sendMessage(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const { recipientId, content } = messageSchema.parse({
    recipientId: formData.get("recipient")?.toString(),
    content: formData.get("message")?.toString(),
  });

  try {
    await prisma.message.create({
      data: {
        senderId: userId!,
        recipientId,
        content,
      },
    });
    revalidatePath("/list/messages");
    return { success: "Message sent!" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

export async function deleteMessage(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const message = await prisma.message.findUnique({
    where: { id },
  });

  try {
    if (!message) throw new Error("Message not found");

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new Error("Not allowed to delete this message");
    }
    await prisma.message.delete({ where: { id } });
    revalidatePath("/list/messages");
    return { success: "Message deleted!" };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { error: "Failed to delete message" };
  }
}
