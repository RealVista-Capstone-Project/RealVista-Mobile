import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { Box } from '../index';

describe('Box Component', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<Box testID="box" />);
    expect(getByTestId('box')).toBeTruthy();
  });

  it('should render children', () => {
    render(
      <Box testID="parent-box">
        <View testID="child-view" />
      </Box>
    );
    expect(screen.getByTestId('child-view')).toBeTruthy();
  });

  it('should render with custom className', () => {
    const { getByTestId } = render(<Box className="bg-blue-500" testID="box" />);
    expect(getByTestId('box')).toBeTruthy();
  });

  it('should pass through View props', () => {
    const { getByTestId } = render(<Box testID="custom-box" />);
    expect(getByTestId('custom-box')).toBeTruthy();
  });

  it('should render with style prop', () => {
    const { getByTestId } = render(<Box style={{ width: 100, height: 100 }} testID="box" />);
    expect(getByTestId('box')).toBeTruthy();
  });

  it('should render multiple children', () => {
    render(
      <Box>
        <View testID="child-1" />
        <View testID="child-2" />
        <View testID="child-3" />
      </Box>
    );
    expect(screen.getByTestId('child-1')).toBeTruthy();
    expect(screen.getByTestId('child-2')).toBeTruthy();
    expect(screen.getByTestId('child-3')).toBeTruthy();
  });

  it('should forward ref', () => {
    const ref = React.createRef<any>();
    render(<Box ref={ref} />);
    expect(ref.current).toBeTruthy();
  });
});
