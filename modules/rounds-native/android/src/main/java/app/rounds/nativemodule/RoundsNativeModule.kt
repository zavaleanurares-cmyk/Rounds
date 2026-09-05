package app.rounds.nativemodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject

/**
 * The bridge. Everything the JS `src/native` interface calls lands here.
 *
 * Every method is defensive on purpose: a device with notifications denied, a
 * launcher with no widget, or an OEM that kills foreground services must all get
 * a clean `false` rather than an exception. A failing HUD is a cosmetic problem;
 * a failing HUD that crashes the app is not.
 */
class RoundsNativeModule : Module() {

    private val context get() = requireNotNull(appContext.reactContext) { "no context" }

    override fun definition() = ModuleDefinition {
        Name("RoundsNative")

        // ------------------------------------------------------------ X-01 HUD
        AsyncFunction("startHud") { payload: String ->
            runCatching {
                RoundsShared.writeHud(context, payload)
                NightHudService.start(context, payload)
                true
            }.getOrDefault(false)
        }

        AsyncFunction("updateHud") { payload: String ->
            runCatching {
                RoundsShared.writeHud(context, payload)
                NightHudService.update(context, payload)
                true
            }.getOrDefault(false)
        }

        AsyncFunction("endHud") {
            runCatching {
                NightHudService.stop(context)
                true
            }.getOrDefault(false)
        }

        // ------------------------------------------------------ X-02 the drain
        //
        // Read, hand back, THEN clear. If the process dies between the read and
        // the clear the rows are drained twice — harmless, because they carry
        // the UUID the surface minted and the queue is idempotent on it.
        AsyncFunction("drainPending") {
            val pending = RoundsShared.pending(context)
            if (pending.isEmpty()) return@AsyncFunction "[]"
            RoundsShared.clearPending(context)
            val array = JSONArray()
            pending.forEach { array.put(it.toJson()) }
            array.toString()
        }

        // -------------------------------------------------- X-03/04/05 widgets
        AsyncFunction("publishWidget") { payload: String ->
            runCatching {
                RoundsShared.writeWidget(context, payload)
                RoundsWidget.refresh(context)
                true
            }.getOrDefault(false)
        }

        // ------------------------------------------------------------ X-06 tile
        AsyncFunction("setQuickTile") { payload: String ->
            runCatching {
                val o = JSONObject(payload)
                RoundsShared.writeTile(
                    context,
                    o.optString("drinkId", "beer-pint"),
                    o.optString("label", "Log a drink")
                )
                true
            }.getOrDefault(false)
        }

        // ----------------------------------------------------------- X-07 voice
        AsyncFunction("donateShortcuts") { payload: String ->
            // App Actions are declared in shortcuts.xml; this keeps the
            // parameter fresh so "log a drink" repeats what you actually drink.
            runCatching {
                val o = JSONObject(payload)
                RoundsShared.writeTile(
                    context,
                    o.optString("lastDrinkId", "beer-pint"),
                    "Log ${o.optString("lastDrinkName", "a drink")}"
                )
                true
            }.getOrDefault(false)
        }

        // ----------------------------------------------------------- X-08 watch
        AsyncFunction("updateWatch") { payload: String ->
            runCatching {
                RoundsShared.writeHud(context, payload)
                true
            }.getOrDefault(false)
        }
    }
}
