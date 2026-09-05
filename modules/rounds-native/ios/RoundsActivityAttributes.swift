import Foundation
#if canImport(ActivityKit)
import ActivityKit

/// X-01 · The Live Activity.
///
/// Started on session start, ended on session end or a twelve-hour ceiling. The
/// ceiling matters: a Live Activity still sitting on the Lock Screen at noon the
/// next day is experienced as the app being broken, and it is the single most
/// common complaint about apps that ship one.
@available(iOS 16.1, *)
public struct RoundsNightAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public var drinks: Int
    public var paceWord: String
    public var paceState: String
    public var venue: String?
    public var startedAt: Double
    public var lastDrinkName: String?

    public init(from hud: RoundsHudState) {
      self.drinks = hud.drinks
      self.paceWord = hud.paceWord
      self.paceState = hud.paceState
      self.venue = hud.venue
      self.startedAt = hud.startedAt
      self.lastDrinkName = hud.lastDrinkName
    }
  }

  public var sessionId: String
  public init(sessionId: String) { self.sessionId = sessionId }
}
#endif
