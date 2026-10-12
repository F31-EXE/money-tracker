import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ModalScreen } from '@/components/ModalScreen';
import { confirm } from '@/components/TransactionEditor';
import { Button, Card, IconBubble, T, Tap, haptic } from '@/components/ui';
import { currencySymbol, formatMoney } from '@/lib/format';
import { accountBalance } from '@/lib/stats';
import { categoryColors } from '@/store/defaults';
import { useStore, type Account } from '@/store';
import { font, useTheme } from '@/theme';

const accountIcons = ['card', 'cash', 'wallet', 'trending-up', 'briefcase', 'home', 'gift', 'heart'];

type Draft = Omit<Account, 'id' | 'initialBalance'> & { id?: string; initialBalance: string };

export default function Accounts() {
  const { c } = useTheme();
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.settings.currency);
  const saveAccount = useStore((s) => s.saveAccount);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const [draft, setDraft] = useState<Draft | null>(null);

  const parsed = draft ? parseFloat(draft.initialBalance.replace(',', '.').replace(/\s/g, '')) || 0 : 0;

  return (
    <ModalScreen title="Счета">
      <View style={{ gap: 10 }}>
        {accounts.map((a) => (
          <Tap
            key={a.id}
            scale={0.98}
            onPress={() => setDraft({ ...a, initialBalance: a.initialBalance ? String(a.initialBalance) : '' })}
            style={[styles.row, { backgroundColor: c.surface, borderColor: draft?.id === a.id ? a.color : 'transparent' }]}
          >
            <IconBubble icon={a.icon} color={a.color} />
            <T v="h3" style={{ flex: 1 }}>
              {a.name}
            </T>
            <T v="h3">{formatMoney(accountBalance(a, transactions), currency)}</T>
          </Tap>
        ))}
      </View>

      {draft ? (
        <Card style={{ marginTop: 16, gap: 14 }}>
          <View style={styles.previewRow}>
            <IconBubble icon={draft.icon} color={draft.color} size={52} solid />
            <TextInput
              value={draft.name}
              onChangeText={(name) => setDraft({ ...draft, name })}
              placeholder="Название счёта"
              placeholderTextColor={c.textFaint}
              maxLength={24}
              style={[styles.input, { color: c.text, backgroundColor: c.surfaceAlt }]}
            />
          </View>
          <View>
            <T v="caption" muted style={{ marginBottom: 6 }}>
              Начальный остаток, {currencySymbol(currency)}
            </T>
            <TextInput
              value={draft.initialBalance}
              onChangeText={(v) => setDraft({ ...draft, initialBalance: v.replace(/[^\d,.\-]/g, '') })}
              placeholder="0"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={c.textFaint}
              style={[styles.input, { color: c.text, backgroundColor: c.surfaceAlt, flex: 0 }]}
            />
          </View>
          <View style={styles.wrap}>
            {accountIcons.map((ic) => (
              <Pressable
                key={ic}
                onPress={() => {
                  haptic('select');
                  setDraft({ ...draft, icon: ic });
                }}
              >
                <IconBubble icon={ic} color={draft.icon === ic ? draft.color : c.textFaint} size={44} />
              </Pressable>
            ))}
          </View>
          <View style={styles.wrap}>
            {categoryColors.map((col) => (
              <Pressable
                key={col}
                onPress={() => {
                  haptic('select');
                  setDraft({ ...draft, color: col });
                }}
                style={[styles.swatch, { backgroundColor: col, borderColor: draft.color === col ? c.text : 'transparent' }]}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Отмена" kind="ghost" onPress={() => setDraft(null)} style={{ flex: 1, backgroundColor: c.surfaceAlt }} />
            <Button
              title="Сохранить"
              disabled={!draft.name.trim()}
              style={{ flex: 1 }}
              onPress={() => {
                saveAccount({ ...draft, name: draft.name.trim(), initialBalance: parsed });
                setDraft(null);
              }}
            />
          </View>
          {draft.id && accounts.length > 1 ? (
            <Button
              title="Удалить счёт"
              kind="danger"
              icon="trash-outline"
              onPress={() =>
                confirm('Удалить счёт?', 'Его операции перейдут на другой счёт.', () => {
                  deleteAccount(draft.id!);
                  setDraft(null);
                })
              }
            />
          ) : null}
        </Card>
      ) : (
        <Button
          title="Новый счёт"
          icon="add"
          style={{ marginTop: 16 }}
          onPress={() => setDraft({ name: '', icon: 'wallet', color: categoryColors[4], initialBalance: '' })}
        />
      )}
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, borderWidth: 1.5 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, height: 52, borderRadius: 14, paddingHorizontal: 14, fontFamily: font.semibold, fontSize: 16, outlineStyle: 'none' } as any,
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2.5 },
});
