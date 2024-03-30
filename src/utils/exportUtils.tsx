import { cloneElement } from 'react';
import type { ReactElement } from 'react';

import type { ColumnOrColumnGroup, DataGridProps } from '../../src';

export async function exportToCsv<R, SR>(
  gridElement: ReactElement<DataGridProps<R, SR>>,
  fileName: string,
  rows: readonly R[],
  columns: readonly ColumnOrColumnGroup<R, SR>[]
) {
  const { head, body, foot } = await getGridContent(gridElement, rows, columns);

  const content = [...head, ...body, ...foot]
    .map((cells) => {
      return cells?.map(serialiseCellValue).join(',');
    })
    .join('\n');

  downloadFile(fileName, new Blob([content], { type: 'text/csv;charset=utf-8;' }));
}

export async function exportToPdf<R, SR>(
  gridElement: ReactElement<DataGridProps<R, SR>>,
  fileName: string,
  rows: readonly R[],
  columns: readonly ColumnOrColumnGroup<R, SR>[]
) {
  const [{ jsPDF }, autoTable, { head, body, foot }] = await Promise.all([
    import('jspdf'),
    (await import('jspdf-autotable')).default,
    await getGridContent(gridElement, rows, columns)
  ]);

  const doc = new jsPDF({
    orientation: 'l',
    unit: 'px'
  });

  autoTable(doc, {
    head,
    body,
    foot,
    horizontalPageBreak: true,
    styles: { cellPadding: 1.5, fontSize: 8, cellWidth: 'wrap' },
    tableWidth: 'wrap'
  });
  doc.save(fileName);
}

async function getGridContent<R, SR>(
  gridElement: ReactElement<DataGridProps<R, SR>>,
  rows: readonly R[],
  columns: readonly ColumnOrColumnGroup<R, SR>[]
) {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const grid = document.createElement('div');
  grid.innerHTML = renderToStaticMarkup(
    cloneElement(gridElement, {
      enableVirtualization: true
    })
  );

  return {
    head: [createHeaderRow(columns)],
    body: createRows(rows, columns),
    foot: [getRows('.rdg-summary-row')[0]]
  };

  function getRows(selector: string) {
    return Array.from(grid.querySelectorAll<HTMLDivElement>(selector)).map((gridRow) => {
      return Array.from(gridRow.querySelectorAll<HTMLDivElement>('.rdg-cell')).map(
        (gridCell) => gridCell.innerText
      );
    });
  }
  function createRows(rows: readonly R[], columns: readonly ColumnOrColumnGroup<R, SR>[]) {
    let r: Array<any> = [];
    rows.forEach((i: any) => {
      r.push(columns.map((j: any) => i[j.key]));
    });
    return r;
    // return Array.from(grid.querySelectorAll<HTMLDivElement>()).map((gridRow) => {
    //   return Array.from(gridRow.querySelectorAll<HTMLDivElement>('.rdg-cell')).map(
    //     (gridCell) => gridCell.innerText
    //   );
    // });
  }
  function createHeaderRow(columns: readonly ColumnOrColumnGroup<R, SR>[]) {
    return columns.map((j: any) => j.name);

    // return Array.from(grid.querySelectorAll<HTMLDivElement>()).map((gridRow) => {
    //   return Array.from(gridRow.querySelectorAll<HTMLDivElement>('.rdg-cell')).map(
    //     (gridCell) => gridCell.innerText
    //   );
    // });
  }
}

function serialiseCellValue(value: unknown) {
  if (typeof value === 'string') {
    const formattedValue = value.replace(/"/g, '""');
    return formattedValue.includes(',') ? `"${formattedValue}"` : formattedValue;
  }
  return value;
}

function downloadFile(fileName: string, data: Blob) {
  const downloadLink = document.createElement('a');
  downloadLink.download = fileName;
  const url = URL.createObjectURL(data);
  downloadLink.href = url;
  downloadLink.click();
  URL.revokeObjectURL(url);
}
