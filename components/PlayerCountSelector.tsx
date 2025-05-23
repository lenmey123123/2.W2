import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes } from '../constants/Typography';

interface PlayerCountSelectorProps {
  minPlayers: number;
  maxPlayers: number;
  initialValue: number;
  onValueChange: (count: number) => void;
}

const PlayerCountSelector: React.FC<PlayerCountSelectorProps> = ({
  minPlayers,
  maxPlayers,
  initialValue,
  onValueChange,
}) => {
  const [selectedCount, setSelectedCount] = useState(initialValue);
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors);

  const handleSelect = (count: number) => {
    setSelectedCount(count);
    onValueChange(count);
  };

  const numbers = Array.from({ length: maxPlayers - minPlayers + 1 }, (_, i) => minPlayers + i);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.container}>
      {numbers.map((num) => (
        <TouchableOpacity
          key={num}
          style={[
            dynamicStyles.item,
            selectedCount === num && dynamicStyles.itemSelected,
          ]}
          onPress={() => handleSelect(num)}
          accessibilityRole="button"
          accessibilityLabel={`${num} Spieler`}
          accessibilityState={{ selected: selectedCount === num }}
        >
          <Text
            style={[
              dynamicStyles.itemText,
              selectedCount === num && dynamicStyles.itemTextSelected,
            ]}
            allowFontScaling={true}
          >
            {num}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  item: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  itemSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  itemText: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.body,
    color: Colors.primaryText,
  },
  itemTextSelected: {
    color: Colors.accentText,
    fontFamily: Fonts.OpenSans.Bold,
  },
});

export default PlayerCountSelector;