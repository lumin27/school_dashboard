import React from "react";
import BigCalender from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: number | string;
}) => {
  const { sessionClaims } = await auth();
  const schoolData = await prisma.school.findFirst({
    select: {
      openingTime: true,
      closingTime: true,
    },
  });

  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });
  const data = dataRes.map(
    (item: { name: string; startTime: Date; endTime: Date }) => {
      return {
        title: item.name,
        start: new Date(item.startTime),
        end: new Date(item.endTime),
      };
    }
  );

  const schedule = adjustScheduleToCurrentWeek(data);
  return (
    <div>
      <BigCalender
        data={schedule}
        schoolData={{
          openingTime: schoolData?.openingTime ?? "",
          closingTime: schoolData?.closingTime ?? "",
        }}
      />
    </div>
  );
};

export default BigCalendarContainer;
