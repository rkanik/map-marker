// Imports
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { nanoid } from 'nanoid'
import { delay } from "../helpers/helpers"
import Tools from "../mixins/MarkerTools"
import CreateMarkerElement from "../mixins/CreateMarkerElement"

// Styles
import './App.scss';

// Components
import Map from "../components/Map/Map"
import Sidebar from "../components/Sidebar/Sidebar"
import MapView from "../components/MapView/MapView"
import MarkerTools from "../components/MarkerTools/MarkerTools"
import SearchBar from "../components/SearchBar/SearchBar"
import Suggestions from "../components/Suggestions/Suggestions"
import ContextMenu from "../components/ContextMenu/ContextMenu"
//import CaptureMap from "../components/CaptureMap/CaptureMap"
import { TwitterPicker as ColorPicker } from 'react-color';

// Constants
const H = window.H
const BASE_URL = 'https://autosuggest.search.hereapi.com/v1'
const LOCATION_OF_AUS = { lat: -35.30654, lng: 149.12655 }

class App extends React.Component {

   constructor(props) {
      super(props)
      this.state = {
         // Nulls
         map: null,
         mapBehavior: null,
         activeMarkerTool: null,
         activeMapMarker: null,
         tempSearchValue: null,
         // Arrays
         suggestions: [],
         mapMarkers: [],
         // Booleans
         contextMenu: false,
         colorPicker: false,
         // Objects
         contextMenuPosition: { top: 0, left: 0 },
         colorPickerPosition: { top: 0, left: 0 },
         // Strings
         apiKey: 'jhLIKSLTfgsyBN0EfQlTpU5xo21unt5BYoHrb6YOAq4'
      }
   }
   setActiveMapMarker = (el, marker) => {
      let { top, left } = el.getBoundingClientRect()
      this._setState({
         contextMenu: true,
         contextMenuPosition: { top, left },
         activeMapMarker: { marker, el }
      })
   }
   fixTransforms(el, transform) {
      Object.keys(transform).forEach(property => {
         let value = property === 'rotate' ? transform[property] + 'deg' : transform[property]
         this.setTransform(el, property, value)
      })
   }
   onAttachedMapMarker = (el, _, marker) => {
      let mapMarker = this.getMapMarker(el.id)
      if (!mapMarker) return

      ReactDOM.render(mapMarker.tool.el, el)

      // Set active marker and context menu
      // It will call first time and when a marker is clicked
      this.setActiveMapMarker(el, marker)
      el.addEventListener('click', () =>
         this.setActiveMapMarker(el, marker))

      let { type, value } = mapMarker.tool
      if (type === 'text' && value !== '') {
         let p = el.querySelector('div.text p')
         p.innerText = value
      }

      this.fixTransforms(el.firstElementChild, mapMarker.transform)
      mapMarker.color && this.setMapMarkerColor(el, mapMarker.tool, mapMarker.color)
   }
   getMapMarker = id => {
      return this.state.mapMarkers.find(m => m.id === id)
   }
   onFinishEditMapMarker = () => {

      // Returning if in case map marker is null
      if (!this.state.activeMapMarker) { return }

      // Getting the marker element
      let el = this.state.activeMapMarker.el

      // Getting the selected map marker
      let mapMarker = this.getMapMarker(el.id)

      // Returning if already done editing
      if (!mapMarker.editing) { return }

      // Selecting child elements
      let container = el.querySelector('div.text')
      let input = container.querySelector('input')
      let p = document.createElement('p')

      // Setting paragraph text
      if (input.value === '') p.innerText = mapMarker.tool.hint
      else { p.innerText = input.value }

      // Saving input value and done editing
      mapMarker.tool.value = input.value
      mapMarker.editing = false

      // Replacing map marker
      let mapMarkers = this.state.mapMarkers.map(
         m => m.id === el.id ? mapMarker : m
      )

      // Updating map markers
      this._setState({ mapMarkers })

      // Removing input and adding p element
      container.removeChild(input)
      container.appendChild(p)
   }
   setEditableTextBox = (el, { hint, value }) => {
      let container = el.querySelector('div.text')

      let p = container.firstElementChild
      container.removeChild(p)

      let input = document.createElement('input')
      input.type = 'text'
      input.placeholder = hint
      if (value !== '') input.value = value

      container.appendChild(input)

      input.focus()

      input.addEventListener('keyup', ev => {
         if (ev.key === 'Enter') this.onFinishEditMapMarker()
      })
      input.addEventListener('focusout', this.onFinishEditMapMarker)
   }
   onMountedMapMarker = async (el, marker, position, TOOL, ONMOUNT) => {

      // Copying marker tool
      let tool = TOOL || { ...this.state.activeMarkerTool }

      // Rendering the inner element of marker
      ReactDOM.render(tool.el, el)

      // Set active marker and context menu
      // It will call first time and when a marker is clicked
      !ONMOUNT && this.setActiveMapMarker(el, marker)
      el.addEventListener('click', () =>
         this.setActiveMapMarker(el, marker))

      if (ONMOUNT) return
      // Pushing new Map marker to state
      let mapMarkers = [...this.state.mapMarkers]
      let mapMarker = {
         id: el.id, tool, position,
         transform: { scale: 1, rotate: 0, scaleX: 1, scaleY: 1 },
         color: { hex: null, rgb: null }
      }

      if (tool.type === 'text' && tool.editable) {
         mapMarker.editing = true
         this.setEditableTextBox(el, tool)
      }

      mapMarkers.push(mapMarker)
      this._setState({ mapMarkers })

   }
   createCustomMarker = async (position, ID, TOOL, ONMOUNT) => {

      // Creating a div element
      let div = document.createElement('div')
      div.id = ID || nanoid(4)
      div.classList.add('map-marker')

      // Create dom icon and attach listener
      let domIcon = new H.map.DomIcon(div, {
         // the function is called every time marker enters the viewport
         onAttach: this.onAttachedMapMarker
      });

      // Creating moveable marker
      let marker = new H.map.DomMarker(position, {
         icon: domIcon, volatility: true
      });
      marker.draggable = true

      // Adding marker to map
      this.state.map.addObject(marker)

      // Looking for marker rendered to DOM
      let interval = setInterval(() => {
         let el = document.getElementById(div.id)
         if (el) {
            // Clearing interval if marker is found
            clearInterval(interval)
            // Calling on marker mounted function
            this.onMountedMapMarker(el, marker, position, TOOL, ONMOUNT)
         }
      }, 100);
   }
   getLocation = () => new Promise(resolve => {
      const onPosition = pos => {
         resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      }
      const onError = err => { resolve({ error: true, reason: err }) }
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(onPosition, onError)
      }
      else { return resolve({ error: true, reason: 'Geo location not supported!' }) }
   })
   onClickMap = event => {

      //console.log(event);

      if (!this.state.activeMarkerTool) return

      // Calculate clicked position
      let pointer = event.currentPointer
      let clickedPosition = this.state.map.screenToGeo(pointer.viewportX, pointer.viewportY)

      delay(400).then(() => {
         (!this.state.activeMapMarker && this.state.activeMarkerTool)
            && this.createCustomMarker(clickedPosition)
      })
   }
   onDragStart = ev => {
      let target = ev.target
      let draggable = target instanceof H.map.Marker || target instanceof H.map.DomMarker
      if (draggable) {
         let { viewportX, viewportY } = ev.currentPointer;
         let pos = this.state.map.geoToScreen(target.getGeometry());
         target['offset'] = new H.math.Point(viewportX - pos.x, viewportY - pos.y);
         this.state.mapBehavior.disable();
      }
   }
   onDragEnd = ev => {
      let draggable = ev.target instanceof H.map.Marker || ev.target instanceof H.map.DomMarker

      if (!draggable) return

      this.state.mapBehavior.enable();

      if (!this.state.activeMapMarker) return
      //let el = this.state.activeMapMarker.el
      //let marker = this.state.mapMarkers.find(m => m.id === el.id)
      //el.firstElementChild.style.transform = ''
      //this.setTransform(el, marker.scale)
   }
   onDrag = ev => {

      let target = ev.target
      let draggable = target instanceof H.map.Marker || target instanceof H.map.DomMarker
      if (!draggable) {
         this.setState(state => ({
            ...state, contextMenu: false,
            activeMapMarker: null, colorPicker: false
         }))
         return
      }

      let { viewportX, viewportY } = ev.currentPointer;
      let position = this.state.map.screenToGeo(viewportX - target['offset'].x, viewportY - target['offset'].y)
      target.setGeometry(position);

      if (!this.state.activeMapMarker) return

      let el = this.state.activeMapMarker.el
      let marker = this.state.mapMarkers.find(m => m.id === el.id)
      let flip = marker.flip === 'vertical' ? 'scaleY(-1)' : marker.flip === 'horizontal' ? 'scaleX(-1)' : null
      el.firstElementChild.style.transform = `scale(${marker.scale}) rotate(${marker.rotate}deg) ${flip ? flip : ''}`

      let { top, left } = this.state.activeMapMarker.el.getBoundingClientRect()
      this._setState({ contextMenuPosition: { top, left } })

      if (this.state.colorPicker) {
         let { top, left } = document.getElementById('ContextMenu').getBoundingClientRect()
         this._setState({ colorPickerPosition: { top, left } })
      }

   }
   fetchSuggestions = async keyword => {
      // Returning if no suggestions
      if (!keyword) { return [] }

      // Organising fetch url
      let query = `?at=0,0&q=${keyword}&limit=5&apiKey=${this.state.apiKey}`
      let endpoint = '/autosuggest' + query

      // Fetching suggestions
      let suggestion = (await axios.get(BASE_URL + endpoint)).data

      // Filtering places from suggestion
      let places = suggestion.items.filter(s => s.position)

      // returning suggestions
      return places
   }
   onChangeSearchInput = async value => {

      let suggestionsElement = document.getElementById('Suggestions')
      suggestionsElement && suggestionsElement.classList.add('show')

      // Fetching suggestions
      let suggestions = await this.fetchSuggestions(value)

      // Saving suggestions
      //setSuggestions(suggestions)
      this.setState(state => ({ ...state, suggestions }))
   }
   onFocusSearchInput = () => {
      let suggestionsElement = document.getElementById('Suggestions')
      suggestionsElement && suggestionsElement.classList.add('show')
   }
   onHoverSuggestionsItem = value => {
      this.setState(state => ({ ...state, tempSearchValue: value }))
   }
   onClickSuggestion = suggestion => {
      this.state.map.setCenter(suggestion.position)
      this.state.map.setZoom(12)
      //setSuggestions([])
      this.setState(state => ({ ...state, suggestions: [] }))
   }
   isOutSide = ({ pageX, pageY }, { top, left, right, bottom }) => {
      return (pageX < left || pageY < top || pageX > right || pageY > bottom)
   }
   handleSuggestionsHideAndShow = event => {

      let suggestionsElement = document.getElementById('Suggestions')
      if (!suggestionsElement) return

      let searchBarEl = document.getElementById('SearchBar')

      let suggestionstRect = suggestionsElement.getBoundingClientRect()
      let searchBarRect = searchBarEl.getBoundingClientRect()

      let isOutSide = this.isOutSide(event, suggestionstRect) && this.isOutSide(event, searchBarRect)
      let isShowing = suggestionsElement.classList.contains('show')
      if (isOutSide && isShowing) {
         suggestionsElement.classList.remove('show')
      }
   }
   _setState = payload => {
      this.setState(state => ({ ...state, ...payload }))
      if (payload.hasOwnProperty('mapMarkers')) {
         localStorage.setItem('mapMarkers', JSON.stringify(payload.mapMarkers))
      }
   }
   setactiveMarkerToolTool = markerTool => {
      this.setState(state => ({ ...state, activeMarkerTool: markerTool }))
      if (this.state.activeMapMarker) {
         this.setState(state => ({ ...state, activeMapMarker: null }))
      }
   }
   onChangeActiveTool = markerTool => {
      this._setState({ activeMarkerTool: markerTool })
      if (this.state.activeMapMarker) {
         this._setState({ activeMapMarker: null })
      }
   }
   mapGotoCenter(position) {
      this.state.map.setCenter(position)
      this.state.map.setZoom(15)
   }
   setTransform(el, property, value) {
      let transform = el.style.transform
      let transforms = transform.trim().split(' ')

      let found = false
      transforms = transforms.map(transform => {
         if (property === 'scale' && transform.includes(property)) {
            if (!transform.includes('X') && !transform.includes('Y')) {
               found = true
               return `${property}(${value})`
            }
            return transform
         }
         else if (transform.includes(property)) {
            found = true
            return `${property}(${value})`
         }
         return transform
      })
      if (!found) { transforms.push(`${property}(${value})`) }

      el.style.transform = transforms.join(' ')
   }
   showColorPicker() {

      // If color pick is active then hiding it
      if (this.state.colorPicker) {
         this._setState({ colorPicker: false })
         return
      }
      // Finding context menu
      let el = document.getElementById('ContextMenu')
      if (!el) return

      // Setting position relative to context menu
      let { top, left } = el.getBoundingClientRect()
      this._setState({ colorPicker: true, colorPickerPosition: { top, left } })
   }
   setMapMarkerColor(el, tool, { hex, rgb }) {
      const getRgb = less => {
         if (!less) { return `rgba(${Object.values(rgb).join(',')})` }
         return `rgba(${Object.values(rgb).map(v => v > less ? v - less : v).join(',')})`
      }
      if (tool.type === 'text' && tool.editable) {
         let box = el.querySelector(`.${tool.id}`)
         if (tool.id === 'text') {
            box.style.backgroundColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`
            box.style.borderColor = `rgba(${rgb.r},${rgb.g},${rgb.b},1)`
         }
         else if (tool.id === 'text-box') {
            box.style.backgroundColor = hex
            box.style.borderColor = getRgb(30)
         }
      }
      else if (tool.type === 'drop') {
         if (tool.id.includes('outlined')) {
            let paths = el.querySelectorAll('path')
            paths[1].style.fill = hex
         } else {
            el.querySelector('path').style.fill = hex
            el.querySelector('circle').style.fill = getRgb(30)
         }
      }
      else if (tool.type === 'box') {
         if (tool.id.includes('dashed')) {
            let lines = el.querySelectorAll('line')
            lines.forEach(line => line.style.stroke = hex)
         } else {
            el.querySelector('g').style.stroke = hex
         }
      }
      else if (tool.type === 'arrow') {
         let lines = el.querySelectorAll('line')
         lines.forEach(line => line.style.stroke = hex)
      }
   }
   onChangeColorPicker = ({ hex, rgb }) => {
      if (!this.state.activeMapMarker) return

      let el = this.state.activeMapMarker.el
      let mapMarker = this.getMapMarker(el.id)
      let { tool } = mapMarker

      this.setMapMarkerColor(el, tool, { hex, rgb })

      mapMarker.color = { hex, rgb }

      let mapMarkers = this.state.mapMarkers.map(m => m.id === el.id ? mapMarker : m)
      this._setState({ mapMarkers })

   }
   colorPickerPosition = () => {
      return {
         top: this.state.colorPickerPosition.top - 98 + 'px',
         left: this.state.colorPickerPosition.left + 'px'
      }
   }
   onClickContextMenuItem(action) {

      if (action === 'done') {

         let el = this.state.activeMapMarker.el
         let marker = this.getMapMarker(el.id)
         if (marker.tool.role === 'icon') {
            this._setState({
               contextMenu: false, colorPicker: false,
               activeMapMarker: null
            })
            return
         }

         let input = el.querySelector('input')
         let p = el.querySelector('p')
         if (input) {
            if (input.value !== '') { p.innerText = input.value }
            el.removeChild(input)
         }

         this._setState({
            contextMenu: false,
            activeMapMarker: null,
            colorPicker: false,
         })

      }
      else if (action === 'edit') {

         if (!this.state.activeMapMarker) return

         let el = this.state.activeMapMarker.el
         let mapMarker = this.getMapMarker(el.id)


         if (mapMarker.tool.type === 'text' && mapMarker.tool.editable) {
            mapMarker.editing = true
            this.setEditableTextBox(el, mapMarker.tool)
         }

         // Pushing new Map marker to state
         let mapMarkers = this.state.mapMarkers.map(m => {
            if (m.id === mapMarker.id) {
               return { ...m, ...mapMarker }
            }
            return m
         })

         this._setState({ mapMarkers })

      }
      else if (action === 'color') {
         this.showColorPicker()
      }
      else if (action === 'delete') {
         if (!this.state.activeMapMarker) return
         this.state.map.removeObject(this.state.activeMapMarker.marker)
         this._setState({
            contextMenu: false, colorPicker: false,
            activeMapMarker: null
         })

         let el = this.state.activeMapMarker.el
         let mapMarkers = this.state.mapMarkers.filter(m => m.id !== el.id)
         this._setState({ mapMarkers })
      }
      else if (action === 'plus' || action === 'minus') {
         if (!this.state.activeMapMarker) return
         let el = this.state.activeMapMarker.el
         let marker = this.getMapMarker(el.id)

         let scale

         if (action === 'plus') {
            scale = ((marker.transform.scale + 0.1).toFixed(2))
         }
         else if (action === 'minus') {
            scale = (marker.transform.scale - 0.1).toFixed(2)
         }
         else { return }

         if (scale < 0.2 || scale > 5) return

         this.setTransform(el.firstElementChild, 'scale', scale)

         marker.scale = +scale
         let mapMarkers = [...this.state.mapMarkers].map(m =>
            m.id === marker.id ? marker : m
         )
         this._setState({ mapMarkers })
      }
      else if (action.includes('rotate')) {
         if (!this.state.activeMapMarker) return
         let el = this.state.activeMapMarker.el
         let marker = this.getMapMarker(el.id)

         marker.transform.rotate = action.includes('anti')
            ? marker.transform.rotate + 10
            : marker.transform.rotate - 10

         this.setTransform(
            el.firstElementChild, 'rotate',
            marker.transform.rotate + 'deg'
         )

         let mapMarkers = this.state.mapMarkers.map(m =>
            m.id === marker.id ? marker : m
         )
         this._setState({ mapMarkers })
      }
      else if (action.includes('flip')) {
         let el = this.state.activeMapMarker.el

         let marker = this.getMapMarker(el.id)

         if (action.includes('vertical')) {
            marker.transform.scaleY = marker.transform.scaleY < 0 ? 1 : -1
            this.setTransform(el.firstElementChild, 'scaleY', marker.transform.scaleY)
         }
         else {
            marker.transform.scaleX = marker.transform.scaleX < 0 ? 1 : -1
            this.setTransform(el.firstElementChild, 'scaleX', marker.transform.scaleX)
         }

         let mapMarkers = [...this.state.mapMarkers].map(m =>
            m.id === marker.id ? marker : m
         )
         this._setState({ mapMarkers })
      }
   }
   onSelectedMapMarker(marker) {
      this.mapGotoCenter(marker.position)
      let ival = setInterval(() => {
         let el = document.getElementById(marker.id)
         if (el) {
            clearInterval(ival)
            el.classList.add('active')
         }
      }, 100);
   }
   onEditMapMarker(marker) {
      this._setState({ activeMapMarker: true })
      if (marker.role === 'text') {
         let el = document.getElementById(marker.id)
         el.firstElementChild.style.display = 'none'
         el.lastElementChild.style.display = 'block'
      }
   }
   convertCanvasToImage(canvas) {
      var image = new Image();
      image.src = canvas.toDataURL("image/png");
      return image;
   }
   bringBackMapMarkers(mapMarkers) {
      mapMarkers.forEach(marker => {
         let tool = Tools.find(tool => tool.id === marker.tool.id)
         let el = CreateMarkerElement(tool)
         marker.tool = { ...tool, el }
         this.createCustomMarker(marker.position, marker.id, marker.tool, true)
      })
      //this.setState(state => ({ ...state, mapMarkers }))
   }
   async captureMap() {
      let map = document.getElementById('Map')

      let mapCanvas = map.querySelector('canvas')

      let img = this.convertCanvasToImage(mapCanvas)
      console.log(img);

      let mapMarkers = mapCanvas.parentElement.lastElementChild
      let mapMarkersToCanvas = await html2canvas(mapMarkers)

      let margedCanvas = document.createElement('canvas')
      margedCanvas.height = mapCanvas.height
      margedCanvas.width = mapCanvas.width

      //let cxt1 = mapCanvas.getContext('2d')
      //let cxt2 = mapMarkersToCanvas.getContext('2d')
      let ctx3 = margedCanvas.getContext('2d')

      ctx3.drawImage(mapCanvas, 0, 0)
      ctx3.drawImage(mapMarkersToCanvas, 0, 0)

      let link = document.createElement('a');
      link.download = 'ScreenShoot' + Date.now() + '.jpeg';
      link.href = mapMarkersToCanvas.toDataURL()
      link.click();
   }
   async componentDidMount() {

      // Initialize the platform object:
      const platform = new H.service.Platform({ 'apikey': this.state.apiKey });

      // Obtain the default map types from the platform object
      const maptypes = platform.createDefaultLayers();

      // Getting current location
      const CURRENT_LOCATION = await this.getLocation()

      // Instantiate (and display) a map object:
      const map = new H.Map(
         document.getElementById('Map'), maptypes.vector.normal.map,
         { zoom: 13, center: CURRENT_LOCATION.error ? LOCATION_OF_AUS : CURRENT_LOCATION }
      );

      this.setState(state => ({ ...state, map }))

      // Enable the event system on the map instance:
      const mapEvents = new H.mapevents.MapEvents(map);

      // Instantiate the default behavior, providing the mapEvents object:
      const behavior = new H.mapevents.Behavior(mapEvents);

      // Step 4: Create the default UI
      // var ui = H.ui.UI.createDefault(map, platform, 'en-US');

      this.setState(state => ({ ...state, mapBehavior: behavior }))

      let mapMarkers = localStorage.getItem('mapMarkers')
      if (mapMarkers) { this.bringBackMapMarkers(JSON.parse(mapMarkers)) }

      // Add tap/click event listener
      map.addEventListener('tap', this.onClickMap);

      // Setting map dragg events
      map.addEventListener('dragstart', this.onDragStart, false);
      map.addEventListener('dragend', this.onDragEnd, false);
      map.addEventListener('drag', this.onDrag, false);

      window.onclick = event => {
         this.handleSuggestionsHideAndShow(event)
      }
      // add a resize listener to make sure that the map occupies the whole container
      window.addEventListener('resize', () => {
         map.getViewPort().resize()

         if (this.state.activeMapMarker) {
            let el = this.state.activeMapMarker.el
            let { top, left } = el.getBoundingClientRect()
            this._setState({ contextMenuPosition: { top, left } })
            if (this.state.colorPicker) {
               let { top, left } = document.getElementById('ContextMenu')
                  .getBoundingClientRect()
               this._setState({ colorPickerPosition: { top, left } })
            }
         }
      });

      map.addEventListener('wheel', () => {
         if (this.state.activeMapMarker) {
            this._setState({
               activeMapMarker: null, contextMenu: false,
               colorPicker: false
            })
         }
      });

   }
   render() {
      return (
         <div id="App" >
            <div className="d-flex">
               <MapView>

                  <SearchBar
                     tempValue={this.state.tempSearchValue}
                     onInput={this.onChangeSearchInput}
                     onFocus={this.onFocusSearchInput}
                  ></SearchBar>

                  {/* <CaptureMap onClick={() => this.captureMap()} /> */}

                  <Suggestions
                     onItemClick={this.onClickSuggestion}
                     onHover={this.onHoverSuggestionsItem}
                     items={this.state.suggestions}
                  ></Suggestions>

                  <Map></Map>

               </MapView>
               <Sidebar>
                  <MarkerTools onTool={this.onChangeActiveTool} />
               </Sidebar>
            </div>
            <ContextMenu
               onClick={v => this.onClickContextMenuItem(v)}
               show={this.state.contextMenu}
               position={this.state.contextMenuPosition}
            />

            {this.state.colorPicker &&
               <div id="ColorPicker" style={this.colorPickerPosition()}>
                  <ColorPicker onChange={this.onChangeColorPicker} />
               </div>
            }
         </div>
      );
   }
}

export default App;