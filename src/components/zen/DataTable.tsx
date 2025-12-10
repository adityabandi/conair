'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface DataColumn<T = any> {
  id: string;
  header?: ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => ReactNode;
}

export interface DataTableProps<T = any> extends HTMLAttributes<HTMLTableElement> {
  data?: T[];
  columns: DataColumn<T>[];
  onRowClick?: (row: T, index: number) => void;
}

export const DataTable = forwardRef<HTMLTableElement, DataTableProps>(
  ({ data = [], columns, onRowClick, className, ...props }, ref) => {
    const getValue = (row: any, column: DataColumn) => {
      if (column.render) {
        const rawValue = typeof column.accessor === 'function' 
          ? column.accessor(row) 
          : row[column.accessor as string];
        return column.render(rawValue, row);
      }
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      return row[column.accessor as string];
    };

    return (
      <div className={styles.wrapper}>
        <table ref={ref} className={`${styles.table} ${className || ''}`} {...props}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.id} 
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => onRowClick?.(row, index)}
                className={onRowClick ? styles.clickable : ''}
              >
                {columns.map((col) => (
                  <td key={col.id} style={{ textAlign: col.align }}>
                    {getValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
