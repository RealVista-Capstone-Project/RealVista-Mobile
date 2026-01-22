import Svg, { Path } from 'react-native-svg'

type MenuIconProps = {
  width?: number
  height?: number
  color?: string
}

export function MenuIcon({ width = 24, height = 24, color = '#000929' }: MenuIconProps) {
  return (
    <Svg width={width} height={height} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M3 8H21'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <Path
        d='M3 16H21'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </Svg>
  )
}
