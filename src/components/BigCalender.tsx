"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const toTimeDate = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(1970, 0, 1);

  // Interpret "00:00" as end of day
  if (hours === 0 && minutes === 0) {
    date.setHours(23, 59, 59);
  } else {
    date.setHours(hours, minutes, 0);
  }

  return date;
};

const BigCalendar = ({
  data,
  schoolData,
}: {
  data: { title: string; start: Date; end: Date }[];
  schoolData: { openingTime: string; closingTime: string };
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  let min = toTimeDate(schoolData.openingTime || "08:00");
  let max = toTimeDate(schoolData.closingTime || "17:00");

  if (min >= max) {
    min = toTimeDate("08:00");
    max = toTimeDate("17:00");
  }

  return (
    <div className='h-screen p-4'>
      <Calendar
        localizer={localizer}
        events={data}
        startAccessor='start'
        endAccessor='end'
        views={["work_week", "day"]}
        view={view}
        onView={setView}
        style={{ height: "90%" }}
        min={min}
        max={max}
        step={30}
        timeslots={2}
      />
    </div>
  );
};

export default BigCalendar;
