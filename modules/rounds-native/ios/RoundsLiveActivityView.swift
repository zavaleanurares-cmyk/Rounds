import SwiftUI
#if canImport(WidgetKit) && canImport(ActivityKit)
import WidgetKit
import ActivityKit

/// X-01 · The Live Activity and Dynamic Island presentations.
///
/// The design rules from the app hold here too, because this IS the app as far
/// as the user is concerned:
///   · the pace state WORD is the primary readout, never a number
///   · the ‰ estimate does not appear on a Lock Screen at all
///   · exactly one tinted control, and it is the one you actually press
@available(iOS 16.2, *)
public struct RoundsLiveActivity: Widget {
  public init() {}

  public var body: some WidgetConfiguration {
    ActivityConfiguration(for: RoundsNightAttributes.self) { context in
      LockScreenView(state: context.state)
        .activityBackgroundTint(Color(hex: "#0E1017"))
        .activitySystemActionForegroundColor(Color(hex: "#7CB3FF"))
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          PaceRingCompact(state: context.state, size: 46)
        }
        DynamicIslandExpandedRegion(.trailing) {
          VStack(alignment: .trailing, spacing: 2) {
            Text(context.state.paceWord)
              .font(.custom("BarlowCondensed-SemiBold", size: 22))
              .foregroundStyle(Color(hex: accentHex(context.state.paceState)))
            Text("\(context.state.drinks) logged")
              .font(.caption2)
              .foregroundStyle(.secondary)
          }
        }
        DynamicIslandExpandedRegion(.center) {
          if let venue = context.state.venue {
            Text(venue).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
          }
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack(spacing: 10) {
            IntentButton(title: "Water", systemImage: "drop",
                         intent: LogWaterIntent(), tinted: false)
            IntentButton(title: sameAgainTitle(context.state), systemImage: "arrow.clockwise",
                         intent: LogSameAgainIntent(drinkId: "beer-pint"), tinted: true)
          }
        }
      } compactLeading: {
        PaceRingCompact(state: context.state, size: 18)
      } compactTrailing: {
        Text("\(context.state.drinks)")
          .font(.custom("BarlowCondensed-SemiBold", size: 15))
          .foregroundStyle(Color(hex: accentHex(context.state.paceState)))
      } minimal: {
        PaceRingCompact(state: context.state, size: 18)
      }
      .keylineTint(Color(hex: accentHex(context.state.paceState)))
    }
  }

  private func sameAgainTitle(_ s: RoundsNightAttributes.ContentState) -> String {
    s.lastDrinkName.map { "Same again" } ?? "Log a drink"
  }
}

@available(iOS 16.2, *)
private struct LockScreenView: View {
  let state: RoundsNightAttributes.ContentState

  var body: some View {
    HStack(spacing: 14) {
      PaceRingCompact(state: state, size: 54)

      VStack(alignment: .leading, spacing: 3) {
        Text(state.paceWord)
          .font(.custom("BarlowCondensed-SemiBold", size: 26))
          .foregroundStyle(Color(hex: accentHex(state.paceState)))
        Text(subtitle)
          .font(.footnote)
          .foregroundStyle(.secondary)
          .lineLimit(1)
      }

      Spacer(minLength: 6)

      VStack(spacing: 8) {
        IntentButton(title: "Water", systemImage: "drop",
                     intent: LogWaterIntent(), tinted: false)
        IntentButton(title: "Same again", systemImage: "arrow.clockwise",
                     intent: LogSameAgainIntent(drinkId: "beer-pint"), tinted: true)
      }
    }
    .padding(14)
  }

  private var subtitle: String {
    let mins = max(0, Int((Date().timeIntervalSince1970 * 1000 - state.startedAt) / 60000))
    let elapsed = mins >= 60 ? "\(mins / 60)h\(String(format: "%02d", mins % 60))" : "\(mins)m"
    let count = state.drinks == 1 ? "1 drink" : "\(state.drinks) drinks"
    if let venue = state.venue { return "\(venue) · out \(elapsed) · \(count)" }
    return "out \(elapsed) · \(count)"
  }
}

/// Six segments, filled by drinks logged — the same ring as the app, drawn
/// small. It is the one shape the product is recognisable by.
@available(iOS 16.2, *)
private struct PaceRingCompact: View {
  let state: RoundsNightAttributes.ContentState
  let size: CGFloat

  var body: some View {
    ZStack {
      ForEach(0..<6, id: \.self) { i in
        Circle()
          .trim(from: CGFloat(i) / 6 + 0.008, to: CGFloat(i + 1) / 6 - 0.008)
          .stroke(
            i < min(state.drinks, 6)
              ? Color(hex: accentHex(state.paceState))
              : Color.white.opacity(0.16),
            style: StrokeStyle(lineWidth: size * 0.11, lineCap: .round)
          )
          .rotationEffect(.degrees(-90))
      }
    }
    .frame(width: size, height: size)
    .accessibilityLabel("Pace: \(state.paceWord). \(state.drinks) drinks logged.")
  }
}

@available(iOS 16.4, *)
private struct IntentButton<I: LiveActivityIntent>: View {
  let title: String
  let systemImage: String
  let intent: I
  let tinted: Bool

  var body: some View {
    Button(intent: intent) {
      Label(title, systemImage: systemImage)
        .font(.caption.weight(.semibold))
        .frame(maxWidth: .infinity)
    }
    .tint(tinted ? Color(hex: "#3B82F6") : Color.white.opacity(0.12))
    .buttonStyle(.borderedProminent)
    .controlSize(.small)
  }
}

private func accentHex(_ paceState: String) -> String {
  switch paceState {
  case "steady":    return "#30D158"
  case "quick":     return "#FF9F0A"
  case "slow_down": return "#FF453A"
  default:          return "#7CB3FF"
  }
}

extension Color {
  init(hex: String) {
    let s = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
    var v: UInt64 = 0
    Scanner(string: s).scanHexInt64(&v)
    self.init(
      .sRGB,
      red: Double((v >> 16) & 0xFF) / 255,
      green: Double((v >> 8) & 0xFF) / 255,
      blue: Double(v & 0xFF) / 255,
      opacity: 1
    )
  }
}
#endif
