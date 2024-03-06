import { useState } from 'react';
import { faker } from '@faker-js/faker';
import { css } from '@linaria/core';

import DataGrid from '../../src';
import type { Column } from '../../src';
import type { Props } from './types';



interface Row {
  id: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
}

function rowKeyGetter(row: Row) {
  return row.id;
}

const columns: readonly Column<Row>[] = [
  {
    key: 'id',
    name: 'ID'
  },
  {
    key: 'title',
    name: 'Title'
  },
  {
    key: 'firstName',
    name: 'First Name'
  },
  {
    key: 'lastName',
    name: 'Last Name'
  },
  {
    key: 'email',
    name: 'Email'
  }
];

function createFakeRowObjectData(index: number): Row {
  return {
    id: `id_${index}`,
    email: faker.internet.email(),
    title: faker.person.prefix(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName()
  };
}

function createRows(numberOfRows: number): Row[] {
  const rows: Row[] = [];

  for (let i = 0; i < numberOfRows; i++) {
    rows[i] = createFakeRowObjectData(i);
  }

  return rows;
}

function isAtBottom({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean {
  return currentTarget.scrollTop + 10 >= currentTarget.scrollHeight - currentTarget.clientHeight;
}

function loadMoreRows(newRowsCount: number, length: number): Promise<Row[]> {
  return new Promise((resolve) => {
    const newRows: Row[] = [];

    for (let i = 0; i < newRowsCount; i++) {
      newRows[i] = createFakeRowObjectData(i + length);
    }

    setTimeout(() => resolve(newRows), 1000);
  });
}

export default function InfiniteScrolling({ direction }: Props) {
  const [rows, setRows] = useState(() => createRows(50));
  // const [isLoading, setIsLoading] = useState(false);

  async function handleScroll(event: React.UIEvent<HTMLDivElement>,setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) {
    // if (isLoading || !isAtBottom(event)) return;

    setIsLoading(true);

    const newRows = await loadMoreRows(50, rows.length);

    setRows([...rows, ...newRows]);
    setIsLoading(false);
  }

  return (
    <>
      <DataGrid
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={setRows}
        rowHeight={30}
        // onScroll={}
        onScrollBottom={handleScroll}
        className="fill-grid"
        direction={direction}
        infiniteScroll={true}
      />
    </>
  );
}
