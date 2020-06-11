// Imports
import React, { useState, useEffect } from 'react'

// Styles
import "./SearchBar.scss"

// Assets
import SearchIcon from "../../assets/svg/search-location-solid.svg"

const SearchBar = ({ value, onInput, onFocus, tempValue }) => {

   const [val, setVal] = useState('')
   const [prevValue, setPrevValue] = useState('')

   // Methods
   const onRendered = () => {
      value && setVal(value)
   }

   const onChangeInput = event => {
      let value = event.target.value
      setVal(value);
      onInput && onInput(value)
   }

   const onKeyUpInput = () => {
      setPrevValue(val)
   }

   // Effects
   useEffect(() => { onRendered() })
   useEffect(() => { setVal(value) }, [value])
   useEffect(() => { setVal(tempValue || prevValue) }, [tempValue, prevValue])

   return (
      <div id='SearchBar'>
         <div className='icon-container'>
            <img src={SearchIcon} className='icon' alt="Location search icon" />
         </div>
         <div className="input-container">
            <input value={val}
               type="text"
               onKeyUp={onKeyUpInput}
               onFocus={onFocus}
               onChange={onChangeInput}
               placeholder='Search a place'
            />
         </div>
      </div>
   )
}

export default SearchBar