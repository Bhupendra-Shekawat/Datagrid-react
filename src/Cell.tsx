import { memo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { css } from '@linaria/core';

import { useRovingTabIndex } from './hooks';
import {
  createCellEvent,
  getCellClassname,
  getCellStyle,
  getEditCellStyle,
  isCellEditableUtil
} from './utils';
import type { CellRendererProps } from './types';

const cellCopied = css`
  @layer rdg.Cell {
    background-color: #ccccff;
  }
`;

const cellCopiedClassname = `rdg-cell-copied ${cellCopied}`;

const cellDraggedOver = css`
  @layer rdg.Cell {
    background-color: #ccccff;

    &.${cellCopied} {
      background-color: #9999ff;
    }
  }
`;

const cellDraggedOverClassname = `rdg-cell-dragged-over ${cellDraggedOver}`;

function Cell<R, SR>({
  column,
  colSpan,
  isCellSelected,
  isCopied,
  isDraggedOver,
  row,
  rowIdx,
  onClick,
  onDoubleClick,
  onContextMenu,
  onRowChange,
  selectCell,
  isRowSelectable,
  ...props
}: CellRendererProps<R, SR>) {
  const { tabIndex, childTabIndex, onFocus } = useRovingTabIndex(isCellSelected);
  const { cellClass } = column;
  const className = getCellClassname(
    column,
    {
      [cellCopiedClassname]: isCopied,
      [cellDraggedOverClassname]: isDraggedOver
    },
    typeof cellClass === 'function' ? cellClass(row) : cellClass
  );
  const isEditable = isCellEditableUtil(column, row);

  function selectCellWrapper(openEditor?: boolean) {
    selectCell({ rowIdx, idx: column.idx }, openEditor);
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (onClick) {
      const cellEvent = createCellEvent(event);
      onClick({ row, column, selectCell: selectCellWrapper }, cellEvent);
      if (cellEvent.isGridDefaultPrevented()) return;
    }
    selectCellWrapper();
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    if (onContextMenu) {
      const cellEvent = createCellEvent(event);
      onContextMenu({ row, column, selectCell: selectCellWrapper }, cellEvent);
      if (cellEvent.isGridDefaultPrevented()) return;
    }
    selectCellWrapper();
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (onDoubleClick) {
      const cellEvent = createCellEvent(event);
      onDoubleClick({ row, column, selectCell: selectCellWrapper }, cellEvent);
      if (cellEvent.isGridDefaultPrevented()) return;
    }
    selectCellWrapper(true);
  }

  function handleRowChange(newRow: R) {
    onRowChange(column, newRow);
  }

  function getTextWidth(text: string, font: string): number {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      context.font = font;
      // Measure the width of the text
      const metrics = context.measureText(text);
      return metrics.width;
    }
    return 0;
  }

  const [title, setitle] = useState<null | string>(null);

  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    // if (!column.editable && column.tooltip) {
    const element = event.currentTarget;
    const computedStyle = getComputedStyle(element);

    const containerWidth = parseInt(getComputedStyle(element).width.replace('px', ''), 10);
    const font: string = computedStyle.fontFamily ? computedStyle.fontFamily : 'sans-serif';
    const fontSize: string = computedStyle.fontSize ? computedStyle.fontSize : '14';

    const textWidth = getTextWidth(event.currentTarget.innerText, `${fontSize} ${font}`);
    if (textWidth >= containerWidth) {
      setitle(event.currentTarget.innerText);
    }
    //   // Store original styles
    //   const originalStyles = {
    //     width: element.style.width,
    //     zIndex: element.style.zIndex,
    //     boxShadow: element.style.boxShadow,
    //     maxWidth: element.style.maxWidth,
    //     overflow: element.style.overflow,
    //     height: element.style.height
    //   };
    //   // Set new styles
    //   // debugger;
    //   element.style.width = 'max-content';
    //   // element.style.backgroundColor = 'red';
    //   // element.style.height = '3rem';
    //   element.style.maxWidth = '400px';
    //   element.style.zIndex = '100';
    //   element.style.boxShadow = '0px 0px 8px 1px rgba(0,0,0,0.38)';
    //   element.style.overflow = 'auto';
    //   // element.style.backgroundColor = 'red';
    //   // Add mouse leave event listener
    const handleMouseLeave: (event: MouseEvent) => void = (event) => {
      setitle(null);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
    //   // Add mouse leave event listener
    element.addEventListener('mouseleave', handleMouseLeave);
    // }
    // getTextWidth()
    // }
  }

  return (
    <Tooltip sx={{ fontSize: '16px' }} title={title} open={!!title}>
      <div
        role="gridcell"
        aria-colindex={column.idx + 1} // aria-colindex is 1-based
        aria-colspan={colSpan}
        aria-selected={isCellSelected}
        aria-readonly={!isEditable || undefined}
        tabIndex={tabIndex}
        className={className}
        style={{
          ...getCellStyle(column, colSpan),
          ...getEditCellStyle(column, colSpan)
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onFocus={onFocus}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {column.editable && (
          <div
            className="rdg-cell-container"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: ' 0 .5rem',
              width: '90%',
              height: '60%',

              display: 'flex',
              justifyContent: column.align ?? 'start',
              alignItems: 'center',
              border: 'solid 1.5px grey',
              borderRadius: '2px'
            }}
          >
            {column.renderCell({
              column,
              row,
              rowIdx,
              isCellEditable: isEditable,
              tabIndex: childTabIndex,
              onRowChange: handleRowChange,
              isRowSelectable
            })}
          </div>
        )}
        {!column.editable && (
          <>
            {column.renderCell({
              column,
              row,
              rowIdx,
              isCellEditable: isEditable,
              tabIndex: childTabIndex,
              onRowChange: handleRowChange,
              isRowSelectable
            })}
          </>
        )}
      </div>
    </Tooltip>
  );
}

export default memo(Cell) as <R, SR>(props: CellRendererProps<R, SR>) => JSX.Element;
