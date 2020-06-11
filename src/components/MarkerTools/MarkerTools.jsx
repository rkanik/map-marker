import React, { useState } from 'react'
import CreateMarkerElement from "../../mixins/CreateMarkerElement"
import Tools from "../../mixins/MarkerTools"

// Styles
import "./MarkerTools.scss"

// Svg icon components
import { ReactComponent as ArrowRight } from "../../assets/svg/chevron-right-solid.svg"

const MarkerTools = ({ onTool }) => {

   const [tools] = useState(Tools)
   const [toolTypes, setToolTypes] = useState([
      { name: 'Text boxes', type: 'text', editable: true, expanded: true },
      { name: 'Static markers', type: 'text', editable: false, expanded: false },
      { name: 'Arrows', type: 'arrow', expanded: true },
      { name: 'outline boxes', type: 'box', expanded: true },
      { name: 'Water drops', type: 'drop', expanded: true },
   ])
   const [activeTool, setActiveTool] = useState(null)

   // Methods
   const onClickTool = tool => {
      if (activeTool && tool.id === activeTool.id) { return }
      setActiveTool(tool)

      let toolElement = CreateMarkerElement(tool)

      tool.el = toolElement
      onTool(tool)
   }

   const handleExpaned = index => {
      let tts = [...toolTypes]
      tts[index].expanded = !tts[index].expanded
      setToolTypes(tts)
   }

   const toolClasses = id => {
      let isActive = activeTool && activeTool.id === id
      return `tool${isActive ? ' active' : ''}`
   }

   const textBoxClasses = tool => {
      return [...new Set(
         ['text-box', tool.id, tool.editable ? '' : 'btn']
      )].join(' ')
   }

   const getTools = (type, editable) => {
      return typeof editable !== undefined
         ? tools.filter(t => t.type === type && t.editable === editable)
         : tools.filter(t => t.type === type)
   }

   return (
      <div id='MarkerTools'>
         <h5 className='label'>Custom Markers</h5>
         <div className="tools-container">
            {toolTypes.map((tt, tti) => (
               <div key={tti} className={`tools-group ${tt.expanded ? 'expanded' : ''}`}>
                  <div onClick={() => handleExpaned(tti)} className='tools-top d-flex' >
                     <h5 className='tools-label'>{tt.name}</h5>
                     <div className="spacer"></div>
                     <ArrowRight className='icon' />
                  </div>
                  <div className='tools'>
                     <div className={`tools-container d-flex ${tt.type}`}>
                        {getTools(tt.type, tt.editable).map(tool => (
                           <div onClick={() => onClickTool(tool)} key={tool.id} className={toolClasses(tool.id)}>
                              {tool.type === 'text' && <div className={textBoxClasses(tool)}>
                                 <p>{tool.value === '' ? tool.hint : tool.value}</p>
                              </div>}
                              {tool.type !== 'text' && <div className={`icon ${tool.type}`}><tool.icon /></div>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}
export default MarkerTools