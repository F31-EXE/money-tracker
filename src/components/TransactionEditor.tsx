import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dayTitle, startOfDay } from '@/lib/dates';
import { currencySymbol } from '@/lib/format';
import { useStore, type Transaction, type TxType } from '@/store';
import { font, useTheme } from '@/theme';
import { Button, IconBubble, MAX_WIDTH, Segmented, T, Tap, haptic } from './ui';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'];

function toInput(n: number) {
  return n ? String(n).replace('.', ',') : '';
}

/** Cross-platform confirm: Alert on native, window.confirm on web. */
export function confirm(title: string, message: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Удалить', style: 'destructive', onPress: onOk },
  ]);
}

export function TransactionEditor({ existing }: { existing?: Transaction }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const currency = useStore((s) => s.settings.currency);
  const save = useStore((s) => s.saveTransaction);
  const remove = useStore((s) => s.deleteTransaction);

  const [type, setType] = useState<TxType>(existing?.type ?? 'expense');
  const [amount, setAmount] = useState(toInput(existing?.amount ?? 0));
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [accountId, setAccountId] = useState(existing?.accountId ?? accounts[0]?.id);
  const [note, setNote] = useState(existing?.note ?? '');
  const [date, setDate] = useState(() => (existing ? new Date(existing.date) : new Date()));

  const cats = useMemo(() => categories.filter((x) => x.type === type), [categories, type]);
  const selectedCat = cats.find((x) => x.id === categoryId) ? categoryId : cats[0]?.id;
  const value = parseFloat(amount.replace(',', '.')) || 0;
  const accentColor = type === 'income' ? c.income : c.text;

  const press = (k: string) => {
    haptic('select');
    setAmount((a) => {
      if (k === 'del') return a.slice(0, -1);
      if (k === ',') return a.includes(',') ? a : (a || '0') + ',';
      if (a.includes(',') && a.split(',')[1].length >= 2) return a;
      if (a.replace(',', '').length >= 10) return a;
      if (a === '0') return k;
      return a + k;
    });
  };

  // Desktop web: type the amount on the physical keyboard.
  const pressRef = useRef(press);
  pressRef.current = press;
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      if (/^\d$/.test(e.key)) pressRef.current(e.key);
      else if (e.key === ',' || e.key === '.') pressRef.current(',');
      else if (e.key === 'Backspace') pressRef.current('del');
      else if (e.key === 'Enter') saveRef.current();
      else if (e.key === 'Escape') close();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const shiftDay = (n: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    if (startOfDay(d) > startOfDay(new Date())) return;
    haptic('select');
    setDate(d);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onSave = () => {
    if (!value || !selectedCat || !accountId) return;
    save({
      id: existing?.id,
      type,
      amount: Math.round(value * 100) / 100,
      categoryId: selectedCat,
      accountId,
      note: note.trim(),
      date: date.toISOString(),
    });
    haptic('medium');
    close();
  };

  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const onDelete = () =>
    existing &&
    confirm('Удалить операцию?', 'Это действие нельзя отменить.', () => {
      remove(existing.id);
      close();
    });

  const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.column, { flex: 1, paddingTop: Platform.OS === 'ios' ? 16 : insets.top + 12 }]}>
        <View style={styles.header}>
          <Pressable onPress={close} hitSlop={10} style={[styles.round, { backgroundColor: c.surface }]}>
            <Ionicons name="close" size={20} color={c.text} />
          </Pressable>
          <T v="h3">{existing ? 'Редактирование' : 'Новая операция'}</T>
          {existing ? (
            <Pressable onPress={onDelete} hitSlop={10} style={[styles.round, { backgroundColor: c.expense + '1F' }]}>
              <Ionicons name="trash-outline" size={18} color={c.expense} />
            </Pressable>
          ) : (
            <View style={styles.round} />
          )}
        </View>

        <Segmented
          style={{ marginHorizontal: 20, marginTop: 14 }}
          value={type}
          onChange={setType}
          options={[
            { key: 'expense', label: 'Расход' },
            { key: 'income', label: 'Доход' },
          ]}
        />

        <View style={styles.amount}>
          <T v="display" color={amount ? accentColor : c.textFaint} style={{ fontSize: 52 }} numberOfLines={1} adjustsFontSizeToFit>
            {type === 'income' ? '+' : '−'}
            {amount ? groupInput(amount) : '0'}
          </T>
          <T v="h1" color={c.textMuted} style={{ marginLeft: 8, marginBottom: 8 }}>
            {currencySymbol(currency)}
          </T>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {cats.map((cat) => {
              const active = cat.id === selectedCat;
              return (
                <Tap
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[styles.cat, { backgroundColor: active ? cat.color + '26' : c.surface, borderColor: active ? cat.color : 'transparent' }]}
                >
                  <IconBubble icon={cat.icon} color={cat.color} size={36} solid={active} />
                  <T v="caption" color={active ? c.text : c.textMuted} numberOfLines={1}>
                    {cat.name}
                  </T>
                </Tap>
              );
            })}
            <Tap onPress={() => router.push('/categories')} style={[styles.cat, { backgroundColor: c.surface, borderColor: 'transparent' }]}>
              <View style={[styles.catAdd, { borderColor: c.border }]}>
                <Ionicons name="add" size={18} color={c.textMuted} />
              </View>
              <T v="caption" muted>
                Своя
              </T>
            </Tap>
          </ScrollView>

          <View style={styles.metaRow}>
            <View style={[styles.dateBox, { backgroundColor: c.surface }]}>
              <Pressable onPress={() => shiftDay(-1)} hitSlop={8} style={styles.dateBtn}>
                <Ionicons name="chevron-back" size={16} color={c.text} />
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
                <Ionicons name="calendar-outline" size={15} color={c.textMuted} />
                <T v="label" numberOfLines={1}>
                  {dayTitle(date).replace(/^[^,]+, /, '')}
                </T>
              </View>
              <Pressable onPress={() => shiftDay(1)} disabled={isToday} hitSlop={8} style={[styles.dateBtn, isToday && { opacity: 0.25 }]}>
                <Ionicons name="chevron-forward" size={16} color={c.text} />
              </Pressable>
            </View>
            {accounts.map((a) => {
              const active = a.id === accountId;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => {
                    haptic('select');
                    setAccountId(a.id);
                  }}
                  style={[styles.account, { backgroundColor: active ? c.surfaceAlt : c.surface, borderColor: active ? a.color : 'transparent' }]}
                >
                  <Ionicons name={a.icon as any} size={16} color={a.color} />
                  <T v="label" color={active ? c.text : c.textMuted}>
                    {a.name}
                  </T>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.note, { backgroundColor: c.surface }]}>
            <Ionicons name="create-outline" size={18} color={c.textFaint} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Заметка"
              placeholderTextColor={c.textFaint}
              style={[styles.noteInput, { color: c.text }]}
              maxLength={80}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        <View style={[styles.keypad, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.keys}>
            {KEYS.map((k) => (
              <Pressable
                key={k}
                onPress={() => press(k)}
                onLongPress={k === 'del' ? () => setAmount('') : undefined}
                style={({ pressed }) => [styles.key, { backgroundColor: pressed ? c.surfaceAlt : 'transparent' }]}
              >
                {k === 'del' ? (
                  <Ionicons name="backspace-outline" size={24} color={c.text} />
                ) : (
                  <T v="h1" style={{ fontSize: 26 }}>
                    {k}
                  </T>
                )}
              </Pressable>
            ))}
          </View>
          <Button title={existing ? 'Сохранить' : 'Добавить'} icon="checkmark" onPress={onSave} disabled={!value} style={{ marginHorizontal: 20 }} />
        </View>
      </View>
    </View>
  );
}

function groupInput(a: string) {
  const [int, frac] = a.split(',');
  const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return frac !== undefined ? `${g},${frac}` : g;
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  amount: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 22 },
  chips: { paddingHorizontal: 20, gap: 8 },
  cat: { width: 84, alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 18, borderWidth: 1.5 },
  catAdd: { width: 36, height: 36, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  dateBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, height: 44, width: '100%', paddingHorizontal: 4 },
  dateBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  account: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, height: 44, paddingHorizontal: 14, borderWidth: 1.5, flexGrow: 1, justifyContent: 'center' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, height: 48, paddingHorizontal: 14, marginHorizontal: 20, marginTop: 8 },
  noteInput: { flex: 1, height: '100%', fontFamily: font.medium, fontSize: 15, outlineStyle: 'none' } as any,
  keypad: { paddingTop: 4 },
  keys: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginBottom: 10 },
  key: { width: '33.333%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
});
