import { Stack } from 'expo-router';
import { color } from '@/design/tokens';

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg.canvas } }} />;
}
