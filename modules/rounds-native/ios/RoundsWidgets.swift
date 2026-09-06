import SwiftUI
#if canImport(WidgetKit)
import WidgetKit
// The medium widget's "Same again" is Button(intent:), which comes from
// AppIntents — the same import RoundsLiveActivityView was missing.
import AppIntents

/// X-03 / X-04 / X-05 · Home Screen widgets.
///
/// Small: the weekly goal ring, or live pace during a night.
/// Medium: tonight's plan, who's out, or live pace — with an interactive
///         "Same again" on iOS 17+.
/// Large: the year heatmap.
///
/// The medium widget's button is the point. A widget you have to tap through to
/// the app to use is a shortcut, not a surface.
struct RoundsWidgetPayload: Codable {
  var live: Bool
  var paceWord: String?
  var drinks: Int
  var weeklyPct: Double
  var nextPlanTitle: String?
  var nextPlanAt: Double?
  var friendsOut: Int
  var lastDrinkId: String?
  var lastDrinkName: String?
  var heatmap: [Int]
  var accentHex: String

  static let placeholder = RoundsWidgetPayload(
    live: false, paceWord: nil, drinks: 0, weeklyPct: 0.4,
    nextPlanTitle: "Friday, properly", nextPlanAt: nil, friendsOut: 2,
    lastDrinkId: "beer-pint", lastDrinkName: "Pint of lager",
    heatmap: Array(repeating: 0, count: 91), accentHex: "#3B82F6")

  static func load() -> RoundsWidgetPayload {
    guard
      let json = RoundsShared.widgetPayload(),
      let data = json.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(RoundsWidgetPayload.self, from: data)
    else { return .placeholder }
    return decoded
  }
}

struct RoundsEntry: TimelineEntry {
  let date: Date
  let payload: RoundsWidgetPayload
}

struct RoundsProvider: TimelineProvider {
  func placeholder(in context: Context) -> RoundsEntry {
    RoundsEntry(date: Date(), payload: .placeholder)
  }
  func getSnapshot(in context: Context, completion: @escaping (RoundsEntry) -> Void) {
    completion(RoundsEntry(date: Date(), payload: .load()))
  }
  func getTimeline(in context: Context, completion: @escaping (Timeline<RoundsEntry>) -> Void) {
    let entry = RoundsEntry(date: Date(), payload: .load())
    // During a live night the widget is refreshed by the app on every log, so
    // the timeline only needs a slow safety net.
    let next = Date().addingTimeInterval(entry.payload.live ? 600 : 3600)
    completion(Timeline(entries: [entry], policy: .after(next)))
  }
}

@available(iOS 17.0, *)
struct RoundsSmallWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "RoundsSmall", provider: RoundsProvider()) { entry in
      SmallView(p: entry.payload)
        .containerBackground(Color(hex: "#0E1017"), for: .widget)
    }
    .configurationDisplayName("Tonight")
    .description("Your pace during a night, your weekly goal the rest of the time.")
    .supportedFamilies([.systemSmall])
  }
}

@available(iOS 17.0, *)
struct RoundsMediumWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "RoundsMedium", provider: RoundsProvider()) { entry in
      MediumView(p: entry.payload)
        .containerBackground(Color(hex: "#0E1017"), for: .widget)
    }
    .configurationDisplayName("Your night")
    .description("Log without opening the app.")
    .supportedFamilies([.systemMedium])
  }
}

@available(iOS 17.0, *)
struct RoundsLargeWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "RoundsLarge", provider: RoundsProvider()) { entry in
      LargeView(p: entry.payload)
        .containerBackground(Color(hex: "#0E1017"), for: .widget)
    }
    .configurationDisplayName("Your year")
    .description("Every night, as a heatmap.")
    .supportedFamilies([.systemLarge])
  }
}

