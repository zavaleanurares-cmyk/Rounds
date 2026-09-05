import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';
import { color } from '@/design/tokens';

/**
 * Icons are named after the exact SF Symbol they stand in for, so replacing them
 * with `Image(systemName:)` in a native surface is a rename, not a redraw.
 * All are drawn on a 24pt grid, stroke 1.75, round caps and joins.
 */
export type IconName =
  | 'chevron.right' | 'chevron.left' | 'chevron.down' | 'xmark' | 'plus' | 'minus'
  | 'moon.stars' | 'map' | 'person.2' | 'person.crop.circle' | 'drop'
  | 'arrow.clockwise' | 'car' | 'checkmark.shield' | 'bubble.left' | 'location'
  | 'calendar' | 'wineglass' | 'chart.bar' | 'qrcode.viewfinder' | 'sparkles'
  | 'exclamationmark.triangle' | 'flame' | 'slider.horizontal.3' | 'gearshape'
  | 'bell' | 'lock' | 'square.and.arrow.up' | 'trash' | 'checkmark'
  | 'magnifyingglass' | 'photo' | 'creditcard' | 'hand.raised' | 'flag'
  | 'bolt' | 'figure.walk' | 'clock' | 'arrow.up.right' | 'ellipsis'
  | 'phone' | 'house' | 'star' | 'heart' | 'eye.slash' | 'arrow.left';

const S = 24;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color: c = color.label.primary, strokeWidth = 1.75 }: IconProps) {
  const p = {
    stroke: c,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ position: 'relative' }}>
      {glyph(name, p, c)}
    </Svg>
  );
}

type P = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: 'none';
};

