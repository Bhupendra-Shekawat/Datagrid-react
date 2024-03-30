import { ReactElement, useState } from 'react';
import { css } from '@linaria/core';

import DataGrid, { SelectColumn } from '../../src';
import type { Column } from '../../src';
import type { Props } from './types';

const gridClassname = css`
  block-size: 300px;
`;

function EmptyRowsRenderer(): ReactElement {
  return (
    <div
      style={{
        textAlign: 'center',
        gridColumn: '1/-1',
        minHeight: '10rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <p>No Records Found</p>
    </div>
  );
}

interface Row {
  id: number;
  title: string;
  count: number;
}

const columns: readonly Column<Row>[] = [
  SelectColumn,
  { key: 'id', name: 'ID' },
  { key: 'title', name: 'Title' },
  { key: 'count', name: 'Count' },
  { key: 'count1', name: 'Count' },
  { key: 'count2', name: 'Count' },
  { key: 'count3', name: 'Count' },
  { key: 'count4', name: 'Count' },
  { key: 'count4', name: 'Count', width: '1fr' },
  { key: 'count4', name: 'Count' },
  { key: 'count4', name: 'Count', width: '1fr' },
  { key: 'count4', name: 'Count', width: '1fr' },
  { key: 'count4', name: 'Count', width: '1fr' }
];

const rows: readonly Row[] = [];

function rowKeyGetter(row: Row) {
  return row.id;
}

export default function NoRows({ direction }: Props) {
  const [selectedRows, onSelectedRowsChange] = useState((): ReadonlySet<number> => new Set());

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      defaultColumnOptions={{
        sortable: true,
        resizable: true
      }}
      renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
      selectedRows={selectedRows}
      onSelectedRowsChange={onSelectedRowsChange}
      rowKeyGetter={rowKeyGetter}
      className={gridClassname}
      direction={direction}
    />
  );
}