@available(iOS 17.0, *)
private struct SmallView: View {
  let p: RoundsWidgetPayload
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(p.live ? "TONIGHT" : "THIS WEEK")
        .font(.system(size: 10, weight: .semibold)).kerning(0.8)
        .foregroundStyle(.secondary)
      Spacer(minLength: 0)
      if p.live {
        Text(p.paceWord ?? "EASY")
          .font(.custom("BarlowCondensed-SemiBold", size: 30))
          .foregroundStyle(Color(hex: p.accentHex))
          .minimumScaleFactor(0.6).lineLimit(1)
        Text("\(p.drinks) logged").font(.caption2).foregroundStyle(.secondary)
      } else {
        GoalRing(pct: p.weeklyPct, accent: p.accentHex)
      }
    }
    .padding(4)
  }
}

@available(iOS 17.0, *)
private struct MediumView: View {
  let p: RoundsWidgetPayload
  var body: some View {
    HStack(spacing: 14) {
      VStack(alignment: .leading, spacing: 6) {
        if p.live {
          Text(p.paceWord ?? "EASY")
            .font(.custom("BarlowCondensed-SemiBold", size: 34))
            .foregroundStyle(Color(hex: p.accentHex))
          Text("\(p.drinks) logged").font(.caption).foregroundStyle(.secondary)
        } else if let title = p.nextPlanTitle {
          Text("NEXT UP").font(.system(size: 10, weight: .semibold)).kerning(0.8)
            .foregroundStyle(.secondary)
          Text(title).font(.headline).lineLimit(2)
          if p.friendsOut > 0 {
            Text("\(p.friendsOut) out right now").font(.caption2).foregroundStyle(.secondary)
          }
        } else {
          Text("Nothing planned").font(.headline)
          Text("Tap to start a night").font(.caption).foregroundStyle(.secondary)
        }
        Spacer(minLength: 0)
      }
      Spacer(minLength: 0)
      VStack(spacing: 8) {
        // Interactive on iOS 17+. This is the whole reason the widget exists.
        if #available(iOS 17.0, *) {
          Button(intent: LogWaterIntent()) {
            Label("Water", systemImage: "drop").font(.caption.weight(.semibold))
              .frame(maxWidth: .infinity)
          }
          .tint(Color.white.opacity(0.12)).buttonStyle(.borderedProminent).controlSize(.small)

          Button(intent: LogSameAgainIntent(drinkId: p.lastDrinkId ?? "beer-pint")) {
            Label(p.lastDrinkName == nil ? "Log" : "Same again", systemImage: "arrow.clockwise")
              .font(.caption.weight(.semibold)).frame(maxWidth: .infinity)
          }
          .tint(Color(hex: "#3B82F6")).buttonStyle(.borderedProminent).controlSize(.small)
        }
      }
      .frame(width: 116)
    }
    .padding(4)
  }
}

@available(iOS 17.0, *)
private struct LargeView: View {
  let p: RoundsWidgetPayload
  private let columns = Array(repeating: GridItem(.flexible(), spacing: 3), count: 13)

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text("LAST 91 NIGHTS")
        .font(.system(size: 10, weight: .semibold)).kerning(0.8).foregroundStyle(.secondary)
      LazyVGrid(columns: columns, spacing: 3) {
        ForEach(Array(p.heatmap.enumerated()), id: \.offset) { _, level in
          RoundedRectangle(cornerRadius: 2, style: .continuous)
            .fill(level == 0
                  ? Color.white.opacity(0.06)
                  : Color(hex: p.accentHex).opacity(0.22 + Double(level) * 0.19))
            .aspectRatio(1, contentMode: .fit)
        }
      }
      Spacer(minLength: 0)
      Text("Empty squares are dry nights.")
        .font(.caption2).foregroundStyle(.secondary)
    }
    .padding(4)
  }
}

private struct GoalRing: View {
  let pct: Double
  let accent: String
  var body: some View {
    ZStack {
      Circle().stroke(Color.white.opacity(0.09), lineWidth: 8)
      Circle().trim(from: 0, to: min(1, pct))
        .stroke(Color(hex: accent), style: StrokeStyle(lineWidth: 8, lineCap: .round))
        .rotationEffect(.degrees(-90))
      Text("\(Int(pct * 100))%")
        .font(.custom("BarlowCondensed-SemiBold", size: 20))
        .foregroundStyle(Color(hex: accent))
    }
    .accessibilityLabel("Weekly goal, \(Int(pct * 100)) percent")
  }
}
#endif
