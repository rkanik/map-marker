// Imports
import React from 'react'

// Styles
import "./Suggestions.scss"

const Suggestions = ({ items = [], onHover, onItemClick }) => {

   const formatTitle = title => {
      if (title.length <= 32) return title
      return title.substr(0, 32) + '...'
   }

   return (<>
      {items.length > 0 ?
         <div id="Suggestions">
            {items.map((s, i) => (
               <div
                  key={i}
                  className='suggestion'
                  onClick={() => onItemClick(s)}
                  onMouseEnter={() => onHover(s.title)}
                  onMouseLeave={() => onHover('')}
               >
                  <p className='title'>{formatTitle(s.title)}</p>
                  <p className='country'>{s.address.countryName}</p>
               </div>
            ))}
         </div> : null}
   </>)
}

export default Suggestions
