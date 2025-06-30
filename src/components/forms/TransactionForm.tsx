"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  startTransition,
} from "react";
import { createTransaction, updateTransaction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  transactionSchema,
  TransactionSchema,
} from "@/lib/formValidationSchema";

export default function TransactionForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
  });

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const result = await (type === "create"
      ? createTransaction({ success: false, error: false }, data as any)
      : updateTransaction({ success: false, error: false }, data));
    setLoading(false);

    if (result.success) {
      toast(`Transaction ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  });

  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-8'>
      <h2 className='text-lg font-semibold'>Add Transaction</h2>

      <div className='flex flex-col gap-2'>
        <label>Type</label>
        <select
          {...register("type")}
          className='border rounded p-2'
          defaultValue={data?.type}>
          <option value='income'>Income</option>
          <option value='expense'>Expense</option>
        </select>
      </div>
      {errors.type && (
        <p className='text-red-500 text-sm'>{errors.type.message}</p>
      )}
      <div className='flex flex-col gap-2'>
        <label>Amount</label>
        <input
          defaultValue={data?.amount}
          type='number'
          step='0.01'
          {...register("amount", { valueAsNumber: true })}
          className='border rounded p-2'
        />
        {errors.amount && (
          <p className='text-red-500 text-sm'>{errors.amount.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <label>Description</label>
        <input
          defaultValue={data?.description}
          type='text'
          {...register("description")}
          className='border rounded p-2'
        />
        {errors.description && (
          <p className='text-red-500 text-sm'>{errors.description.message}</p>
        )}
      </div>
      <div className='flex flex-col gap-2'>
        <label>Date</label>
        <input
          type='date'
          {...register("date")}
          className='border rounded p-2'
          defaultValue={data?.date.toISOString().split("T")[0]}
        />
        {errors.date && (
          <p className='text-red-500 text-sm'>{errors.date.message}</p>
        )}
      </div>
      {data && (
        <input
          type='hidden'
          defaultValue={data.id as string}
          {...register("id")}
          name='id'
        />
      )}

      <button
        className='bg-blue-400 text-white p-2 rounded-md flex justify-center items-center gap-2 disabled:opacity-60'
        type='submit'
        disabled={loading}>
        {loading ? (
          <>
            <svg
              className='animate-spin h-5 w-5 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
            {type === "create" ? "Creating" : "Updating"}
          </>
        ) : type === "create" ? (
          "Create"
        ) : (
          "Update"
        )}
      </button>
    </form>
  );
}
