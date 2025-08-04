"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchema";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Initialize state with proper default values for update mode
  const [selectedClasses, setSelectedClasses] = useState<number[]>(() => {
    if (type === "update" && data?.classes) {
      return data.classes.map((c: any) => parseInt(c.id));
    }
    return [];
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      classIds: type === "update" && data?.classes 
        ? data.classes.map((c: any) => parseInt(c.id))
        : []
    }
  });

  const [loading, setLoading] = useState(false);

  // Update selectedClasses when data changes (for update mode)
  useEffect(() => {
    if (type === "update" && data?.classes) {
      const classIds = data.classes.map((c: any) => parseInt(c.id));
      setSelectedClasses(classIds);
      setValue("classIds", classIds);
    }
  }, [type, data?.classes, setValue]);

  const allSelected = selectedClasses.length === relatedData?.classes?.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(relatedData?.classes?.map((c: any) => c.id) || []);
    }
  };

  const [state, formAction] = React.useActionState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  // Sync the selectedClasses state with the form's hidden input field.
  useEffect(() => {
    setValue("classIds", selectedClasses);
  }, [selectedClasses, setValue]);

  const handleFormSubmit = async (formData: AnnouncementSchema) => {
    setLoading(true);
    try {
      const action = type === "create" ? createAnnouncement : updateAnnouncement;
      await formAction(formData);
      toast.success(`Announcement ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      setLoading(false);
    } catch (error) {
      toast.error(`Failed to ${type === "create" ? "create" : "update"} announcement.`);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <InputField
        label="Title"
        name="title"
        type="text"
        placeholder="Enter announcement title"
        register={register}
        errors={errors}
      />
      <InputField
        label="Description"
        name="description"
        type="text"
        placeholder="Enter announcement description"
        register={register}
        errors={errors}
      />
      <InputField
        label="Date"
        name="date"
        type="date"
        register={register}
        errors={errors}
      />
      <InputField
        label="Time"
        name="time"
        type="time"
        register={register}
        errors={errors}
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="selectAll"
          checked={allSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="selectAll" className="text-sm text-gray-700">
          Select All
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {relatedData?.classes?.map((classItem: any) => (
          <div key={classItem.id} className="flex items-center">
            <input
              type="checkbox"
              id={`class-${classItem.id}`}
              checked={selectedClasses.includes(parseInt(classItem.id))}
              onChange={() => {
                setSelectedClasses((prev) =>
                  prev.includes(parseInt(classItem.id))
                    ? prev.filter((id) => id !== parseInt(classItem.id))
                    : [...prev, parseInt(classItem.id)]
                );
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`class-${classItem.id}`} className="ml-2 text-sm text-gray-700">
              {classItem.name}
            </label>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Saving..." : `Save ${type === "create" ? "Announcement" : "Update Announcement"}`}
      </button>
    </form>
  );
};

export default AnnouncementForm;