package app.rounds.nativemodule

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * X-03 / X-04 / X-05 · Home screen widgets.
 *
 * 2×2 the weekly goal or live pace, 4×2 the plan / who's out / live pace with an
 * interactive "Same again", 4×4 the year heatmap.
 *
 * Built with RemoteViews rather than Glance so the module stays free of a
 * Compose dependency; the layouts live in `res/layout` in the app target.
 */
class RoundsWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        val payload = RoundsShared.widget(context)?.let { runCatching { JSONObject(it) }.getOrNull() }
        ids.forEach { id -> manager.updateAppWidget(id, build(context, payload)) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, RoundsWidget::class.java))
            onUpdate(context, manager, ids)
        }
    }

    private fun build(context: Context, payload: JSONObject?): RemoteViews {
        val pkg = context.packageName
        val views = RemoteViews(pkg, resId(context, "layout", "widget_rounds"))

        val live = payload?.optBoolean("live") ?: false
        val paceWord = payload?.optString("paceWord")?.takeIf { it.isNotEmpty() && it != "null" }
        val drinks = payload?.optInt("drinks") ?: 0
        val weeklyPct = payload?.optDouble("weeklyPct") ?: 0.0
        val nextPlan = payload?.optString("nextPlanTitle")?.takeIf { it.isNotEmpty() && it != "null" }
        val lastDrinkId = payload?.optString("lastDrinkId")?.takeIf { it.isNotEmpty() && it != "null" }
            ?: "beer-pint"

        val headline = when {
            live -> paceWord ?: "EASY"
            nextPlan != null -> nextPlan
            else -> "Nothing planned"
        }
        val sub = when {
            live -> if (drinks == 1) "1 logged" else "$drinks logged"
            nextPlan != null -> "Next up"
            else -> "${(weeklyPct * 100).toInt()}% of your weekly goal"
        }

        views.setTextViewText(resId(context, "id", "widget_headline"), headline)
        views.setTextViewText(resId(context, "id", "widget_sub"), sub)
        views.setProgressBar(resId(context, "id", "widget_progress"), 6, drinks.coerceAtMost(6), false)
        views.setViewVisibility(
            resId(context, "id", "widget_progress"),
            if (live) View.VISIBLE else View.GONE
        )

        // Interactive since Android 12 — a widget you have to tap through to the
        // app to use is a shortcut, not a surface.
        views.setOnClickPendingIntent(
            resId(context, "id", "widget_water"),
            QuickLogReceiver.pendingIntent(context, "water", 11)
        )
        views.setOnClickPendingIntent(
            resId(context, "id", "widget_again"),
            QuickLogReceiver.pendingIntent(context, lastDrinkId, 12)
        )
        context.packageManager.getLaunchIntentForPackage(pkg)?.let {
            views.setOnClickPendingIntent(
                resId(context, "id", "widget_root"),
                PendingIntent.getActivity(
                    context, 13, it,
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
                )
            )
        }
        return views
    }

    private fun resId(context: Context, type: String, name: String): Int =
        context.resources.getIdentifier(name, type, context.packageName)

    companion object {
        const val ACTION_REFRESH = "app.rounds.WIDGET_REFRESH"

        fun refresh(context: Context) {
            context.sendBroadcast(Intent(context, RoundsWidget::class.java).apply {
                action = ACTION_REFRESH
                setPackage(context.packageName)
            })
        }
    }
}
