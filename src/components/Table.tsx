import React from "react";

const Table = ({
  columns,
  data,
  renderRow,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
}) => {
  return (
    <table className='w-full mt-4 h-full'>
      <thead>
        <tr className='text-left text-gray-500 text-sm'>
          {columns.map((column) => (
            <th key={column.accessor} className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='text-sm h-full'>
        {data.map((item) => renderRow(item))}
      </tbody>
    </table>
  );
};

export default Table;
