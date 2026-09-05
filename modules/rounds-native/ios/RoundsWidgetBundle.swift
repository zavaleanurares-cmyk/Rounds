import SwiftUI
import WidgetKit

/**
 The extension's entry point.

 A WidgetKit extension is a separate executable and needs an `@main` type the
 way an app needs one. Without this file the five surfaces are just types that
 nothing instantiates: the extension will not launch, and depending on the SDK
 it will not link either.

 Everything the extension offers is listed here, and only here — if a widget is
 not in this bundle it does not exist to the system, no matter that it compiles.

 `RoundsQuickLogControl` is a Control Center control, which is iOS 18 and later.
 The rest are iOS 17. The availability check keeps one deployment target for the
 whole extension rather than splitting the bundle.
 */
@main
struct RoundsWidgetBundle: WidgetBundle {
  var body: some Widget {
    // The Lock Screen and Dynamic Island surface for a live night.
    RoundsLiveActivity()

    // The three home-screen families.
    RoundsSmallWidget()
    RoundsMediumWidget()
    RoundsLargeWidget()

    // Control Center, iOS 18+.
    if #available(iOS 18.0, *) {
      RoundsQuickLogControl()
    }
  }
}
