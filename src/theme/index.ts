import { useColorScheme } from 'react-native';
import { useStore } from '@/store';

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentText: string;
  income: string;
  expense: string;
  heroFrom: string;
  heroTo: string;
  heroText: string;
  heroMuted: string;
  overlay: string;
};

const dark: Palette = {
  bg: '#0B0B10',
  surface: '#15151D',
  surfaceAlt: '#1E1E29',
  border: '#262633',
  text: '#F4F4F8',
  textMuted: '#9A9AAE',
  textFaint: '#5E5E72',
  accent: '#C8F55A',
  accentText: '#0B0B10',
  income: '#5BE3A4',
  expense: '#FF7A7A',
  heroFrom: '#7B6CFF',
  heroTo: '#3B2FB8',
  heroText: '#FFFFFF',
  heroMuted: 'rgba(255,255,255,0.68)',
  overlay: 'rgba(0,0,0,0.6)',
};

const light: Palette = {
  bg: '#F3F3F7',
  surface: '#FFFFFF',
  surfaceAlt: '#ECECF2',
  border: '#E2E2EA',
  text: '#101018',
  textMuted: '#6A6A7E',
  textFaint: '#A5A5B5',
  accent: '#101018',
  accentText: '#C8F55A',
  income: '#13A96B',
  expense: '#E5484D',
  heroFrom: '#7B6CFF',
  heroTo: '#3B2FB8',
  heroText: '#FFFFFF',
  heroMuted: 'rgba(255,255,255,0.72)',
  overlay: 'rgba(16,16,24,0.4)',
};

export const font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 32 };

export function useTheme() {
  const system = useColorScheme();
  const pref = useStore((s) => s.settings.theme);
  const mode = pref === 'system' ? (system === 'light' ? 'light' : 'dark') : pref;
  return { c: mode === 'light' ? light : dark, mode } as const;
}
