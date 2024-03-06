import { memo } from 'react';
import { css } from '@linaria/core';

import { useRovingTabIndex } from './hooks';
import { createCellEvent, getCellClassname, getCellStyle, isCellEditableUtil } from './utils';
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
  function handleMouseEnter(event: React.MouseEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const containerWidth = parseInt(getComputedStyle(element).width.replace('px', ''), 10);
    const textElementWidth = parseInt(getComputedStyle(element.children[0]).width.replace('px', ''), 10) || containerWidth;
    console.log(containerWidth,textElementWidth)
    if (textElementWidth > containerWidth) {
      // Store original styles
      const originalStyles = {
        width: element.style.width,
        zIndex: element.style.zIndex,
        boxShadow: element.style.boxShadow
      };
  
      // Set new styles
      element.style.width = "max-content";
      element.style.zIndex = "100";
      element.style.boxShadow= "0px 0px 8px 1px rgba(0,0,0,0.38)";
  
      // Add mouse leave event listener
      const handleMouseLeave : (event: MouseEvent) => void  = (event) => {
        // Restore original styles
        element.style.width = originalStyles.width;
        element.style.zIndex = originalStyles.zIndex;
        element.style.boxShadow = originalStyles.boxShadow;
  
        // Remove event listener
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
      
      // Add mouse leave event listener
      element.addEventListener('mouseleave', handleMouseLeave);
    }
  }
  


  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-colspan={colSpan}
      aria-selected={isCellSelected}
      aria-readonly={!isEditable || undefined}
      tabIndex={tabIndex}
      className={className}
      style={getCellStyle(column, colSpan)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onFocus={onFocus}
      onMouseEnter={handleMouseEnter}

      
      

      {...props}
    >
      
    
      <div style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
      }}>

      {column.renderCell({
        column,
        row,
        rowIdx,
        isCellEditable: isEditable,
        tabIndex: childTabIndex,
        onRowChange: handleRowChange
      })}
   
   </div>

    </div>
  );
}

export default memo(Cell) as <R, SR>(props: CellRendererProps<R, SR>) => JSX.Element;
