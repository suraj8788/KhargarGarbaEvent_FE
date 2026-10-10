import type { Key, ReactNode } from 'react'

export type TableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: TableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => Key
  emptyMessage?: string
}

export default function DataTable<T>({ columns, rows, getRowKey, emptyMessage = 'No records found.' }: DataTableProps<T>) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key} scope="col">{column.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
            </tr>
          ))}
          {rows.length === 0 && <tr><td className="table-empty" colSpan={columns.length}>{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
