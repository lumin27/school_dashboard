import { date, z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters!" })
    .max(20, { message: "Username must be at most 20 characters!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  address: z.string(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  img: z.any().optional(),
  subjects: z.array(z.string()).optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters!" })
    .max(20, { message: "Username must be at most 20 characters!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  address: z.string(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  img: z.any().optional(),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "ParentId is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Subject name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number().min(1, { message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters!" })
    .max(20, { message: "Username must be at most 20 characters!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, { message: "Password must be at least 6 characters!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Parent phone number is required!" }),
  address: z.string().min(1, { message: "Parent address is required!" }),
  students: z.array(z.string()),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!",
  }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.coerce.string().min(1, { message: "Teacher is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Class name is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number().min(1, { message: "Lesson is required!" }),
  results: z.array(z.number()).optional(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(), // Optional ID for updates
  score: z.coerce.number().min(0, { message: "Score is required!" }), // Will turn "89" -> 89
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const attendanceSchema = z
  .object({
    date: z.coerce.date({ message: "Date is required!" }),
    lessonId: z.number(),
    attendance: z.array(
      z.object({
        studentId: z.string(),
        present: z.boolean(),
      })
    ),
  })
  .strict();

export type AttendanceFormSchema = z.infer<typeof attendanceSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Subject name is required!" }),
  description: z.string().optional(),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Subject name is required!" }),
  description: z.string().optional(),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.coerce.date({ message: "Date is required!" }),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;

export const messageSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, { message: "Message is required!" }),
  recipientId: z.string().min(1, { message: "Recipient is required!" }),
});

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const schoolSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Name is required!" }),
  openingTime: z
    .string()
    .regex(timeRegex, { message: "Opening time must be in HH:MM format" })
    .optional(),
  closingTime: z
    .string()
    .regex(timeRegex, { message: "Closing time must be in HH:MM format" })
    .optional(),
});
