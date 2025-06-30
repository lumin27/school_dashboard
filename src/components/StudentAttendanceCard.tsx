import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
    },
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.present).length;
  const percentage =
    totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : "0";

  return (
    <div>
      <h1 className='text-xl font-semibold '>{percentage}%</h1>
      <span className='text-sm text-gray-400'>Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
