import Foundation

/// The shared container every out-of-app surface writes into.
///
/// A Live Activity button, a widget, a Control Center control and the watch all
/// run in separate processes from the app, and none of them can reach the JS
/// offline queue while the app is suspended. So they append here — an App Group
/// UserDefaults — and the app drains it on next foreground.
///
/// The critical detail: **the surface mints the UUID**, not the app. That is
/// what makes the whole thing idempotent. Tapping "Same again" three times on a
/// Lock Screen with no network produces three rows with three ids; a drain that
/// runs twice produces no duplicates at all.
public enum RoundsShared {
  public static let appGroup = "group.app.rounds.client"

  private static var defaults: UserDefaults? { UserDefaults(suiteName: appGroup) }

  private static let pendingKey = "rounds.pending"
  private static let widgetKey  = "rounds.widget"
  private static let hudKey     = "rounds.hud"

  public struct PendingLog: Codable {
    public let id: String
    public let drinkId: String
    public let at: Double        // epoch ms, to match the JS layer exactly
    public let source: String

    public init(drinkId: String, source: String) {
      self.id = UUID().uuidString.lowercased()
      self.drinkId = drinkId
      self.at = Date().timeIntervalSince1970 * 1000
      self.source = source
    }
  }

  /// Append a log from any surface. Never blocks, never reaches the network.
  public static func appendPending(_ log: PendingLog) {
    guard let defaults else { return }
    var all = pending()
    all.append(log)
    // Bounded: a phone that has been offline for a week should not be able to
    // hand the app ten thousand rows on a single foreground.
    if all.count > 500 { all = Array(all.suffix(500)) }
    if let data = try? JSONEncoder().encode(all) {
      defaults.set(data, forKey: pendingKey)
    }
  }

  public static func pending() -> [PendingLog] {
    guard let defaults, let data = defaults.data(forKey: pendingKey) else { return [] }
    return (try? JSONDecoder().decode([PendingLog].self, from: data)) ?? []
  }

  /// Called only after the app has handed the rows to the queue.
  public static func clearPending() {
    defaults?.removeObject(forKey: pendingKey)
  }

  public static func writeWidgetPayload(_ json: String) {
    defaults?.set(json, forKey: widgetKey)
  }

  public static func widgetPayload() -> String? {
    defaults?.string(forKey: widgetKey)
  }

  public static func writeHud(_ json: String) { defaults?.set(json, forKey: hudKey) }
  public static func hud() -> String? { defaults?.string(forKey: hudKey) }
}

/// The HUD's state, shared between the app, the Live Activity and the watch.
///
/// Note what is NOT in here: the ‰ estimate. A Live Activity sits on a Lock
/// Screen anyone can see over your shoulder, and that is not a place for a
/// number that invites the one interpretation the product must never invite.
/// The surfaces carry the state word and the count.
public struct RoundsHudState: Codable, Hashable {
  public let sessionId: String
  public let venue: String?
  public let startedAt: Double
  public let drinks: Int
  public let paceState: String   // easy | steady | quick | slow_down
  public let paceWord: String    // EASY | STEADY | QUICK | SLOW DOWN
  public let lastDrinkId: String?
  public let lastDrinkName: String?
  public let spendMinor: Int
  public let currency: String

  public var elapsedMinutes: Int {
    max(0, Int((Date().timeIntervalSince1970 * 1000 - startedAt) / 60000))
  }

  public var accentHex: String {
    switch paceState {
    case "steady":    return "#30D158"
    case "quick":     return "#FF9F0A"
    case "slow_down": return "#FF453A"
    default:          return "#7CB3FF"
    }
  }
}
