import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { Text } from '../index'

describe('Text Component', () => {
  it('should render text correctly', () => {
    render(<Text>Hello World</Text>)
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should render with default size', () => {
    render(<Text>Default Text</Text>)
    expect(screen.getByText('Default Text')).toBeTruthy()
  })

  it('should render with custom size', () => {
    render(<Text size='lg'>Large Text</Text>)
    expect(screen.getByText('Large Text')).toBeTruthy()
  })

  it('should render with bold prop', () => {
    render(<Text bold>Bold Text</Text>)
    expect(screen.getByText('Bold Text')).toBeTruthy()
  })

  it('should render with italic prop', () => {
    render(<Text italic>Italic Text</Text>)
    expect(screen.getByText('Italic Text')).toBeTruthy()
  })

  it('should render with underline prop', () => {
    render(<Text underline>Underlined Text</Text>)
    expect(screen.getByText('Underlined Text')).toBeTruthy()
  })

  it('should render with strikeThrough prop', () => {
    render(<Text strikeThrough>Strike Through Text</Text>)
    expect(screen.getByText('Strike Through Text')).toBeTruthy()
  })

  it('should render with custom className', () => {
    render(<Text className='custom-class'>Custom Class Text</Text>)
    expect(screen.getByText('Custom Class Text')).toBeTruthy()
  })

  it('should render with multiple props combined', () => {
    render(
      <Text bold underline size='xl' className='extra-class'>
        Combined Props
      </Text>
    )
    expect(screen.getByText('Combined Props')).toBeTruthy()
  })

  it('should render with all variant props', () => {
    render(
      <Text size='2xl' bold italic underline strikeThrough highlight sub>
        All Variants
      </Text>
    )
    expect(screen.getByText('All Variants')).toBeTruthy()
  })

  it('should pass through additional props', () => {
    render(<Text testID='custom-test-id'>Test Text</Text>)
    expect(screen.getByTestId('custom-test-id')).toBeTruthy()
  })

  it('should render children correctly', () => {
    render(
      <Text>
        <Text>Nested </Text>
        Text
      </Text>
    )
    expect(screen.getByText('Nested Text')).toBeTruthy()
  })
})
