"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import LogoutButton from "./LogoutButton";

const sideBarItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/grade.png",
        label: "Grades",
        href: "/list/grades",
        visible: ["admin"],
      },
      {
        icon: "/transaction.png",
        label: "Transactions",
        href: "/list/transactions",
        visible: ["admin", "accountant"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin"],
      },
    ],
  },
];

const SideBar = ({
  schoolData,
}: {
  schoolData: { id: string; name: string; logo: string } | null;
}) => {
  const href = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const { user } = useUser();
  const role = user?.publicMetadata.role as string;

  const SidebarContent = () => (
    <div className='flex flex-col h-screen'>
      <div className='p-2.5 border-b border-gray-200 bg-white'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src={getValidImageSrc(schoolData?.logo)}
            alt='logo'
            width={40}
            height={40}
            className='rounded-full'
          />
          <span className='font-bold'>{schoolData?.name}</span>
        </Link>
      </div>

      <div className='flex-1 overflow-y-auto px-2 pb-4'>
        {sideBarItems.map((i) => (
          <div key={i.title} className='flex flex-col gap-2'>
            <span className='text-sm text-gray-400 font-light ml-2 my-2'>
              {i.title}
            </span>
            {i.items.map((item) => {
              if (!role || !item.visible.includes(role)) return null;

              const isActive =
                item.href === "/" ? href === "/" : href?.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`flex items-center gap-4 py-2 px-2 rounded-md hover:bg-[#edf9fd] text-gray-600`}>
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                  />
                  <span
                    className={`text-sm ${
                      isActive ? "text-purple-300 font-bold" : ""
                    }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
        <LogoutButton />
      </div>
    </div>
  );

  const getValidImageSrc = (src: string | undefined | null) => {
    if (!src) return "/logo.png";
    try {
      const url = new URL(src);
      return url.href;
    } catch {
      return "/logo.png";
    }
  };

  return (
    <>
      <div className='fixed top-2 left-4 z-50 flex justify-between gap-4 md:hidden'>
        <Link href='/' className='md:block lg:hidden'>
          <Image
            src={getValidImageSrc(schoolData?.logo)}
            alt='logo'
            width={37}
            height={37}
          />
        </Link>
        <button
          className=' text-white px-2 py-3 rounded-full border-lmYellowLight'
          onClick={toggleSidebar}
          aria-label='Open sidebar'>
          <div className='space-y-1'>
            <div className='w-6 h-0.5 bg-purple-300' />
            <div className='w-6 h-0.5 bg-purple-300' />
            <div className='w-6 h-0.5 bg-purple-300' />
          </div>
        </button>
      </div>
      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-40 z-40'
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white transform flex overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 md:translate-x-0 md:static md:flex`}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default SideBar;
