import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ThemedText } from '../themed-text'
import { useThemeColor } from '@/shared/lib/hooks/use-theme-color'

// Mock the useThemeColor hook
jest.mock('@/shared/lib/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn(),
}))

describe('ThemedText Component', () => {
  beforeEach(() => {
    ;(useThemeColor as jest.Mock).mockReturnValue('#000000')
  })

  it('should render text correctly', () => {
    render(<ThemedText>Hello World</ThemedText>)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should render with default type', () => {
    render(<ThemedText>Default Text</ThemedText>)
    expect(screen.getByText('Default Text')).toBeTruthy()
  })

  it('should render with title type', () => {
    render(<ThemedText type='title'>Title Text</ThemedText>)
    expect(screen.getByText('Title Text')).toBeTruthy()
  })

  it('should render with subtitle type', () => {
    render(<ThemedText type='subtitle'>Subtitle Text</ThemedText>)
    expect(screen.getByText('Subtitle Text')).toBeTruthy()
  })

  it('should render with defaultSemiBold type', () => {
    render(<ThemedText type='defaultSemiBold'>Semi Bold Text</ThemedText>)
    expect(screen.getByText('Semi Bold Text')).toBeTruthy()
  })

  it('should render with link type', () => {
    render(<ThemedText type='link'>Link Text</ThemedText>)
    expect(screen.getByText('Link Text')).toBeTruthy()
  })

  it('should apply theme color from useThemeColor', () => {
    ;(useThemeColor as jest.Mock).mockReturnValue('#ff0000')
    render(<ThemedText>Colored Text</ThemedText>)
    expect(screen.getByText('Colored Text')).toBeTruthy()
    expect(useThemeColor).toHaveBeenCalledWith({ light: undefined, dark: undefined }, 'text')
  })

  it('should use custom lightColor', () => {
    render(<ThemedText lightColor='#custom-light'>Custom Light Text</ThemedText>)
    expect(screen.getByText('Custom Light Text')).toBeTruthy()
    expect(useThemeColor).toHaveBeenCalledWith({ light: '#custom-light', dark: undefined }, 'text')
  })

  it('should use custom darkColor', () => {
    render(<ThemedText darkColor='#custom-dark'>Custom Dark Text</ThemedText>)
    expect(screen.getByText('Custom Dark Text')).toBeTruthy()
    expect(useThemeColor).toHaveBeenCalledWith({ light: undefined, dark: '#custom-dark' }, 'text')
  })

  it('should use both light and dark colors', () => {
    render(
      <ThemedText lightColor='#light' darkColor='#dark'>
        Themed Text
      </ThemedText>
    )
    expect(screen.getByText('Themed Text')).toBeTruthy()
    expect(useThemeColor).toHaveBeenCalledWith({ light: '#light', dark: '#dark' }, 'text')
  })

  it('should apply custom style', () => {
    render(<ThemedText style={{ fontSize: 20 }}>Styled Text</ThemedText>)
    expect(screen.getByText('Styled Text')).toBeTruthy()
  })

  it('should pass through additional props', () => {
    render(<ThemedText testID='custom-test-id'>Test Text</ThemedText>)
    expect(screen.getByTestId('custom-test-id')).toBeTruthy()
  })
})
