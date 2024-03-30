import { useCallback, useMemo, useState } from 'react';

import DataGrid from '../../src';
import type { Column, SortColumn } from '../../src';
import type { Props } from './types';

interface Row {
  readonly id: number;
  readonly task: string;
  readonly complete: number;
  readonly priority: string;
  readonly issueType: string;
}

function createRows(): Row[] {
  const rows: Row[] = [];

  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ['Critical', 'High', 'Medium', 'Low'][Math.round(Math.random() * 3)],
      issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.round(Math.random() * 3)]
    });
  }

  return rows;
}

export default function ColumnsReordering({ direction }: Props) {
  const [columns, setColumns] = useState([
    {
      key: 'id',
      name: 'ID',
      width: 80
    },
    {
      key: 'task',
      name: 'Title',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'priority',
      name: 'Priority',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'issueType',
      name: 'Issue Type',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'complete',
      name: '% Complete',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'complete',
      name: '% Complete',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'complete',
      name: '% Complete',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'complete',
      name: '% Complete',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    },
    {
      key: 'complete',
      name: '% Complete',
      resizable: true,
      sortable: true,
      draggable: true,
      width: '500px'
    }
  ]);
  const [rows] = useState(createRows);
  const [columnsOrder, setColumnsOrder] = useState((): readonly number[] =>
    columns.map((_, index) => index)
  );
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const onSortColumnsChange = useCallback((sortColumns: SortColumn[]) => {
    setSortColumns(sortColumns.slice(-1));
  }, []);

  const reorderedColumns = useMemo(() => {
    return columnsOrder.map((index) => columns[index]);
  }, [columnsOrder]);

  const sortedRows = useMemo((): readonly Row[] => {
    if (sortColumns.length === 0) return rows;
    const { columnKey, direction } = sortColumns[0];

    let sortedRows: Row[] = [...rows];

    switch (columnKey) {
      case 'task':
      case 'priority':
      case 'issueType':
        sortedRows = sortedRows.sort((a, b) => a[columnKey].localeCompare(b[columnKey]));
        break;
      case 'complete':
        sortedRows = sortedRows.sort((a, b) => a[columnKey] - b[columnKey]);
        break;
      default:
    }
    return direction === 'DESC' ? sortedRows.reverse() : sortedRows;
  }, [rows, sortColumns]);

  let onHeaderAction: (idx: number | string, ref: string) => void = (idx, ref) => {
    let newData = [];
    reorderedColumns.forEach((i, index) => {
      if (index == idx) {
        // debugger;

        newData.push({
          ...i,
          frozen: i.frozen ? !i.frozen : true
        });
        return;
      }
      newData.push(i);
    });
    setColumns(newData);
    setColumnsOrder((prev) => [...prev]);
  };
  return (
    <DataGrid
      columns={reorderedColumns}
      rows={sortedRows}
      features={{ frozenOnHeaderClick: true }}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
      direction={direction}
      defaultColumnOptions={{ width: '1fr' }}
      // onColumnsReorder={onColumnsReorder}
      onHeaderAction={onHeaderAction}
    />
  );
}
