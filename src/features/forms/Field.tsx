import React from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '@/ui';
import { color, radius, space } from '@/design/tokens';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
  hint,
  error,
  onBlur,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  multiline?: boolean;
  hint?: string;
  error?: string;
  /** For fields that commit on leaving rather than on every keystroke. */
  onBlur?: () => void;
}) {
  return (
    <View>
      <Text variant="sectionHeader" tone="tertiary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={color.label.quaternary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        accessibilityLabel={label}
        style={{
          marginTop: space.sm,
          minHeight: multiline ? 84 : 48,
          borderRadius: radius.control,
          backgroundColor: color.surface.secondary,
          borderWidth: 1,
          borderColor: error ? color.safety : color.separator,
          paddingHorizontal: space.md,
          paddingTop: multiline ? space.m : 0,
          textAlignVertical: multiline ? 'top' : 'center',
          color: color.label.primary,
          fontSize: 17,
        }}
      />
      {error ? (
        <Text variant="footnote" color={color.safety} style={{ marginTop: 4 }}>{error}</Text>
      ) : hint ? (
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 4 }}>{hint}</Text>
      ) : null}
    </View>
  );
}
