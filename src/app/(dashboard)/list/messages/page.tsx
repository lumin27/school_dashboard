import MessageList from "@/components/MessageList";
import SendMessageButton from "@/components/SendMessageButton";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const MessagesPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role: string })?.role;
  if (!userId)
    return <div className='text-center text-red-500 mt-10'>Unauthorized</div>;

  const messages = await prisma.message.findMany({
    where: { recipientId: userId },
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    select: {
      id: true,
      content: true,
      recipientId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const senderIds = messages.map((msg: any) => msg.senderId);

  const [parents, teachers, students, admins] = await Promise.all([
    prisma.parent.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.teacher.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.student.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.admin.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
  ]);

  const senderMap: Record<
    string,
    { name: string; surname: string; username?: string }
  > = {};
  [...parents, ...teachers, ...students, ...admins].forEach((user) => {
    senderMap[user.id] = {
      name: user.name ?? "",
      surname: user.surname ?? "",
      username: user.username ?? "",
    };
  });

  const recipientIds = sentMessages.map((msg: any) => msg.recipientId);

  const [parents2, teachers2, students2, admins2] = await Promise.all([
    prisma.parent.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.teacher.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.student.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
    prisma.admin.findMany({
      where: { id: { in: recipientIds } },
      select: { id: true, name: true, surname: true, username: true },
    }),
  ]);

  const recipientMap: Record<
    string,
    { name: string; surname: string; username?: string }
  > = {};
  [...parents2, ...teachers2, ...students2, ...admins2].forEach((user) => {
    recipientMap[user.id] = {
      name: user.name ?? "",
      surname: user.surname ?? "",
      username: user.username ?? "",
    };
  });

  return (
    <div className='p-2 bg-white h-full mx-4'>
      <div className='flex items-center justify-between'>
        {messages.length > 0 && (
          <h2 className='text-2xl font-bold mb-2'>Messages</h2>
        )}
        <div className='flex ml-auto'>
          <SendMessageButton userRole={role} userId={userId} />
        </div>
      </div>
      <MessageList
        messages={messages}
        sentMessages={sentMessages}
        senderMap={senderMap}
        recipientMap={recipientMap}
      />
    </div>
  );
};
export default MessagesPage;
