package app.rounds.nativemodule

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * X-02 · The one-tap log, on Android.
 *
 * This is the feature the product depends on. Logging a drink should not mean
 * unlocking a phone, finding an app, opening a sheet and searching a catalogue
 * — in a loud dark room, three drinks in. Every drink tracker in history has
 * died on that interaction.
 *
 * The receiver never starts an Activity and never touches the network. It
 * appends one row, with a UUID it mints itself, to the shared store. Target:
 * ≥40% of all logs made outside the app, instrumented from day one.
 */
class QuickLogReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_LOG = "app.rounds.QUICK_LOG"
        const val EXTRA_DRINK = "drinkId"
        const val EXTRA_SOURCE = "source"

        fun pendingIntent(context: Context, drinkId: String, requestCode: Int): PendingIntent {
            val intent = Intent(context, QuickLogReceiver::class.java).apply {
                action = ACTION_LOG
                setPackage(context.packageName)
                putExtra(EXTRA_DRINK, drinkId)
                putExtra(EXTRA_SOURCE, "notification")
            }
            return PendingIntent.getBroadcast(
                context, requestCode, intent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_LOG) return
        val drinkId = intent.getStringExtra(EXTRA_DRINK) ?: return
        val source = intent.getStringExtra(EXTRA_SOURCE) ?: "notification"

        RoundsShared.appendPending(context, RoundsShared.PendingLog.create(drinkId, source))

        // Let the ongoing notification move its count immediately. A button that
        // does nothing visible is a button people press twice.
        context.sendBroadcast(Intent(ACTION_LOG).apply {
            setPackage(context.packageName)
            putExtra(EXTRA_DRINK, drinkId)
        })
    }
}
