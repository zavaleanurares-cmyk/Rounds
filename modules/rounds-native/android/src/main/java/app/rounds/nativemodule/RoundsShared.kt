package app.rounds.nativemodule

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/**
 * The shared store every out-of-app surface writes into.
 *
 * A notification action, a Glance widget and a Quick Settings tile all run
 * outside the React Native process — none of them can reach the JS offline
 * queue while the app is dead. So they append here, and the app drains it on
 * next foreground.
 *
 * The critical detail: **the surface mints the UUID**, not the app. That is
 * what makes the whole thing idempotent. Tapping "Same again" three times on a
 * notification with no network produces three rows with three ids; a drain that
 * runs twice produces no duplicates at all.
 */
object RoundsShared {
    private const val PREFS = "rounds_shared"
    private const val KEY_PENDING = "rounds.pending"
    private const val KEY_WIDGET = "rounds.widget"
    private const val KEY_HUD = "rounds.hud"
    private const val KEY_TILE_DRINK = "rounds.tile.drinkId"
    private const val KEY_TILE_LABEL = "rounds.tile.label"

    /** A phone offline for a week must not hand the app ten thousand rows. */
    private const val MAX_PENDING = 500

    private fun prefs(context: Context): SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    data class PendingLog(val id: String, val drinkId: String, val at: Long, val source: String) {
        fun toJson(): JSONObject = JSONObject()
            .put("id", id).put("drinkId", drinkId).put("at", at).put("source", source)

        companion object {
            fun create(drinkId: String, source: String) =
                PendingLog(UUID.randomUUID().toString(), drinkId, System.currentTimeMillis(), source)

            fun fromJson(o: JSONObject) = PendingLog(
                o.optString("id"), o.optString("drinkId"),
                o.optLong("at"), o.optString("source")
            )
        }
    }

    @Synchronized
    fun appendPending(context: Context, log: PendingLog) {
        val all = pending(context).toMutableList()
        all.add(log)
        val bounded = if (all.size > MAX_PENDING) all.takeLast(MAX_PENDING) else all
        val array = JSONArray()
        bounded.forEach { array.put(it.toJson()) }
        prefs(context).edit().putString(KEY_PENDING, array.toString()).apply()
    }

    fun pending(context: Context): List<PendingLog> {
        val raw = prefs(context).getString(KEY_PENDING, null) ?: return emptyList()
        return runCatching {
            val array = JSONArray(raw)
            (0 until array.length()).map { PendingLog.fromJson(array.getJSONObject(it)) }
        }.getOrDefault(emptyList())
    }

    /** Called only after the app has handed the rows to the queue. */
    fun clearPending(context: Context) {
        prefs(context).edit().remove(KEY_PENDING).apply()
    }

    fun writeWidget(context: Context, json: String) {
        prefs(context).edit().putString(KEY_WIDGET, json).apply()
    }
    fun widget(context: Context): String? = prefs(context).getString(KEY_WIDGET, null)

    fun writeHud(context: Context, json: String) {
        prefs(context).edit().putString(KEY_HUD, json).apply()
    }
    fun hud(context: Context): String? = prefs(context).getString(KEY_HUD, null)

    fun writeTile(context: Context, drinkId: String, label: String) {
        prefs(context).edit()
            .putString(KEY_TILE_DRINK, drinkId)
            .putString(KEY_TILE_LABEL, label)
            .apply()
    }
    fun tileDrinkId(context: Context): String =
        prefs(context).getString(KEY_TILE_DRINK, "beer-pint") ?: "beer-pint"
    fun tileLabel(context: Context): String =
        prefs(context).getString(KEY_TILE_LABEL, "Log a drink") ?: "Log a drink"
}

/**
 * The HUD state. Mirrors `RoundsHudState` in Swift and `HudState` in TypeScript.
 *
 * Note what is NOT here: the ‰ estimate. An ongoing notification sits on a lock
 * screen anyone can see, and that is not a place for a number that invites the
 * one interpretation the product must never invite.
 */
data class RoundsHud(
    val sessionId: String,
    val venue: String?,
    val startedAt: Long,
    val drinks: Int,
    val paceState: String,
    val paceWord: String,
    val lastDrinkId: String?,
    val lastDrinkName: String?,
) {
    val accentColor: Int
        get() = when (paceState) {
            "steady" -> 0xFF30D158.toInt()
            "quick" -> 0xFFFF9F0A.toInt()
            "slow_down" -> 0xFFFF453A.toInt()
            else -> 0xFF7CB3FF.toInt()
        }

    val elapsedLabel: String
        get() {
            val mins = ((System.currentTimeMillis() - startedAt) / 60000).coerceAtLeast(0)
            return if (mins >= 60) "${mins / 60}h${(mins % 60).toString().padStart(2, '0')}" else "${mins}m"
        }

    companion object {
        fun parse(json: String): RoundsHud? = runCatching {
            val o = JSONObject(json)
            RoundsHud(
                sessionId = o.getString("sessionId"),
                venue = o.optString("venue").takeIf { it.isNotEmpty() && it != "null" },
                startedAt = o.optLong("startedAt"),
                drinks = o.optInt("drinks"),
                paceState = o.optString("paceState", "easy"),
                paceWord = o.optString("paceWord", "EASY"),
                lastDrinkId = o.optString("lastDrinkId").takeIf { it.isNotEmpty() && it != "null" },
                lastDrinkName = o.optString("lastDrinkName").takeIf { it.isNotEmpty() && it != "null" },
            )
        }.getOrNull()
    }
}
