// Import
import React from 'react'

// Styles
import "./CaptureMap.scss"

// Icons
import { ReactComponent as CameraIcon } from "../../assets/svg/camera-solid.svg"

const CaptureMap = ({ onClick }) => {
   return (
      <div id='CaptureMap' onClick={onClick}>
         <CameraIcon className='icon' />
      </div>
   )
}

export default CaptureMap