import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';

interface RoleRevealCardProps {
  playerName: string;
  role: 'imposter' | 'normal';
  word?: string;
  isRevealed: boolean;
  onRevealPress: () => void;
  onConfirmPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const RoleRevealCard: React.FC<RoleRevealCardProps> = ({
  playerName,
  role,
  word,
  isRevealed,
  onRevealPress,
  onConfirmPress,
  style,
}) => {
  const Colors = useThemeColors();
  const dynamicStyles = makeStyles(Colors);

  return (
    <View style={[dynamicStyles.card, style]}>
      <Text style={dynamicStyles.playerName} allowFontScaling={true}>{playerName}</Text>
      {!isRevealed ? (
        <>
          <Text style={dynamicStyles.instructionText} allowFontScaling={true}>Tippe, um deine Rolle aufzudecken.</Text>
          <PrimaryButton title="Rolle aufdecken" onPress={onRevealPress} style={dynamicStyles.buttonMargin} />
        </>
      ) : (
        <>
          <Text style={dynamicStyles.roleTitle} allowFontScaling={true}>
            {role === 'imposter' ? 'DU BIST DER IMPOSTER' : 'NORMALO'}
          </Text>
          {role === 'normal' && word && (
            <Text style={dynamicStyles.wordText} allowFontScaling={true}>Wort: {word}</Text>
          )}
          {role === 'imposter' && (
            <Text style={dynamicStyles.imposterHintText} allowFontScaling={true}>
              Finde heraus, was die anderen beschreiben!
            </Text>
          )}
          <Text style={dynamicStyles.instructionTextSmall} allowFontScaling={true}>
            Merke dir deine Rolle und gib das Gerät weiter.
          </Text>
          <PrimaryButton title="Verbergen & Weitergeben" onPress={onConfirmPress} style={dynamicStyles.buttonMargin} />
        </>
      )}
    </View>
  );
};

const makeStyles = (Colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  playerName: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: Colors.primaryText,
    marginBottom: 15,
  },
  instructionText: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 25,
  },
   instructionTextSmall: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  roleTitle: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.roleTitle,
    lineHeight: LineHeights.roleTitle,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  wordText: {
    fontFamily: Fonts.OpenSans.SemiBold,
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    color: Colors.primaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  imposterHintText: {
    fontFamily: Fonts.OpenSans.Regular,
    fontSize: FontSizes.body,
    lineHeight: LineHeights.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonMargin: {
    marginTop: 10,
    width: '100%',
  },
});

export default RoleRevealCard;