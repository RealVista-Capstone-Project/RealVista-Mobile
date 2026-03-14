declare module 'rn-range-slider' {
  import { Component, ReactNode } from 'react'
  import { ViewProps } from 'react-native'

  export interface RangeSliderProps extends ViewProps {
    min?: number
    max?: number
    step?: number
    floatingLabel?: boolean
    renderThumb?: () => ReactNode
    renderRail?: () => ReactNode
    renderRailSelected?: () => ReactNode
    renderLabel?: (value: number) => ReactNode
    renderNotch?: () => ReactNode
    onValueChanged?: (low: number, high: number, fromUser: boolean) => void
    onSliderTouchEnd?: (low: number, high: number) => void
    low?: number
    high?: number
    disableRange?: boolean
  }

  export default class RangeSlider extends Component<RangeSliderProps> {}
}
