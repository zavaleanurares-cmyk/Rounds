import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Button } from '@/ui';
import { Field } from '@/features/forms/Field';
import { space } from '@/design/tokens';

/** C-11 · Join crew. */
export default function JoinCrew() {
  const router = useRouter();
  const [code, setCode] = useState('');
  return (
    <Sheet
      title="Join a crew"
      onClose={() => router.back()}
      footer={<Button title="Join" disabled={code.length < 4} onPress={() => router.back()} />}
    >
      <View style={{ paddingBottom: space.md }}>
        <Field label="Crew code or link" value={code} onChangeText={setCode} autoCapitalize="none" />
      </View>
    </Sheet>
  );
}
