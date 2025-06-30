import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";
import prisma from "@/lib/prisma";
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resData = await prisma.school.findFirst({
    select: { id: true, name: true, logo: true },
  });

  const schoolData = resData
    ? {
        ...resData,
        logo: resData.logo ?? "/logo.png",
      }
    : null;

  return (
    <div className='h-full flex'>
      {/* LEFT */}
      <SideBar schoolData={schoolData} />
      {/* RIGHT */}
      <div className='w-[100%] md:w-[100%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col'>
        <div className='fixed z-10 justify-between w-[100%] md:w-[80%] lg:w-[80%] xl:w-[86%] bg-[#F7F8FA] '>
          <Navbar />
        </div>
        <div className='mt-[65px] flex-1'>{children}</div>
      </div>
    </div>
  );
}
