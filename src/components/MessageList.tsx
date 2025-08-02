"use client";

import React from "react";
import { deleteMessage } from "@/lib/actions";

interface Message {
  id: string;
  content: string;
  senderId?: string;
  recipients?: { recipientId: string }[];
  createdAt: Date;
}

interface UserMap {
  [key: string]: { name: string; surname: string; username?: string };
}

interface Props {
  messages: Message[];
  sentMessages: Message[];
  senderMap: UserMap;
  recipientMap: UserMap;
}

export default function MessageList({
  messages,
  sentMessages,
  senderMap,
  recipientMap,
}: Props) {
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const handleSubmitDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await deleteMessage(formData);
  };

  return (
    <div className='flex flex-col gap-4'>
      {messages.length > 0 && (
        <div className='flex flex-col gap-2'>
          {messages.map(
            (msg: {
              id: string;
              content: string;
              senderId?: string;
              createdAt: Date;
            }) => {
              const sender = senderMap[msg.senderId ?? ""] || {
                name: "Unknown",
                surname: "",
                username: "",
              };
              return (
                <div
                  key={msg.id}
                  className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex'>
                  <div className='flex flex-col'>
                    <p className='text-gray-900 mb-1'>{msg.content}</p>
                    <span className='text-sm text-gray-700 mb-2'>
                      From:{" "}
                      {sender.name.length > 0 ? sender.name : sender.username}
                      {sender.surname}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <form onSubmit={handleSubmitDelete} className='flex ml-auto'>
                    <input type='hidden' name='id' value={msg.id} />
                    {deleting === msg.id ? (
                      <div className='flex justify-center items-center gap-2'>
                        <div className='w-6 h-6 border-4 border-red-400 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-red-700 text-sm'>
                          Deleting...
                        </span>
                      </div>
                    ) : (
                      <button
                        type='submit'
                        className='mt-2 text-sm text-red-500 hover:underline font-bold w-full py-2 rounded'>
                        Delete
                      </button>
                    )}
                  </form>
                </div>
              );
            }
          )}
        </div>
      )}

      {sentMessages.length > 0 && (
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-bold mb-2'>Sent Messages</h2>
          <div className='flex flex-col gap-2'>
            {sentMessages.map((msg) => {
              const recipients =
                msg.recipients?.map((r) => recipientMap[r.recipientId]) || [];
              return (
                <div
                  key={msg.id}
                  className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex'>
                  <div className='flex flex-col'>
                    <p className='text-gray-900 mb-1'>{msg.content}</p>
                    <span className='text-sm text-gray-700 mb-2'>
                      To:{" "}
                      {recipients.length > 0
                        ? recipients.map((recipient, index) => {
                            const name =
                              recipient?.name?.length > 0
                                ? recipient.name
                                : recipient?.username || "Unknown";
                            return (
                              <span key={index}>
                                {name} {recipient?.surname || ""}
                                {index < recipients.length - 1 ? ", " : ""}
                              </span>
                            );
                          })
                        : "Unknown"}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <form onSubmit={handleSubmitDelete} className='flex ml-auto'>
                    <input type='hidden' name='id' value={msg.id} />
                    {deleting === msg.id ? (
                      <div className='flex justify-center items-center gap-2'>
                        <div className='w-6 h-6 border-4 border-red-400 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-red-700 text-sm'>
                          Deleting...
                        </span>
                      </div>
                    ) : (
                      <button
                        type='submit'
                        className='mt-2 text-sm text-red-500 hover:underline font-bold w-full py-2 rounded'>
                        Delete
                      </button>
                    )}
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
