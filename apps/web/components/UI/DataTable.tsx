import React from "react";
import { cn } from "@/lib/utils";

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLTableElement> {
  columns: {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
    align?: "left" | "center" | "right";
  }[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}

function DataTable<T>({ 
  columns, 
  data, 
  onRowClick,
  emptyState,
  className,
  ...props 
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse", className)} {...props}>
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((column, idx) => (
              <th 
                key={idx}
                className={cn(
                  "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-text-secondary font-display",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "group transition-ui hover:bg-white/[0.03]",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((column, colIdx) => (
                <td 
                  key={colIdx}
                  className={cn(
                    "px-4 py-4 text-sm text-text-primary font-sans",
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className
                  )}
                >
                  {typeof column.accessor === "function" 
                    ? column.accessor(row) 
                    : (row[column.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
