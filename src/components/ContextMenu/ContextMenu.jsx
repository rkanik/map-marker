// Imports
import React from 'react'

// Styles
import "./ContextMenu.scss"

// Svg icon as component
import { ReactComponent as EditIcon } from "../../assets/svg/paint-brush-solid.svg"
import { ReactComponent as DeleteIcon } from "../../assets/svg/trash-solid.svg"
import { ReactComponent as PlusIcon } from "../../assets/svg/plus-solid.svg"
import { ReactComponent as MinusIcon } from "../../assets/svg/minus-solid.svg"
import { ReactComponent as RotateClockIcon } from "../../assets/svg/undo-solid.svg"
import { ReactComponent as RotateAntiClockIcon } from "../../assets/svg/redo-alt-solid.svg"
import { ReactComponent as FlipVerticalIcon } from "../../assets/svg/flip-vertical.svg"
import { ReactComponent as FlipHorizontalIcon } from "../../assets/svg/flip-horizontal.svg"
import { ReactComponent as PaletteIcon } from "../../assets/svg/palette-solid.svg"
import { ReactComponent as DoneIcon } from "../../assets/svg/check-solid.svg"

// Component
const ContextMenu = ({ show, position: { top, left }, onClick }) => {
   return (<>
      {show &&
         <div id='ContextMenu' style={{ top: top - 32 + 'px', left: left + 'px' }}>
            <div className="d-flex">
               <button onClick={() => onClick('done')} className='btn done'><DoneIcon className='icon' /></button>
               <button onClick={() => onClick('edit')} className='btn edit'><EditIcon className='icon' /></button>
               <button onClick={() => onClick('color')} className='btn color'><PaletteIcon className='icon' /></button>
               <button onClick={() => onClick('plus')} className='btn plus'><PlusIcon className='icon' /></button>
               <button onClick={() => onClick('minus')} className='btn minus'><MinusIcon className='icon' /></button>
               <button onClick={() => onClick('rotate')} className='btn rotate'><RotateClockIcon className='icon' /></button>
               <button onClick={() => onClick('rotate-anti')} className='btn rotate-anti'><RotateAntiClockIcon className='icon' /></button>
               <button onClick={() => onClick('flip-vertical')} className='btn flip-vertical'><FlipVerticalIcon className='icon' /></button>
               <button onClick={() => onClick('flip-horizontal')} className='btn flip-horizontal'><FlipHorizontalIcon className='icon' /></button>
               <button onClick={() => onClick('delete')} className='btn delete'><DeleteIcon className='icon' /></button>
            </div>
         </div>
      }
   </>)
}

// Default export
export default ContextMenu
