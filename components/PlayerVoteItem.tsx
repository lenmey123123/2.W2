import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';

interface PlayerVoteItemProps {
  playerName: string;
  playerId: string;
  isSelected: boolean;
  onPress: (playerId: string) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const PlayerVoteItem: React.FC<PlayerVoteItemProps> = ({
  playerName,
  playerId,
  isSelected,
  onPress,
  disabled = false,
  style,
}) => {
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors, isSelected, disabled);

  return (
    <TouchableOpacity
      style={[dynamicStyles.item, style]}
      onPress={() => onPress(playerId)}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={`Stimme für ${playerName}`}
      accessibilityState={{ selected: isSelected, disabled }}
    >
      <Text style={dynamicStyles.playerNameText} allowFontScaling={true}>{playerName}</Text>
      {isSelected && (
        <Icon name="check-circle" size={24} color={disabled ? Colors.disabledText : Colors.accentText} />
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (Colors: ThemeColors, isSelected: boolean, isDisabled: boolean) => StyleSheet.create({
  item: {
    backgroundColor: isDisabled 
      ? Colors.disabled 
      : isSelected ? Colors.accent : Colors.cardBackground,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDisabled 
      ? Colors.disabled 
      : isSelected ? Colors.accent : Colors.borderColor,
    minHeight: 60,
  },
  playerNameText: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: isDisabled 
      ? Colors.disabledText
      : isSelected ? Colors.accentText : Colors.primaryText,
  },
});

export default PlayerVoteItem;