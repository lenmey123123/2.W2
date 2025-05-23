import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, View, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useThemeColors, ThemeColors } from '../constants/Colors';
import { Fonts, FontSizes, LineHeights } from '../constants/Typography';
import { useGame } from '../contexts/GameContext';

interface TimerDisplayProps {
  onTimerEnd: () => void;
  isRunning: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  onTimerEnd,
  isRunning,
  style,
  textStyle,
}) => {
  const Colors = useThemeColors();
  const { gameState, setTimerValue } = useGame();
  const timeLeft = gameState.timerValue;
  // Removed invalid property access; initialSeconds is not used elsewhere
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerValue(timeLeft - 1);
      }, 1000);
    } else if (!isRunning || timeLeft === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeLeft === 0 && isRunning) { 
        onTimerEnd();
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onTimerEnd, setTimerValue]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  let timeColor = Colors.primaryText;
  if (timeLeft <= 10 && timeLeft > 5) {
    timeColor = '#FFA500'; // Orange
  } else if (timeLeft <= 5) {
    timeColor = Colors.error;
  }

  const dynamicStyles = makeStyles(Colors, timeColor);

  return (
    <View style={[dynamicStyles.container, style]}>
      <Text style={[dynamicStyles.text, { color: timeColor }, textStyle]} allowFontScaling={true}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
};

const makeStyles = (Colors: ThemeColors, timeColor: string) => StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.OpenSans.Bold,
    fontSize: FontSizes.timer,
    lineHeight: LineHeights.timer,
  },
});

export default TimerDisplay;