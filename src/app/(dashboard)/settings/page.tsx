import React from "react";
import UpdateSchoolForm from "./UpdateSchoolForm";
import CreateSchoolForm from "./CreateSchoolForm";
import prisma from "@/lib/prisma";

const SettingPage = async () => {
  const raw = await prisma.school.findFirst({
    select: {
      id: true,
      name: true,
      logo: true,
      openingTime: true,
      closingTime: true,
    },
  });

  const schoolData = raw
    ? {
        ...raw,
        logo: raw.logo ?? undefined,
        openingTime: raw.openingTime ?? undefined,
        closingTime: raw.closingTime ?? undefined,
      }
    : null;

  return (
    <div className=''>
      {schoolData ? (
        <UpdateSchoolForm schoolData={schoolData} />
      ) : (
        <CreateSchoolForm />
      )}
    </div>
  );
};

export default SettingPage;
