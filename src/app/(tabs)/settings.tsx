import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, Share, StyleSheet, TextInput, View } from 'react-native';
import { confirm } from '@/components/TransactionEditor';
import { IconBubble, Screen, Segmented, T, Tap, haptic } from '@/components/ui';
import { currencies, currencySymbol, formatMoney, plural } from '@/lib/format';
import { useStore, type ThemePref } from '@/store';
import { font, radius, useTheme } from '@/theme';

export default function Settings() {
  const { c } = useTheme();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const txCount = useStore((s) => s.transactions.length);
  const catCount = useStore((s) => s.categories.length);
  const accCount = useStore((s) => s.accounts.length);
  const loadDemo = useStore((s) => s.loadDemo);
  const resetAll = useStore((s) => s.resetAll);
  const [budget, setBudget] = useState(settings.monthlyBudget ? String(settings.monthlyBudget) : '');
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const exportData = () => {
    const { transactions, categories, accounts, settings } = useStore.getState();
    const json = JSON.stringify({ transactions, categories, accounts, settings }, null, 2);
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      a.download = `moneta-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } else {
      Share.share({ message: json });
    }
  };

  return (
    <Screen>
      <T v="h1" style={{ marginBottom: 16 }}>
        Профиль
      </T>

      <Group title="Данные">
        <Row icon="wallet" color="#7B6CFF" title="Счета" value={`${accCount}`} onPress={() => router.push('/accounts')} />
        <Row icon="pricetags" color="#FF6FB1" title="Категории" value={`${catCount}`} onPress={() => router.push('/categories')} />
        <Row
          icon="cash"
          color="#5BE3A4"
          title="Валюта"
          value={`${settings.currency} · ${currencySymbol(settings.currency)}`}
          onPress={() => setCurrencyOpen((v) => !v)}
          chevron={currencyOpen ? 'chevron-down' : 'chevron-forward'}
        />
        {currencyOpen ? (
          <View style={[styles.currencyList, { borderTopColor: c.border }]}>
            {currencies.map((cur) => {
              const active = cur.code === settings.currency;
              return (
                <Pressable
                  key={cur.code}
                  onPress={() => {
                    haptic('select');
                    update({ currency: cur.code });
                    setCurrencyOpen(false);
                  }}
                  style={[styles.currency, { backgroundColor: active ? c.surfaceAlt : 'transparent' }]}
                >
                  <T v="h3" style={{ width: 36 }}>
                    {cur.symbol}
                  </T>
                  <T style={{ flex: 1 }}>{cur.name}</T>
                  {active ? <Ionicons name="checkmark" size={18} color={c.income} /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Group>

      <Group title="Бюджет">
        <View style={styles.budget}>
          <IconBubble icon="flame" color="#FFB547" size={38} />
          <View style={{ flex: 1 }}>
            <T v="h3">Лимит на месяц</T>
            <T v="caption" muted>
              {settings.monthlyBudget ? formatMoney(settings.monthlyBudget, settings.currency) : 'Не задан'}
            </T>
          </View>
          <TextInput
            value={budget}
            onChangeText={(v) => setBudget(v.replace(/\D/g, ''))}
            onBlur={() => update({ monthlyBudget: parseInt(budget, 10) || 0 })}
            onSubmitEditing={() => update({ monthlyBudget: parseInt(budget, 10) || 0 })}
            placeholder="0"
            placeholderTextColor={c.textFaint}
            keyboardType="number-pad"
            returnKeyType="done"
            style={[styles.budgetInput, { color: c.text, backgroundColor: c.surfaceAlt }]}
          />
        </View>
      </Group>

      <Group title="Оформление">
        <View style={{ padding: 12 }}>
          <Segmented<ThemePref>
            value={settings.theme}
            onChange={(theme) => update({ theme })}
            options={[
              { key: 'system', label: 'Авто' },
              { key: 'dark', label: 'Тёмная' },
              { key: 'light', label: 'Светлая' },
            ]}
            style={{ backgroundColor: c.surfaceAlt }}
          />
        </View>
      </Group>

      <Group title="Прочее">
        <Row icon="sparkles" color="#C8F55A" title="Загрузить демо-данные" onPress={loadDemo} />
        <Row icon="cloud-download" color="#4FC3F7" title="Экспорт в JSON" value={`${txCount} ${plural(txCount, ['запись', 'записи', 'записей'])}`} onPress={exportData} />
        <Row
          icon="refresh"
          color={c.expense}
          title="Сбросить всё"
          danger
          onPress={() =>
            confirm('Сбросить все данные?', 'Операции, счета и категории вернутся к исходному состоянию.', () => {
              resetAll();
              setBudget('');
            })
          }
        />
      </Group>

      <T v="caption" faint style={{ textAlign: 'center', marginTop: 28 }}>
        Moneta 1.0 · данные хранятся только на этом устройстве
      </T>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: 20 }}>
      <T v="label" muted style={{ marginBottom: 8, marginLeft: 4 }}>
        {title}
      </T>
      <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  color,
  title,
  value,
  onPress,
  danger,
  chevron = 'chevron-forward',
}: {
  icon: string;
  color: string;
  title: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  chevron?: string;
}) {
  const { c } = useTheme();
  return (
    <Tap scale={0.98} onPress={onPress} style={styles.row}>
      <IconBubble icon={icon} color={color} size={38} />
      <T v="h3" style={{ flex: 1 }} color={danger ? c.expense : c.text}>
        {title}
      </T>
      {value ? (
        <T v="label" muted>
          {value}
        </T>
      ) : null}
      <Ionicons name={chevron as any} size={18} color={c.textFaint} />
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 12 },
  currencyList: { borderTopWidth: StyleSheet.hairlineWidth, padding: 8 },
  currency: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 46, borderRadius: 12 },
  budget: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  budgetInput: { width: 120, height: 44, borderRadius: 12, paddingHorizontal: 12, textAlign: 'right', fontFamily: font.bold, fontSize: 16, outlineStyle: 'none' } as any,
});
