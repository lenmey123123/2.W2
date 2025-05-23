// components/ScreenWrapper.tsx
import React from 'react';
// 👇 Changed import for SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

const wrapChild = (child: React.ReactNode): React.ReactNode => {
  if (typeof child === 'string' || typeof child === 'number') {
    return <Text>{child}</Text>;
  }

  if (React.isValidElement(child) && child.props && Object.prototype.hasOwnProperty.call(child.props, 'children')) {
    const childrenToMap = (child.props as { children?: React.ReactNode }).children;
    const newChildren = React.Children.map(childrenToMap, wrapChild);
    return React.cloneElement(child, { ...child.props }, newChildren);
  }
  return child;
};

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, edges }) => {
  const renderedChildren = React.Children.map(children, wrapChild);

  return (
    // Using SafeAreaView from react-native-safe-area-context
    // The 'edges' prop works the same way here.
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {renderedChildren}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWrapper;