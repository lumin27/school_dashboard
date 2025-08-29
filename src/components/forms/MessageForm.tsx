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
  const [recipients, setRecipients] = useState<{
    [key: string]: { value: string; label: string; role: string }[];
  }>({});
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRecipients, setShowRecipients] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
    new Set()
  );

  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;

  useEffect(() => {
    const loadRecipients = async () => {
      setFetching(true);
      if (user?.publicMetadata?.role) {
        const res = await fetchRecipients();
        if (res !== null && typeof res === "object") {
          setRecipients(
            res as {
              [key: string]: { value: string; label: string; role: string }[];
            }
          );
        } else {
          setRecipients({});
        }
        setFetching(false);
      }
    };
    loadRecipients();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient.");
      return;
    }
    if (!content) {
      toast.error("Please write some message.");
      return;
    }

    setLoading(true);
    const form = new FormData();
    selectedRecipients.forEach((recipientId) => {
      form.append("recipients", recipientId);
    });
    form.append("message", content);
    const result = await sendMessage(form);
    setLoading(false);

    if (result?.success) {
      setContent("");
      setSelectedRecipients([]);
      toast.success("Message sent successfully!");
      setSearchTerm("");
      setOpen(false);
    } else {
      toast.error("Failed to send message.");
    }
  };

  const allRecipients = Object.values(recipients).flat();

  const filteredRecipients = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return Object.entries(recipients).reduce((acc, [role, recipientsList]) => {
      const filtered = recipientsList.filter((r) =>
        r.label.toLowerCase().includes(lower)
      );
      if (filtered.length > 0) {
        acc[role] = filtered;
      }
      return acc;
    }, {} as typeof recipients);
  }, [searchTerm, recipients]);

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleClassToggle = (className: string) => {
    setExpandedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center'>
      <div className='bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] shadow-lg'>
        <h2 className='text-xl font-semibold mb-4'>Send Message</h2>
        <div
          className='absolute top-4 right-4 cursor-pointer'
          onClick={() => {
            setSelectedRecipients([]);
            setExpandedClasses(new Set());
            setShowRecipients(false);
            setContent("");
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
            <button
              type='button'
              onClick={() => setShowRecipients(!showRecipients)}
              className='w-full mb-3 p-2 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between'>
              <span>
                {selectedRecipients.length > 0
                  ? `${selectedRecipients.length} recipient${
                      selectedRecipients.length !== 1 ? "s" : ""
                    } selected`
                  : "Select recipients..."}
              </span>
              <span className='text-gray-500'>
                {showRecipients ? "▲" : "▼"}
              </span>
            </button>

            {showRecipients && (
              <>
                <input
                  type='text'
                  placeholder='Search by name...'
                  className='w-full mb-3 p-2 border border-gray-300 rounded'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className='max-h-48 overflow-y-auto border border-gray-300 rounded p-2 mb-3'>
                  {(() => {
                    const classes = Object.entries(filteredRecipients).filter(
                      ([role]) => role.match(/^Class|^\d/)
                    );
                    const otherRoles = Object.entries(
                      filteredRecipients
                    ).filter(([role]) => !role.match(/^Class|^\d/));

                    const allStudents = classes.flatMap(
                      ([_, recipientsList]) => recipientsList
                    );
                    const selectedStudents = allStudents.filter((r) =>
                      selectedRecipients.includes(r.value)
                    );
                    const isStudentsExpanded = expandedClasses.has("students");

                    return (
                      <>
                        {classes.length > 0 && (
                          <div className='mb-3'>
                            <button
                              type='button'
                              onClick={() => handleClassToggle("students")}
                              className='w-full p-2 text-left hover:bg-gray-50 rounded flex items-center justify-between'>
                              <span className='font-medium text-sm text-gray-700'>
                                Students ({allStudents.length})
                                {selectedStudents.length > 0 && (
                                  <span className='text-blue-600 ml-2'>
                                    • {selectedStudents.length} selected
                                  </span>
                                )}
                              </span>
                              <span className='text-gray-500 text-xs'>
                                {isStudentsExpanded ? "▲" : "▼"}
                              </span>
                            </button>
                            {isStudentsExpanded && (
                              <div className='ml-4 space-y-1'>
                                {classes.map(([role, recipientsList]) => {
                                  const selectedInClass = recipientsList.filter(
                                    (r) => selectedRecipients.includes(r.value)
                                  ).length;
                                  const isClassExpanded =
                                    expandedClasses.has(role);

                                  return (
                                    <div key={role} className='mb-2'>
                                      <button
                                        type='button'
                                        onClick={() => handleClassToggle(role)}
                                        className='w-full p-2 text-left hover:bg-gray-50 rounded flex items-center justify-between'>
                                        <span className='text-sm text-gray-700'>
                                          {role} ({recipientsList.length})
                                          {selectedInClass > 0 && (
                                            <span className='text-blue-600 ml-2'>
                                              • {selectedInClass} selected
                                            </span>
                                          )}
                                        </span>
                                        <span className='text-gray-500 text-xs'>
                                          {isClassExpanded ? "▲" : "▼"}
                                        </span>
                                      </button>
                                      {isClassExpanded && (
                                        <div className='ml-4 space-y-1'>
                                          {recipientsList.map((recipient) => (
                                            <label
                                              key={recipient.value}
                                              className='flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded'>
                                              <input
                                                type='checkbox'
                                                checked={selectedRecipients.includes(
                                                  recipient.value
                                                )}
                                                onChange={() =>
                                                  handleRecipientToggle(
                                                    recipient.value
                                                  )
                                                }
                                                className='rounded'
                                              />
                                              <span className='text-sm'>
                                                {recipient.label}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {otherRoles.map(([role, recipientsList]) => {
                          if (role === "parents" || role === "teachers") {
                            const isExpanded = expandedClasses.has(role);
                            const selectedInGroup = recipientsList.filter((r) =>
                              selectedRecipients.includes(r.value)
                            ).length;

                            return (
                              <div key={role} className='mb-2'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <button
                                    type='button'
                                    onClick={() => handleClassToggle(role)}
                                    className='flex-1 p-2 text-left hover:bg-gray-50 rounded flex items-center justify-between'>
                                    <span className='font-medium text-sm text-gray-700 capitalize'>
                                      {role} ({recipientsList.length})
                                      {selectedInGroup > 0 && (
                                        <span className='text-blue-600 ml-2'>
                                          • {selectedInGroup} selected
                                        </span>
                                      )}
                                    </span>
                                    <span className='text-gray-500 text-xs'>
                                      {isExpanded ? "▲" : "▼"}
                                    </span>
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const allRecipientIds =
                                        recipientsList.map((r) => r.value);
                                      const allSelected = allRecipientIds.every(
                                        (id) => selectedRecipients.includes(id)
                                      );

                                      if (allSelected) {
                                        setSelectedRecipients((prev) =>
                                          prev.filter(
                                            (id) =>
                                              !allRecipientIds.includes(id)
                                          )
                                        );
                                      } else {
                                        setSelectedRecipients((prev) => [
                                          ...new Set([
                                            ...prev,
                                            ...allRecipientIds,
                                          ]),
                                        ]);
                                      }
                                    }}
                                    className={`px-3 py-2 text-white text-xs rounded ${
                                      selectedInGroup === recipientsList.length
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}>
                                    {selectedInGroup === recipientsList.length
                                      ? "Deselect All"
                                      : "Select All"}
                                  </button>
                                </div>
                                {isExpanded && (
                                  <div className='ml-4 space-y-1'>
                                    {recipientsList.map((recipient) => (
                                      <label
                                        key={recipient.value}
                                        className='flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded'>
                                        <input
                                          type='checkbox'
                                          checked={selectedRecipients.includes(
                                            recipient.value
                                          )}
                                          onChange={() =>
                                            handleRecipientToggle(
                                              recipient.value
                                            )
                                          }
                                          className='rounded'
                                        />
                                        <span className='text-sm'>
                                          {recipient.label}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <div key={role} className='mb-3'>
                                <h4 className='font-medium text-sm text-gray-700 mb-2 capitalize'>
                                  {role}s ({recipientsList.length})
                                </h4>
                                <div className='space-y-1'>
                                  {recipientsList.map((recipient) => (
                                    <label
                                      key={recipient.value}
                                      className='flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer rounded'>
                                      <input
                                        type='checkbox'
                                        checked={selectedRecipients.includes(
                                          recipient.value
                                        )}
                                        onChange={() =>
                                          handleRecipientToggle(recipient.value)
                                        }
                                        className='rounded'
                                      />
                                      <span className='text-sm'>
                                        {recipient.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        })}
                      </>
                    );
                  })()}
                  {Object.keys(filteredRecipients).length === 0 && (
                    <p className='text-gray-500 text-sm'>No recipients found</p>
                  )}
                </div>
                {selectedRecipients.length > 0 && (
                  <div className='mb-3'>
                    <p className='text-sm text-gray-600 mb-1'>
                      Selected ({selectedRecipients.length}):
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {selectedRecipients.map((recipientId) => {
                        const recipient = allRecipients.find(
                          (r) => r.value === recipientId
                        );
                        return recipient ? (
                          <span
                            key={recipientId}
                            className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1'>
                            {recipient.label}
                            <button
                              type='button'
                              onClick={() => handleRecipientToggle(recipientId)}
                              className='text-blue-600 hover:text-blue-800 font-bold text-sm'>
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
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
              {loading
                ? "Sending..."
                : `Send to ${selectedRecipients.length} recipient${
                    selectedRecipients.length !== 1 ? "s" : ""
                  }`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
