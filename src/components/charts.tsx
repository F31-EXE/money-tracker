import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme';
import { T } from './ui';

/** Donut with gapped segments; `value`s are summed and drawn proportionally. */
export function Donut({
  data,
  size = 200,
  stroke = 22,
  children,
}: {
  data: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const { c } = useTheme();
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  const gap = data.length > 1 ? 0.03 : 0; // radians between segments
  let angle = -Math.PI / 2;

  const arc = (a0: number, a1: number) => {
    const p = (a: number) => `${cx + r * Math.cos(a)} ${cx + r * Math.sin(a)}`;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)}`;
  };

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={cx} cy={cx} r={r} stroke={c.surfaceAlt} strokeWidth={stroke} fill="none" />
        {total > 0 &&
          data.map((d, i) => {
            const sweep = (d.value / total) * Math.PI * 2;
            const a0 = angle + gap / 2;
            const a1 = angle + sweep - gap / 2;
            angle += sweep;
            if (sweep >= Math.PI * 2 - 0.001) {
              return <Circle key={i} cx={cx} cy={cx} r={r} stroke={d.color} strokeWidth={stroke} fill="none" />;
            }
            if (a1 <= a0) return null;
            return (
              <Path key={i} d={arc(a0, a1)} stroke={d.color} strokeWidth={stroke} fill="none" />
            );
          })}
      </Svg>
      {children}
    </View>
  );
}

/** Vertical bars (optionally paired); bars outside `highlight` are dimmed. */
export function Bars({
  values,
  labels,
  height = 140,
  color,
  highlight,
  secondary,
  secondaryColor,
}: {
  values: number[];
  labels?: string[];
  height?: number;
  color: string;
  highlight?: number;
  secondary?: number[];
  secondaryColor?: string;
}) {
  const { c } = useTheme();
  const max = Math.max(1, ...values, ...(secondary ?? []));
  const pair = !!secondary;
  const bar = (v: number, col: string, faded: boolean) => (
    <View
      style={{
        flex: 1,
        maxWidth: pair ? 12 : 10,
        height: v > 0 ? Math.max(4, (v / max) * height) : 4,
        borderRadius: 6,
        backgroundColor: v > 0 ? col : c.surfaceAlt,
        opacity: faded ? 0.4 : 1,
      }}
    />
  );
  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end' }}>
        {values.map((v, i) => {
          const faded = highlight !== undefined && i !== highlight;
          return (
            <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3, paddingHorizontal: 1 }}>
              {pair ? bar(secondary![i] ?? 0, secondaryColor ?? color, faded) : null}
              {bar(v, color, faded)}
            </View>
          );
        })}
      </View>
      {labels ? (
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {labels.map((l, i) => (
            <T key={i} v="caption" faint={i !== highlight} style={{ flex: 1, textAlign: 'center' }}>
              {l}
            </T>
          ))}
        </View>
      ) : null}
    </View>
  );
}
