import { useEffect, useRef } from 'react';
import { css } from '@linaria/core';

import { useLatestFunc } from './hooks';
import { createCellEvent, getCellClassname, getCellStyle, onEditorNavigation } from './utils';
import type {
  CellKeyboardEvent,
  CellRendererProps,
  EditCellCommitArgs,
  EditCellKeyDownArgs,
  Maybe,
  Omit,
  RenderEditCellProps
} from './types';

/*
 * To check for outside `mousedown` events, we listen to all `mousedown` events at their birth,
 * i.e. on the window during the capture phase, and at their death, i.e. on the window during the bubble phase.
 *
 * We schedule a check at the birth of the event, cancel the check when the event reaches the "inside" container,
 * and trigger the "outside" callback when the event bubbles back up to the window.
 *
 * The event can be `stopPropagation()`ed halfway through, so they may not always bubble back up to the window,
 * so an alternative check must be used. The check must happen after the event can reach the "inside" container,
 * and not before it run to completion. `requestAnimationFrame` is the best way we know how to achieve this.
 * Usually we want click event handlers from parent components to access the latest commited values,
 * so `mousedown` is used instead of `click`.
 *
 * We must also rely on React's event capturing/bubbling to handle elements rendered in a portal.
 */

const cellEditing = css`
  @layer rdg.EditCell {
    padding: 0;
  }
`;
// const zoomAnimation = css`
// @keyframes zoomIn {
//   from {
//     opacity: 0;
//     transform: scale(0); 
//   }
//   to {
//     opacity: 1;
//     transform: scale(1);
//   }
// }
// `


type SharedCellRendererProps<R, SR> = Pick<CellRendererProps<R, SR>, 'colSpan'>;

interface EditCellProps<R, SR>
  extends Omit<RenderEditCellProps<R, SR>, 'onRowChange' | 'onClose'>,
    SharedCellRendererProps<R, SR> {
  rowIdx: number;
  rowId:string|"id";
  onRowChange: (row: R, commitChanges: boolean, shouldFocusCell: boolean) => void;
  closeEditor: (shouldFocusCell: boolean) => void;
  navigate: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onCellEditCommit?: Maybe<(args: EditCellCommitArgs<R, SR>, event?: React.KeyboardEvent<HTMLDivElement>) => void>;
  onKeyDown: Maybe<(args: EditCellKeyDownArgs<R, SR>, event: CellKeyboardEvent) => void>;
}

export default function EditCell<R, SR>({
  column,
  colSpan,
  row,
  rowId,
  rowIdx,
  onRowChange,
  closeEditor,
  onKeyDown,
  onCellEditCommit,
  navigate
}: EditCellProps<R, SR>) {


  const frameRequestRef = useRef<number | undefined>();
  const commitOnOutsideClick = column.editorOptions?.commitOnOutsideClick !== false;

  // We need to prevent the `useEffect` from cleaning up between re-renders,
  // as `onWindowCaptureMouseDown` might otherwise miss valid mousedown events.
  // To that end we instead access the latest props via useLatestFunc.
  const commitOnOutsideMouseDown = useLatestFunc(() => {
    onClose(true, false);
  });
  useEffect(() => {
    if (!commitOnOutsideClick) return;

    function onWindowCaptureMouseDown() {
      frameRequestRef.current = requestAnimationFrame(commitOnOutsideMouseDown);
    }

    addEventListener('mousedown', onWindowCaptureMouseDown, { capture: true });

    return () => {
      removeEventListener('mousedown', onWindowCaptureMouseDown, { capture: true });
      cancelFrameRequest();
    };
  }, [commitOnOutsideClick, commitOnOutsideMouseDown]);

  function cancelFrameRequest() {
    cancelAnimationFrame(frameRequestRef.current!);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (onKeyDown) {
      const cellEvent = createCellEvent(event);
      onKeyDown(
        {
          mode: 'EDIT',
          row,
          rowId,
          column,
          rowIdx,
          navigate() {
            navigate(event);
          },
          onClose,
          field: '',
          value: '',
          formattedValue: ''
        },
        cellEvent
      );
      if (cellEvent.isGridDefaultPrevented()) return;
    }

    if (event.key === 'Escape') {
      // Discard changes
      onClose();
    } else if (event.key === 'Enter') {
     
      if(onCellEditCommit){
      let cellEditCommitArgs = {
        id:(row as any)[rowId]??"",
        field:column.key,
        value:(row as any)[column.key]??"",
        formattedValue:(row as any)[column.key]??"",
        row,
        column,
        rowIdx}
       
        onCellEditCommit(cellEditCommitArgs,event)
        }
          onClose(true);
    } else if (onEditorNavigation(event)) {
      navigate(event);
    }
  }

  function onClose(commitChanges = false, shouldFocusCell = true) {
    if (commitChanges) {
      if(onCellEditCommit && !shouldFocusCell){
        let cellEditCommitArgs = {
          id:(row as any)[rowId],
          field:column.key,
          value:(row as any)[column.key],
          formattedValue:(row as any)[column.key],
          row,
          column,
          rowIdx}
         
          onCellEditCommit(cellEditCommitArgs)
          }
      onRowChange(row, true, shouldFocusCell);
    } else {
      closeEditor(shouldFocusCell);
    }
  }

  function onEditorRowChange(row: R, commitChangesAndFocus = false) {
    onRowChange(row, commitChangesAndFocus, commitChangesAndFocus);
  }

  const { cellClass } = column;
  const className = getCellClassname(
    column,
    'rdg-editor-container',
    !column.editorOptions?.displayCellContent && cellEditing,
    typeof cellClass === 'function' ? cellClass(row) : cellClass
  );

  return (
    <div
      role="gridcell"
      aria-colindex={column.idx + 1} // aria-colindex is 1-based
      aria-colspan={colSpan}
      aria-selected
      className={className}
      style={{...getCellStyle(column, colSpan),display:"flex",justifyContent:'center',alignItems:'center'}}
      onKeyDown={handleKeyDown}
      onMouseDownCapture={cancelFrameRequest}
    >
      <div style={{
        width:'90%',
        height:'80%',
      }}
      
      >

      {column.renderEditCell != null && (
        <>
          {column.renderEditCell({
            column,
            row,
            onRowChange: onEditorRowChange,
            onClose
          })}
          {column.editorOptions?.displayCellContent &&
            column.renderCell({
              column,
              row,
              rowIdx,
              isCellEditable: true,
              tabIndex: -1,
              onRowChange: onEditorRowChange
            })}
        </>
      )}
      </div>

    </div>
  );
}
