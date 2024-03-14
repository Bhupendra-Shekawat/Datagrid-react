import { css } from '@linaria/core';

import type { RenderEditCellProps } from '../types';

const textEditorInternalClassname = css`
  @layer rdg.TextEditor {
    appearance: none;

    box-sizing: border-box;
    inline-size: 100%;
    block-size: 100%;
    padding-block: 0;
    padding-inline: 6px;
    border: 2px solid #ccc;
    vertical-align: top;
    color: var(--rdg-color);
    background-color: var(--rdg-background-color);

    font-family: inherit;
    font-size: var(--rdg-font-size);

    &:focus {
      border-color: var(--rdg-selection-color);
      outline: none;
    }

    &::placeholder {
      color: #999;
      opacity: 1;
    }
  }
`;

export const textEditorClassname = `rdg-text-editor ${textEditorInternalClassname}`;

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export default function textEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose
}: RenderEditCellProps<TRow, TSummaryRow>) {
    
  if(column.editable  && !column.renderCell){
    switch(column.type){
      case 'select':
        return (
           
            <select
              className={textEditorClassname}
              value={row[column.key as keyof TRow] as unknown as string}
              onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value },true)}
              autoFocus

            >
              <option  value={""}>
                  {`Select ${column.name}`}
                </option>
              {column.options?.map((title) => (
                <option key={(title as string)} value={(title as string)}>
                  {title}
                </option>
              ))}
            </select>
          
        
        );

      default:
        return (
          <input
            className={textEditorClassname}
            style={{
              border:"2px solid grey",
              padding:'.5rem',
              backgroundColor:'hsl(207deg 27.27% 79.63%)',
              borderRadius:'4px'
            }}
            ref={autoFocusAndSelect}
            value={row[column.key as keyof TRow] as unknown as string}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            onBlur={() => onClose(true, false)}
            type={column.type}
          />
        );
    }

  }else{
    return (
      <input
        className={textEditorClassname}
        style={{
          border:"2px solid grey",
          padding:'.5rem',
          backgroundColor:'hsl(207deg 27.27% 79.63%)',
          borderRadius:'4px'
        }}
        ref={autoFocusAndSelect}
        value={row[column.key as keyof TRow] as unknown as string}
        onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
        onBlur={() => onClose(true, false)}
        type={column.type}
      />
    );
  }
 
}
