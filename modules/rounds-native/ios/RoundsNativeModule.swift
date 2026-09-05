import ExpoModulesCore
#if canImport(ActivityKit)
import ActivityKit
#endif
#if canImport(WidgetKit)
import WidgetKit
#endif

/// The bridge. Everything the JS `src/native` interface calls lands here.
///
/// Every method is defensive on purpose: a device on iOS 15, a simulator without
/// the widget target, or a user who has disabled Live Activities must all get a
/// clean `false` rather than an exception. A failing HUD is a cosmetic problem;
/// a failing HUD that crashes the app is not.
public class RoundsNativeModule: Module {
  #if canImport(ActivityKit)
  @available(iOS 16.2, *)
  private static var activity: Activity<RoundsNightAttributes>? {
    get { _activity as? Activity<RoundsNightAttributes> }
    set { _activity = newValue }
  }
  private static var _activity: Any?

  /// The Activity's APNs token, hex-encoded.
  ///
  /// ActivityKit delivers this on an async sequence some time AFTER
  /// `Activity.request` returns — not with it. Capturing it in a task started
  /// at request time, and letting JS poll for it, is the shape that actually
  /// works; awaiting it inside `startHud` would delay the HUD appearing on the
  /// Lock Screen for the sake of a value nothing needs in that instant.
  private static var pushToken: String?
  private static var tokenTask: Task<Void, Never>?

  @available(iOS 16.2, *)
  private static func watchPushToken(_ activity: Activity<RoundsNightAttributes>) {
    tokenTask?.cancel()
    pushToken = nil
    tokenTask = Task {
      for await data in activity.pushTokenUpdates {
        // The token can be reissued while the Activity is alive; the newest one
        // wins, and JS re-registers it.
        Self.pushToken = data.map { String(format: "%02x", $0) }.joined()
      }
    }
  }
  #endif

  public func definition() -> ModuleDefinition {
    Name("RoundsNative")

    // ------------------------------------------------------------ X-01 HUD
    AsyncFunction("startHud") { (payload: String) -> Bool in
      guard let hud = Self.decode(payload) else { return false }
      RoundsShared.writeHud(payload)

      #if canImport(ActivityKit)
      guard #available(iOS 16.2, *), ActivityAuthorizationInfo().areActivitiesEnabled else { return false }
      // Re-starting on an existing session updates rather than stacking a
      // second Live Activity on the Lock Screen.
      if let existing = Self.activity, existing.attributes.sessionId == hud.sessionId {
        await existing.update(using: .init(from: hud))
        Self.watchPushToken(existing)
        return true
      }
      await Self.endAllActivities()
      do {
        let activity = try Activity.request(
          attributes: RoundsNightAttributes(sessionId: hud.sessionId),
          contentState: .init(from: hud),
          pushType: .token   // other participants' logs arrive by push
        )
        Self.activity = activity
        Self.watchPushToken(activity)
        return true
      } catch { return false }
      #else
      return false
      #endif
    }

    AsyncFunction("updateHud") { (payload: String) -> Bool in
      guard let hud = Self.decode(payload) else { return false }
      RoundsShared.writeHud(payload)
      #if canImport(ActivityKit)
      guard #available(iOS 16.2, *), let activity = Self.activity else { return false }
      await activity.update(using: .init(from: hud))
      return true
      #else
      return false
      #endif
    }

    AsyncFunction("endHud") { () -> Bool in
      #if canImport(ActivityKit)
      guard #available(iOS 16.2, *) else { return false }
      Self.tokenTask?.cancel()
      Self.tokenTask = nil
      Self.pushToken = nil
      await Self.endAllActivities()
      Self.activity = nil
      return true
      #else
      return false
      #endif
    }

    /// The running Activity's push token, or nil if there isn't one yet.
    ///
    /// Returns nil rather than waiting. JS polls for a few seconds after
    /// starting the HUD; every other caller wants the answer it has now.
    AsyncFunction("hudPushToken") { () -> String? in
      #if canImport(ActivityKit)
      guard #available(iOS 16.2, *) else { return nil }
      return Self.pushToken
      #else
      return nil
      #endif
    }

    // ------------------------------------------------------ X-02 the drain
    //
    // Read, hand back, THEN clear. If the app is killed between the read and
    // the clear the rows are drained twice — which is harmless, because they
    // carry the UUID the surface minted and the queue is idempotent on it.
    AsyncFunction("drainPending") { () -> String in
      let pending = RoundsShared.pending()
      guard !pending.isEmpty else { return "[]" }
      RoundsShared.clearPending()
      let data = (try? JSONEncoder().encode(pending)) ?? Data("[]".utf8)
      return String(data: data, encoding: .utf8) ?? "[]"
    }

    // ------------------------------------------------------- X-03/04/05 widgets
    AsyncFunction("publishWidget") { (payload: String) -> Bool in
      RoundsShared.writeWidgetPayload(payload)
      #if canImport(WidgetKit)
      if #available(iOS 14.0, *) { WidgetCenter.shared.reloadAllTimelines() }
      #endif
      return true
    }

    // ------------------------------------------------------------ X-06 tile
    AsyncFunction("setQuickTile") { (payload: String) -> Bool in
      guard
        let data = payload.data(using: .utf8),
        let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
        let defaults = UserDefaults(suiteName: RoundsShared.appGroup)
      else { return false }
      defaults.set(obj["drinkId"] as? String ?? "beer-pint", forKey: "rounds.tile.drinkId")
      defaults.set(obj["label"] as? String ?? "Log a drink", forKey: "rounds.tile.label")
      #if canImport(WidgetKit)
      if #available(iOS 18.0, *) { ControlCenter.shared.reloadAllControls() }
      #endif
      return true
    }

    // ----------------------------------------------------------- X-07 voice
    AsyncFunction("donateShortcuts") { (payload: String) -> Bool in
      guard let defaults = UserDefaults(suiteName: RoundsShared.appGroup) else { return false }
      defaults.set(payload, forKey: "rounds.shortcuts")
      // AppShortcutsProvider handles the phrases; this keeps the parameter
      // fresh so "log a drink" repeats what you actually drink.
      return true
    }

    // ----------------------------------------------------------- X-08 watch
    AsyncFunction("updateWatch") { (payload: String) -> Bool in
      RoundsShared.writeHud(payload)
      // WCSession transfer lives in the watch companion target.
      return true
    }
  }

  private static func decode(_ payload: String) -> RoundsHudState? {
    guard let data = payload.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(RoundsHudState.self, from: data)
  }

  #if canImport(ActivityKit)
  @available(iOS 16.2, *)
  private static func endAllActivities() async {
    for activity in Activity<RoundsNightAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }
  #endif
}
