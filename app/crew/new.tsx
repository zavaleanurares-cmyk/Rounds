import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Sheet, Button, Text, Icon } from '@/ui';
import { Field } from '@/features/forms/Field';
import { color, radius, space } from '@/design/tokens';

const MARKS = ['moon.stars', 'flame', 'sparkles', 'bolt', 'star', 'person.2'] as const;

/** C-10 · Create crew. */
export default function NewCrew() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<(typeof MARKS)[number]>('moon.stars');
  const [accentIndex, setAccentIndex] = useState(0);
  return (
    <Sheet
      title="New crew"
      onClose={() => router.back()}
      footer={<Button title="Create" disabled={name.trim().length < 2} onPress={() => router.back()} />}
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Vineri" autoCapitalize="words" />
        <Text variant="sectionHeader" tone="tertiary">MARK</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {MARKS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setIcon(m)}
              accessibilityRole="button"
              accessibilityLabel={m}
              accessibilityState={{ selected: icon === m }}
              style={{
                width: 48, height: 48, borderRadius: radius.control,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: icon === m ? 'rgba(59,130,246,0.22)' : color.surface.secondary,
                borderWidth: 1, borderColor: icon === m ? color.brand.tintLight : color.separator,
              }}
            >
              <Icon name={m} size={20} color={icon === m ? color.brand.tintLight : color.label.secondary} />
            </Pressable>
          ))}
        </View>

        <Text variant="sectionHeader" tone="tertiary">COLOUR</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {color.night.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => setAccentIndex(i)}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${i + 1}`}
              accessibilityState={{ selected: accentIndex === i }}
              style={{
                flex: 1, height: 44, borderRadius: radius.control, backgroundColor: c,
                opacity: accentIndex === i ? 1 : 0.35,
                borderWidth: accentIndex === i ? 2 : 0, borderColor: '#fff',
              }}
            />
          ))}
        </View>
      </View>
    </Sheet>
  );
}