function glyph(name: IconName, p: P, c: string): React.ReactNode {
  switch (name) {
    case 'chevron.right': return <Path {...p} d="M9 5l7 7-7 7" />;
    case 'chevron.left': return <Path {...p} d="M15 5l-7 7 7 7" />;
    case 'chevron.down': return <Path {...p} d="M5 9l7 7 7-7" />;
    case 'arrow.left': return <><Line {...p} x1="20" y1="12" x2="4" y2="12" /><Path {...p} d="M10 6l-6 6 6 6" /></>;
    case 'xmark': return <><Line {...p} x1="5" y1="5" x2="19" y2="19" /><Line {...p} x1="19" y1="5" x2="5" y2="19" /></>;
    case 'plus': return <><Line {...p} x1="12" y1="4" x2="12" y2="20" /><Line {...p} x1="4" y1="12" x2="20" y2="12" /></>;
    case 'minus': return <Line {...p} x1="4" y1="12" x2="20" y2="12" />;
    case 'checkmark': return <Path {...p} d="M4 13l5 5L20 6" />;
    case 'moon.stars':
      return <><Path {...p} d="M20 14.5A8.2 8.2 0 019.6 4 8.5 8.5 0 1020 14.5z" /><Path {...p} d="M17 3.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" /></>;
    case 'map': return <><Path {...p} d="M9 4L3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z" /><Line {...p} x1="9" y1="4" x2="9" y2="17" /><Line {...p} x1="15" y1="7" x2="15" y2="20" /></>;
    case 'person.2': return <><Circle {...p} cx="9" cy="8" r="3.2" /><Path {...p} d="M3.2 19.5a6 6 0 0111.6 0" /><Path {...p} d="M16 5.6a3.2 3.2 0 010 4.9M17.6 14.4a6 6 0 013.2 5.1" /></>;
    case 'person.crop.circle': return <><Circle {...p} cx="12" cy="12" r="9" /><Circle {...p} cx="12" cy="10" r="3" /><Path {...p} d="M6.5 19a6 6 0 0111 0" /></>;
    case 'drop': return <Path {...p} d="M12 3.5c3.6 4.2 5.5 7 5.5 9.4a5.5 5.5 0 11-11 0c0-2.4 1.9-5.2 5.5-9.4z" />;
    case 'arrow.clockwise': return <><Path {...p} d="M20 12a8 8 0 11-2.6-5.9" /><Path {...p} d="M20 4v4.5h-4.5" /></>;
    case 'car': return <><Path {...p} d="M4 16v2.5M20 16v2.5" /><Path {...p} d="M3 15.5v-3l1.8-4.2A2 2 0 016.6 7h10.8a2 2 0 011.8 1.3L21 12.5v3z" /><Circle {...p} cx="7.2" cy="15.5" r="1.4" /><Circle {...p} cx="16.8" cy="15.5" r="1.4" /></>;
    case 'checkmark.shield': return <><Path {...p} d="M12 3l7 2.6v5.6c0 4.3-2.9 7.6-7 9.3-4.1-1.7-7-5-7-9.3V5.6L12 3z" /><Path {...p} d="M8.8 11.8l2.3 2.3 4.1-4.4" /></>;
    case 'bubble.left': return <Path {...p} d="M20 12.5c0 3.6-3.6 6.5-8 6.5a10 10 0 01-2.6-.35L5 21l1.1-3.3A6.6 6.6 0 014 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5z" />;
    case 'location': return <><Path {...p} d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 10-13 0C5.5 14.9 12 21 12 21z" /><Circle {...p} cx="12" cy="10.5" r="2.4" /></>;
    case 'calendar': return <><Rect {...p} x="3.5" y="5" width="17" height="15.5" rx="3.2" /><Line {...p} x1="3.5" y1="10" x2="20.5" y2="10" /><Line {...p} x1="8" y1="3" x2="8" y2="6.5" /><Line {...p} x1="16" y1="3" x2="16" y2="6.5" /></>;
    case 'wineglass': return <><Path {...p} d="M7.5 3h9l-.7 6.2a3.9 3.9 0 01-7.6 0L7.5 3z" /><Line {...p} x1="12" y1="13.5" x2="12" y2="20" /><Line {...p} x1="8.5" y1="20.5" x2="15.5" y2="20.5" /></>;
    case 'chart.bar': return <><Line {...p} x1="5.5" y1="20" x2="5.5" y2="13" /><Line {...p} x1="12" y1="20" x2="12" y2="7" /><Line {...p} x1="18.5" y1="20" x2="18.5" y2="10" /></>;
    case 'qrcode.viewfinder': return <><Path {...p} d="M4 8.5V6a2 2 0 012-2h2.5M15.5 4H18a2 2 0 012 2v2.5M20 15.5V18a2 2 0 01-2 2h-2.5M8.5 20H6a2 2 0 01-2-2v-2.5" /><Rect {...p} x="9" y="9" width="6" height="6" rx="1" /></>;
    case 'sparkles': return <><Path {...p} d="M12 3.5l1.6 3.9 3.9 1.6-3.9 1.6L12 14.5l-1.6-3.9L6.5 9l3.9-1.6z" /><Path {...p} d="M18 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" /></>;
    case 'exclamationmark.triangle': return <><Path {...p} d="M12 4.2l8.4 14.6H3.6L12 4.2z" /><Line {...p} x1="12" y1="9.5" x2="12" y2="13.5" /><Circle cx="12" cy="16.2" r="0.95" fill={c} /></>;
    case 'flame': return <Path {...p} d="M13 3c.6 3-1.4 4.3-2.9 5.9C8.4 10.7 7 12.3 7 14.6A5 5 0 0017 15c0-2.6-1.4-4-2.4-5.6-.4 1-1.2 1.6-2.1 1.9.6-2.2 1.1-5.4.5-8.3z" />;
    case 'slider.horizontal.3': return <><Line {...p} x1="3.5" y1="7" x2="20.5" y2="7" /><Line {...p} x1="3.5" y1="12" x2="20.5" y2="12" /><Line {...p} x1="3.5" y1="17" x2="20.5" y2="17" /><Circle {...p} cx="9" cy="7" r="2" /><Circle {...p} cx="15.5" cy="12" r="2" /><Circle {...p} cx="7.5" cy="17" r="2" /></>;
    case 'gearshape': return <><Circle {...p} cx="12" cy="12" r="3.2" /><Path {...p} d="M12 3.5l1.2 2.2 2.5-.4.6 2.4 2.2 1.2-1.3 2.2 1.3 2.2-2.2 1.2-.6 2.4-2.5-.4L12 20.5l-1.2-2.2-2.5.4-.6-2.4L5.5 15l1.3-2.2L5.5 10.6l2.2-1.2.6-2.4 2.5.4z" /></>;
    case 'bell': return <><Path {...p} d="M6.5 10a5.5 5.5 0 0111 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" /><Path {...p} d="M10.2 18.5a2 2 0 003.6 0" /></>;
    case 'lock': return <><Rect {...p} x="5" y="10.5" width="14" height="9.5" rx="3" /><Path {...p} d="M8.2 10.5V8a3.8 3.8 0 017.6 0v2.5" /></>;
    case 'square.and.arrow.up': return <><Path {...p} d="M12 3.5v11" /><Path {...p} d="M8.5 7L12 3.5 15.5 7" /><Path {...p} d="M6.5 11H5.5a1.5 1.5 0 00-1.5 1.5v6.5A1.5 1.5 0 005.5 20.5h13a1.5 1.5 0 001.5-1.5v-6.5a1.5 1.5 0 00-1.5-1.5h-1" /></>;
    case 'trash': return <><Path {...p} d="M4.5 6.5h15" /><Path {...p} d="M9 6.5V4.8A1.3 1.3 0 0110.3 3.5h3.4A1.3 1.3 0 0115 4.8v1.7" /><Path {...p} d="M6.5 6.5l.9 12.2A1.8 1.8 0 009.2 20.5h5.6a1.8 1.8 0 001.8-1.8l.9-12.2" /></>;
    case 'magnifyingglass': return <><Circle {...p} cx="11" cy="11" r="6.5" /><Line {...p} x1="15.8" y1="15.8" x2="20.5" y2="20.5" /></>;
    case 'photo': return <><Rect {...p} x="3.5" y="5" width="17" height="14" rx="3" /><Circle {...p} cx="8.8" cy="10" r="1.6" /><Path {...p} d="M4.5 17l4.6-4.4 3.4 3.1 2.8-2.4 4.2 3.7" /></>;
    case 'creditcard': return <><Rect {...p} x="3" y="5.5" width="18" height="13" rx="3" /><Line {...p} x1="3" y1="10" x2="21" y2="10" /><Line {...p} x1="7" y1="14.5" x2="11" y2="14.5" /></>;
    case 'hand.raised': return <Path {...p} d="M9 11V5.2a1.4 1.4 0 012.8 0V11m0-.5V4.4a1.4 1.4 0 012.8 0V11m0-.4V6.2a1.4 1.4 0 012.8 0V14c0 3.6-2.4 6.5-6 6.5S8 18.4 7 16.3L5.5 13a1.4 1.4 0 012.3-1.5L9 13" />;
    case 'flag': return <><Line {...p} x1="6" y1="3.5" x2="6" y2="20.5" /><Path {...p} d="M6 4.5h10.5l-2 3.8 2 3.8H6z" /></>;
    case 'bolt': return <Path {...p} d="M13.5 3L6 13.2h4.6L10 21l7.5-10.2h-4.6z" />;
    case 'figure.walk': return <><Circle {...p} cx="13" cy="4.5" r="1.8" /><Path {...p} d="M13.5 8l-3 3 1.5 3.5L14 21M10.5 11L7 13M11.5 14L8.5 21" /></>;
    case 'clock': return <><Circle {...p} cx="12" cy="12" r="8.5" /><Path {...p} d="M12 7v5.3l3.4 2" /></>;
    case 'arrow.up.right': return <><Line {...p} x1="6" y1="18" x2="18" y2="6" /><Path {...p} d="M9 6h9v9" /></>;
    case 'ellipsis': return <><Circle cx="5.5" cy="12" r="1.5" fill={c} /><Circle cx="12" cy="12" r="1.5" fill={c} /><Circle cx="18.5" cy="12" r="1.5" fill={c} /></>;
    case 'phone': return <Path {...p} d="M6.2 3.5h3l1.5 3.8-2 1.4a11 11 0 006.6 6.6l1.4-2 3.8 1.5v3a1.7 1.7 0 01-1.9 1.7C11 19 5 13 4.5 5.4A1.7 1.7 0 016.2 3.5z" />;
    case 'house': return <><Path {...p} d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19z" /><Path {...p} d="M9.5 20.5v-6h5v6" /></>;
    case 'star': return <Path {...p} d="M12 3.8l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 10l5.9-.9z" />;
    case 'heart': return <Path {...p} d="M12 20.2S3.8 15 3.8 9.4A4.4 4.4 0 0112 7.2a4.4 4.4 0 018.2 2.2c0 5.6-8.2 10.8-8.2 10.8z" />;
    case 'eye.slash': return <><Path {...p} d="M4 12s3.2-5.5 8-5.5c1.3 0 2.5.4 3.5 1M20 12s-3.2 5.5-8 5.5c-1.4 0-2.6-.4-3.7-1.1" /><Line {...p} x1="4.5" y1="4.5" x2="19.5" y2="19.5" /></>;
    default: return <Circle {...p} cx="12" cy="12" r="8" />;
  }
}
