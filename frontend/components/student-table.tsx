'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

type StudentRow = {
  id: string;
  name: string;
  level: string;
  prediction: string;
  score: string;
  status: string;
};

const data: StudentRow[] = [
  { id: 'S-1001', name: 'Chinelo Emeka', level: '400', prediction: 'High', score: '82%', status: 'At risk' },
  { id: 'S-1002', name: 'Kofi Mensah', level: '300', prediction: 'Medium', score: '67%', status: 'Monitor' },
  { id: 'S-1003', name: 'Emma Johnson', level: '200', prediction: 'Low', score: '92%', status: 'Stable' },
  { id: 'S-1004', name: 'Ada Okechukwu', level: '500', prediction: 'High', score: '78%', status: 'At risk' }
];

const columns: ColumnDef<StudentRow>[] = [
  { accessorKey: 'id', header: () => 'Student ID' },
  { accessorKey: 'name', header: () => 'Name' },
  { accessorKey: 'level', header: () => 'Level' },
  { accessorKey: 'prediction', header: () => 'Prediction' },
  { accessorKey: 'score', header: () => 'Risk Score' },
  { accessorKey: 'status', header: () => 'Status' }
];

export function StudentTable() {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80">
      <table className="w-full border-collapse">
        <thead className="bg-slate-900/90 text-left text-sm uppercase tracking-[0.3em] text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-4">
                  {header.isPlaceholder ? null : (
                    <button className="flex items-center gap-2 text-slate-300" onClick={() => header.column.toggleSorting?.()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-800 hover:bg-slate-900/70">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm text-slate-200">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
