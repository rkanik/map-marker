import React from 'react'

const CreateToolElement = tool => (
   React.createElement(() => {
      const classes = [...new Set(
         [tool.id, tool.type, tool.editable ? 'border' : 'btn']
      )].join(' ')
      const rootClasses = [tool.type + '-marker'].join(' ')
      return (
         <div className={rootClasses}>
            {tool.type === 'text' &&
               <div className={classes}>
                  <p>{tool.value === '' ? tool.hint : tool.value}</p>
               </div>
            }
            {tool.role === 'icon' &&
               <div className={`icon ${tool.type}`}>
                  <tool.icon />
               </div>
            }
         </div>
      )
   })
)

export default CreateToolElement