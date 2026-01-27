import { Colors } from '@/shared/theme/color'

export function useColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  props?: { light?: string; dark?: string }
) {
  const theme = 'light'
  const colorFromProps = props?.[theme]

  if (colorFromProps) {
    return colorFromProps
  } else {
    return Colors[theme][colorName]
  }
}
