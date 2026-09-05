import { Redirect } from 'expo-router';

/** Everything routes through the AuthGate in `_layout.tsx`. */
export default function Index() {
  return <Redirect href="/(tabs)/tonight" />;
}
