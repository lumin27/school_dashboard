"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Loading = () => {
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("/api/school-logo");
        const data = await res.json();
        if (data.logo) {
          setLogo(data.logo);
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      }
    };

    fetchLogo();
    const interval = setInterval(fetchLogo, 5000);
    return () => clearInterval(interval);
  }, []);
  console.log(logo);
  return (
    <div className='w-full h-full flex flex-col items-center justify-center gap-6 bg-gray-50'>
      <div className='absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-0' />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className='z-10 flex flex-col items-center gap-4'>
        {logo.trim() && (
          <Image
            src={logo}
            alt='Logo'
            width={60}
            height={60}
            className='animate-bounce'
          />
        )}

        <div className='w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin'></div>
        <span className='text-gray-700 text-sm'>Loading, please wait...</span>
      </motion.div>
    </div>
  );
};

export default Loading;
