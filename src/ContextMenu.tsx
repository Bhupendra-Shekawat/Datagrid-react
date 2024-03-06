import { css } from '@linaria/core'
import React from 'react'

let customContextMenu = css`
.context-menu {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    padding: 5px 0;
  }
  .context-menu-item {
    padding: 5px 20px;
    cursor: pointer;
  }
  .context-menu-item:hover {
    background-color: #ddd;
  }
`
const ContextMenu = () => {
  return (
    <div id="customContextMenu" className={customContextMenu}>
    <div className="context-menu-item">Option 1</div>
    <div className="context-menu-item">Option 2</div>
    <div className="context-menu-item">Option 3</div>
  </div>
  )
}

export default ContextMenu