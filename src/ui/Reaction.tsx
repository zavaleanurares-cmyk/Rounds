import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G, Line } from 'react-native-svg';
import { color } from '@/design/tokens';

/**
 * Reactions in a live room, drawn rather than picked from the emoji keyboard.
 *
 * Five is deliberate. An open emoji picker in a shared night is a moderation
 * surface — it is how you end up with a report queue for a feature nobody asked
 * for. A fixed, drawn set keeps the warmth and removes the problem.
 */
export type ReactionKind = 'cheers' | 'fire' | 'laugh' | 'heart' | 'eyes';

export const REACTIONS: ReactionKind[] = ['cheers', 'fire', 'laugh', 'heart', 'eyes'];

export const REACTION_LABEL: Record<ReactionKind, string> = {
  cheers: 'Cheers',
  fire: 'Going off',
  laugh: 'Laughing',
  heart: 'Love it',
  eyes: 'Watching',
};

const TINT: Record<ReactionKind, string> = {
  cheers: '#F6C74A',
  fire: '#FF7A18',
  laugh: '#FBD97A',
  heart: '#F43F5E',
  eyes: '#7CB3FF',
};

export function Reaction({ kind, size = 22 }: { kind: ReactionKind; size?: number }) {
  const tint = TINT[kind];
  const s = {
    stroke: tint,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {kind === 'cheers' ? (
          // two glasses meeting
          <G>
            <Path {...s} d="M4 4.5h6l-.6 4.4a2.4 2.4 0 01-4.8 0z" />
            <Path {...s} d="M7 11.4V19M5 20h4" />
            <Path {...s} d="M14 4.5h6l-.6 4.4a2.4 2.4 0 01-4.8 0z" />
            <Path {...s} d="M17 11.4V19M15 20h4" />
            <Line {...s} x1="10.6" y1="3" x2="12.2" y2="1.6" strokeWidth={1.4} />
            <Line {...s} x1="13.4" y1="3" x2="11.8" y2="1.6" strokeWidth={1.4} />
          </G>
        ) : kind === 'fire' ? (
          <Path {...s} fill={tint} fillOpacity={0.22}
            d="M13.5 2c.7 3.4-1.6 4.9-3.3 6.7C8.5 10.5 7 12.3 7 14.8A5 5 0 0017 15.3c0-2.9-1.6-4.5-2.7-6.3-.5 1.1-1.4 1.8-2.4 2.1.7-2.5 1.3-6.1.6-9.1z" />
        ) : kind === 'laugh' ? (
          <G>
            <Circle {...s} cx="12" cy="12" r="9" />
            <Path {...s} d="M7.5 10.2 Q9.5 8.4 11.5 10.2" />
            <Path {...s} d="M12.5 10.2 Q14.5 8.4 16.5 10.2" />
            <Path {...s} fill={tint} fillOpacity={0.2} d="M7 14 Q12 20 17 14 Z" />
          </G>
        ) : kind === 'heart' ? (
          <Path {...s} fill={tint} fillOpacity={0.24}
            d="M12 20.2S3.8 15 3.8 9.4A4.4 4.4 0 0112 7.2a4.4 4.4 0 018.2 2.2c0 5.6-8.2 10.8-8.2 10.8z" />
        ) : (
          <G>
            <Path {...s} d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
            <Circle cx="12" cy="12" r="3" fill={tint} />
          </G>
        )}
      </Svg>
    </View>
  );
}
