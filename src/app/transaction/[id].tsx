import { useLocalSearchParams } from 'expo-router';
import { TransactionEditor } from '@/components/TransactionEditor';
import { useStore } from '@/store';

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = useStore((s) => s.transactions.find((t) => t.id === id));
  // Briefly missing right after deletion, while the modal is closing.
  if (!tx) return null;
  return <TransactionEditor existing={tx} />;
}
