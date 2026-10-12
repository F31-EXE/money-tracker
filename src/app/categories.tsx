import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ModalScreen } from '@/components/ModalScreen';
import { confirm } from '@/components/TransactionEditor';
import { Button, Card, IconBubble, Segmented, T, Tap, haptic } from '@/components/ui';
import { categoryColors, categoryIcons } from '@/store/defaults';
import { useStore, type Category, type TxType } from '@/store';
import { font, useTheme } from '@/theme';

type Draft = Omit<Category, 'id'> & { id?: string };

export default function Categories() {
  const { c } = useTheme();
  const categories = useStore((s) => s.categories);
  const saveCategory = useStore((s) => s.saveCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const [type, setType] = useState<TxType>('expense');
  const [draft, setDraft] = useState<Draft | null>(null);

  const list = categories.filter((x) => x.type === type);
  const isFallback = (id?: string) => id === 'other-exp' || id === 'other-inc';

  return (
    <ModalScreen title="Категории">
      <Segmented
        value={type}
        onChange={(t) => {
          setType(t);
          setDraft(null);
        }}
        options={[
          { key: 'expense', label: 'Расходы' },
          { key: 'income', label: 'Доходы' },
        ]}
      />

      {draft ? (
        <Card style={{ marginTop: 16, gap: 16 }}>
          <View style={styles.previewRow}>
            <IconBubble icon={draft.icon} color={draft.color} size={52} solid />
            <TextInput
              autoFocus
              value={draft.name}
              onChangeText={(name) => setDraft({ ...draft, name })}
              placeholder="Название"
              placeholderTextColor={c.textFaint}
              maxLength={24}
              style={[styles.input, { color: c.text, backgroundColor: c.surfaceAlt }]}
            />
          </View>
          <View style={styles.swatches}>
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
          <View style={styles.icons}>
            {categoryIcons.map((ic) => (
              <Pressable
                key={ic}
                onPress={() => {
                  haptic('select');
                  setDraft({ ...draft, icon: ic });
                }}
                style={[styles.iconCell, { backgroundColor: draft.icon === ic ? draft.color + '30' : c.surfaceAlt }]}
              >
                <Ionicons name={ic as any} size={20} color={draft.icon === ic ? draft.color : c.textMuted} />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Отмена" kind="ghost" onPress={() => setDraft(null)} style={{ flex: 1, backgroundColor: c.surfaceAlt }} />
            <Button
              title="Сохранить"
              disabled={!draft.name.trim()}
              onPress={() => {
                saveCategory({ ...draft, name: draft.name.trim() });
                setDraft(null);
              }}
              style={{ flex: 1 }}
            />
          </View>
          {draft.id && !isFallback(draft.id) ? (
            <Button
              title="Удалить категорию"
              kind="danger"
              icon="trash-outline"
              onPress={() =>
                confirm('Удалить категорию?', 'Операции из неё переместятся в «Другое».', () => {
                  deleteCategory(draft.id!);
                  setDraft(null);
                })
              }
            />
          ) : null}
        </Card>
      ) : (
        <Button
          title="Новая категория"
          icon="add"
          style={{ marginTop: 16 }}
          onPress={() => setDraft({ name: '', icon: 'heart', color: categoryColors[0], type })}
        />
      )}

      <View style={styles.grid}>
        {list.map((cat) => (
          <Tap
            key={cat.id}
            onPress={() => setDraft({ ...cat })}
            style={[styles.tile, { backgroundColor: c.surface, borderColor: draft?.id === cat.id ? cat.color : 'transparent' }]}
          >
            <IconBubble icon={cat.icon} color={cat.color} size={40} />
            <T v="label" numberOfLines={1}>
              {cat.name}
            </T>
          </Tap>
        ))}
      </View>
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, height: 52, borderRadius: 14, paddingHorizontal: 14, fontFamily: font.semibold, fontSize: 16, outlineStyle: 'none' } as any,
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2.5 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  tile: { width: '31%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 8, borderRadius: 20, borderWidth: 1.5 },
});
