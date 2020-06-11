// Svg icon components
import { ReactComponent as BoxIcon } from "../assets/svg/box.svg"
import { ReactComponent as BoxDashedIcon } from "../assets/svg/box-dashed.svg"
import { ReactComponent as ArrowIcon } from "../assets/svg/arrow.svg"
import { ReactComponent as ArrowDashedIcon } from "../assets/svg/arrow-dashed.svg"
import { ReactComponent as DropIcon } from "../assets/svg/drop.svg"
import { ReactComponent as DropOutlinedIcon } from "../assets/svg/drop-outlined.svg"

export default [
   {
      id: 'text-box',
      type: 'text',
      value: '',
      hint: "Text box",
      transparent: false,
      editable: true
   },
   {
      id: 'text',
      type: 'text',
      value: '',
      hint: 'Text comment',
      transparent: true,
      editable: true
   },
   {
      id: 'text-entry',
      type: 'text',
      value: 'Entry',
      editable: false
   },
   {
      id: 'text-exit',
      type: 'text',
      value: 'Exit',
      editable: false
   },
   {
      id: 'text-work-site',
      type: 'text',
      value: 'Work site',
      editable: false
   },
   {
      id: 'text-marsh-area',
      type: 'text',
      value: 'Mashalling area',
      editable: false
   },
   {
      id: 'text-clean-out-area',
      type: 'text',
      value: 'Clean out area',
      editable: false
   },
   {
      id: 'text-no-u-turn',
      type: 'text',
      value: 'No u tern',
      editable: false
   },
   {
      id: 'arrow',
      type: 'arrow',
      role: 'icon',
      dashed: false,
      outlined: false,
      icon: ArrowIcon,
   },
   {
      id: 'arrow-dashed',
      type: 'arrow',
      role: 'icon',
      dashed: true,
      outlined: false,
      icon: ArrowDashedIcon
   },
   {
      id: 'box',
      type: 'box',
      role: 'icon',
      dashed: false,
      outlined: true,
      icon: BoxIcon
   },
   {
      id: 'box-dashed',
      type: 'box',
      role: 'icon',
      dashed: true,
      outlined: true,
      icon: BoxDashedIcon
   },
   {
      id: 'drop',
      type: 'drop',
      role: 'icon',
      dashed: false,
      outlined: false,
      icon: DropIcon
   },
   {
      id: 'drop-outlined',
      type: 'drop',
      role: 'icon',
      dashed: false,
      outlined: true,
      icon: DropOutlinedIcon
   }
]