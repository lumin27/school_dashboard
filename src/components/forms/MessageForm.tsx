"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { fetchRecipients, sendMessage } from "@/lib/actions";
import Image from "next/image";
import { toast } from "react-toastify";

interface SendMessageButtonProps {
  userRole: string;
  userId: string;
  open?: boolean;
  setOpen?: (val: boolean) => void;
}

export default function MessageForm({
  open: externalOpen,
  setOpen: setExternalOpen,
}: SendMessageButtonProps) {
  const { user } = useUser();
  const [recipients, setRecipients] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;

  useEffect(() => {
    const loadRecipients = async () => {
      setFetching(true);
      if (user?.publicMetadata?.role) {
        const res = await fetchRecipients();
        if (res !== null) {
          setRecipients(res.filter((item) => item !== null));
        } else {
          setRecipients([]);
        }
        setFetching(false);
      }
    };
    loadRecipients();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecipient) {
      toast.error("Please select a recipient.");
      return;
    }
    if (!content) {
      toast.error("Please write some message.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("recipient", selectedRecipient);
    form.append("message", content);
    const result = await sendMessage(form);
    setLoading(false);

    if (result?.success) {
      setContent("");
      setSelectedRecipient("");
      toast.success("Message sent successfully!");
      setSearchTerm("");
      setOpen(false);
    } else {
      toast.error("Failed to send message.");
    }
  };

  const uniqueRecipients = Array.from(
    new Map(recipients.map((r) => [r.value, r])).values()
  );

  const filteredRecipients = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return uniqueRecipients.filter((r) =>
      r.label.toLowerCase().includes(lower)
    );
  }, [searchTerm, uniqueRecipients]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center'>
      <div className='bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] shadow-lg'>
        <h2 className='text-xl font-semibold mb-4'>Send Message</h2>
        <div
          className='absolute top-4 right-4 cursor-pointer'
          onClick={() => {
            setSearchTerm("");
            setOpen(false);
          }}>
          <Image src='/close.png' alt='Close' width={16} height={16} />
        </div>
        {fetching ? (
          <div className='flex justify-center gap-2 items-center min-h-[200px]'>
            <div className='w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin' />
            <span className='text-gray-700 text-sm'>Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type='text'
              placeholder='Search by name...'
              className='w-full mb-3 p-2 border border-gray-300 rounded'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              name='recipient'
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className='w-full mb-3 p-2 border border-gray-300 rounded'>
              <option value=''>Select Recipient</option>
              {filteredRecipients.map((recipient) => (
                <option key={recipient.value} value={recipient.value}>
                  {recipient.label}
                </option>
              ))}
            </select>
            <textarea
              name='message'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className='w-full mb-3 p-2 border border-gray-300 rounded'
              placeholder='Write your message...'></textarea>

            <button
              type='submit'
              disabled={loading}
              className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300'>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
