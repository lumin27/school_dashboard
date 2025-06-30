// components/ClickableProfileImage.tsx
"use client";

import Image from "next/image";

type Props = {
  src: string;
};

export default function ProfileImage({ src }: Props) {
  return (
    <Image
      onClick={() => {
        window.location.href = "/profile";
      }}
      src={src || "/profile.png"}
      alt='profile'
      width={36}
      height={36}
      className='rounded-full cursor-pointer'
    />
  );
}
