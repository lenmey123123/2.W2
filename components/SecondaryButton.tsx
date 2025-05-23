import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors, disabled);

  return (
    <TouchableOpacity
      style={[dynamicStyles.button, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      <Text style={[dynamicStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const makeStyles = (Colors: ThemeColors, isDisabled: boolean) => StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: isDisabled ? Colors.disabled : Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.button,
    lineHeight: LineHeights.button,
    color: isDisabled ? Colors.disabledText : Colors.accent,
    textAlign: 'center',
  },
});

export default SecondaryButton;