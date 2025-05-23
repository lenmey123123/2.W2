import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';

interface CategoryCardProps {
  categoryName: string;
  iconName?: string;
  isSelected: boolean;
  onSelect: () => void;
  style?: StyleProp<ViewStyle>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  categoryName,
  iconName,
  isSelected,
  onSelect,
  style,
}) => {
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors, isSelected);

  return (
    <TouchableOpacity
      style={[dynamicStyles.card, style]}
      onPress={onSelect}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={categoryName}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={dynamicStyles.contentContainer}>
        {iconName && (
          <Icon name={iconName} size={24} color={isSelected ? Colors.accentText : Colors.icon} style={dynamicStyles.icon} />
        )}
        <Text style={dynamicStyles.text} allowFontScaling={true}>{categoryName}</Text>
      </View>
      {isSelected && (
        <Icon name="check-circle" size={24} color={Colors.accentText} />
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (Colors: ThemeColors, isSelected: boolean) => StyleSheet.create({
  card: {
    backgroundColor: isSelected ? Colors.accent : Colors.cardBackground,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isSelected ? Colors.accent : Colors.borderColor,
    minHeight: 60,
    shadowColor: Colors.primaryText, // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // For Android shadow
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontFamily: isSelected ? Fonts.OpenSans.Bold : Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: isSelected ? Colors.accentText : Colors.primaryText,
    flexShrink: 1, 
  },
});

export default CategoryCard;