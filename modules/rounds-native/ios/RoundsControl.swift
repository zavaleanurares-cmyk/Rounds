import SwiftUI
#if canImport(WidgetKit)
import WidgetKit
import AppIntents

/// X-06 · Control Center control (iOS 18+).
///
/// "Log a drink" one swipe from anywhere, without unlocking. Pre-filled with the
/// last drink, because the median case is another of the same.
@available(iOS 18.0, *)
struct RoundsQuickLogControl: ControlWidget {
  var body: some ControlWidgetConfiguration {
    StaticControlConfiguration(kind: "RoundsQuickLog") {
      ControlWidgetButton(action: LogSameAgainIntent(drinkId: RoundsControlState.lastDrinkId)) {
        Label(RoundsControlState.label, systemImage: "plus.circle.fill")
      }
    }
    .displayName("Log a drink")
    .description("Logs the same again, without opening ROUNDS.")
  }
}

enum RoundsControlState {
  private static var defaults: UserDefaults? { UserDefaults(suiteName: RoundsShared.appGroup) }
  static var lastDrinkId: String { defaults?.string(forKey: "rounds.tile.drinkId") ?? "beer-pint" }
  static var label: String { defaults?.string(forKey: "rounds.tile.label") ?? "Log a drink" }
}
#endif
