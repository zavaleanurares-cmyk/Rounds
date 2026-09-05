import Foundation
#if canImport(AppIntents)
import AppIntents

/// X-02 · The one-tap log, as an App Intent.
///
/// This is the feature the product depends on: logging a drink without
/// unlocking, finding the app, opening a sheet and searching a catalogue — in a
/// loud dark room, three drinks in. Every drink tracker in history has died on
/// that interaction, and this is the answer to it.
///
/// It runs in the Live Activity's process, so it CANNOT touch the JS queue. It
/// appends to the shared container with a UUID it mints itself, and the app
/// drains it later. Target: ≥40% of all logs made outside the app.
@available(iOS 16.4, *)
public struct LogSameAgainIntent: LiveActivityIntent {
  public static var title: LocalizedStringResource = "Same again"
  public static var description = IntentDescription("Logs the same drink as last time.")

  @Parameter(title: "Drink") public var drinkId: String

  public init() { self.drinkId = "beer-pint" }
  public init(drinkId: String) { self.drinkId = drinkId }

  public func perform() async throws -> some IntentResult {
    RoundsShared.appendPending(.init(drinkId: drinkId, source: "live_activity"))
    return .result()
  }
}

@available(iOS 16.4, *)
public struct LogWaterIntent: LiveActivityIntent {
  public static var title: LocalizedStringResource = "Water"
  public static var description = IntentDescription("Logs a glass of water.")

  public init() {}

  public func perform() async throws -> some IntentResult {
    RoundsShared.appendPending(.init(drinkId: "water", source: "live_activity"))
    return .result()
  }
}

/// X-07 · Voice. "Log a beer" · "Start a night" · "How many have I had?" ·
/// "I'm home safe".
@available(iOS 16.0, *)
public struct LogDrinkVoiceIntent: AppIntent {
  public static var title: LocalizedStringResource = "Log a drink"
  public static var openAppWhenRun = false

  @Parameter(title: "Drink") public var drinkId: String
  public init() { self.drinkId = "beer-pint" }

  public func perform() async throws -> some IntentResult & ProvidesDialog {
    RoundsShared.appendPending(.init(drinkId: drinkId, source: "voice"))
    return .result(dialog: "Logged.")
  }
}

@available(iOS 16.0, *)
public struct HowManyIntent: AppIntent {
  public static var title: LocalizedStringResource = "How many have I had?"
  public static var openAppWhenRun = false
  public init() {}

  public func perform() async throws -> some IntentResult & ProvidesDialog {
    guard
      let json = RoundsShared.hud(),
      let data = json.data(using: .utf8),
      let hud = try? JSONDecoder().decode(RoundsHudState.self, from: data)
    else {
      return .result(dialog: "You haven't started a night.")
    }
    let pending = RoundsShared.pending().count
    let total = hud.drinks + pending
    // Answers with the count and the state word. Never the estimate — a voice
    // assistant saying a per-mille figure out loud in a bar is exactly the
    // failure mode the product is designed around.
    return .result(dialog: "\(total) so far, and you're going \(hud.paceWord.lowercased()).")
  }
}

@available(iOS 16.0, *)
public struct HomeSafeIntent: AppIntent {
  public static var title: LocalizedStringResource = "I'm home safe"
  public static var openAppWhenRun = false
  public init() {}

  public func perform() async throws -> some IntentResult & ProvidesDialog {
    UserDefaults(suiteName: RoundsShared.appGroup)?.set(
      Date().timeIntervalSince1970 * 1000, forKey: "rounds.safeHomeAt")
    return .result(dialog: "Good. Sleep well.")
  }
}

@available(iOS 16.0, *)
public struct RoundsShortcuts: AppShortcutsProvider {
  public static var appShortcuts: [AppShortcut] {
    AppShortcut(intent: LogDrinkVoiceIntent(),
                phrases: ["Log a drink in \(.applicationName)", "Log a beer in \(.applicationName)"],
                shortTitle: "Log a drink", systemImageName: "plus.circle")
    AppShortcut(intent: HowManyIntent(),
                phrases: ["How many have I had in \(.applicationName)"],
                shortTitle: "How many", systemImageName: "chart.bar")
    AppShortcut(intent: HomeSafeIntent(),
                phrases: ["I'm home safe in \(.applicationName)"],
                shortTitle: "Home safe", systemImageName: "checkmark.shield")
  }
}
#endif
