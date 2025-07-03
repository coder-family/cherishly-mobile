/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#C04000'; // Dark Orange
const tintColorDark = '#C04000'; // Dark Orange
const iconColor = '#006400'; // Dark Green

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: iconColor,
    tabIconDefault: iconColor,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: iconColor,
    tabIconDefault: iconColor,
    tabIconSelected: tintColorDark,
  },
};
