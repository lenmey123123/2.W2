import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights, LetterSpacings } from '../constants/Typography';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  iconName?: string;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  iconName,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors, disabled || isLoading);

  const content = isLoading ? (
    <ActivityIndicator color={Colors.accentText} />
  ) : (
    <View style={dynamicStyles.contentContainer}>
      {iconName && iconPosition === 'left' && (
        <Icon name={iconName} size={FontSizes.button} color={Colors.accentText} style={dynamicStyles.iconLeft} />
      )}
      <Text style={[dynamicStyles.text, textStyle]}>{title}</Text>
      {iconName && iconPosition === 'right' && (
        <Icon name={iconName} size={FontSizes.button} color={Colors.accentText} style={dynamicStyles.iconRight} />
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[dynamicStyles.button, style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || isLoading }}
      // android_ripple={{ color: Colors.ripple, borderless: false }} TODO: Check if borderless is desired. Ripple needs foreground on Android API 30+
    >
      {content}
    </TouchableOpacity>
  );
};

const makeStyles = (Colors: ThemeColors, isDisabled: boolean) => StyleSheet.create({
  button: {
    backgroundColor: isDisabled ? Colors.disabled : Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, 
    flexDirection: 'row',
    elevation: isDisabled ? 0 : 2,
    shadowColor: Colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDisabled ? 0 : 0.2,
    shadowRadius: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.button,
    lineHeight: LineHeights.button,
    letterSpacing: LetterSpacings.button,
    color: isDisabled ? Colors.disabledText : Colors.accentText,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default PrimaryButton;