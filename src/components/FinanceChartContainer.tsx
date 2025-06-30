import FinanceChart from "@/components/FinanceChart";
import prisma from "@/lib/prisma";

function groupTransactionsByMonth(transactions: any[]) {
  const result: { [key: string]: { income: number; expense: number } } = {};

  for (const tx of transactions) {
    const month = new Date(tx.date).toLocaleString("en-US", { month: "short" });

    if (!result[month]) result[month] = { income: 0, expense: 0 };
    if (tx.type === "income") result[month].income += tx.amount;
    else result[month].expense += tx.amount;
  }

  const orderedMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return orderedMonths.map((month) => ({
    name: month,
    income: result[month]?.income || 0,
    expense: result[month]?.expense || 0,
  }));
}

export default async function FinanceChartContainer() {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1),
        lte: new Date(),
      },
    },
    select: {
      amount: true,
      date: true,
      type: true,
    },
  });

  const chartData = groupTransactionsByMonth(transactions);

  return (
    <div className='bg-white rounded-lg'>
      <FinanceChart data={chartData} />
    </div>
  );
}
