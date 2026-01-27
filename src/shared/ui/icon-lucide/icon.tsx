import { LucideIcon } from 'lucide-react-native'
import * as icons from 'lucide-react-native/icons'

interface IconProps {
  name: keyof typeof icons
  color?: string
  size?: number
}

const IconLucide = ({ name, color, size }: IconProps) => {
  const LucideIcon = (icons as Record<string, LucideIcon>)[name]

  if (!LucideIcon) {
    console.warn(`Icon "${String(name)}" not found in lucide-react-native/icons`)
    return null
  }

  return <LucideIcon color={color} size={size} />
}

export default IconLucide
