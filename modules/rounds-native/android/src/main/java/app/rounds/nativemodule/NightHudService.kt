package app.rounds.nativemodule

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * X-01 · The Android HUD.
 *
 * iOS gets a Live Activity; Android gets an ongoing foreground-service
 * notification with `CATEGORY_STOPWATCH`, a progress arc and two action
 * buttons. Different anatomy, identical promise: the night is on your lock
 * screen and you can log from it.
 *
 * Ends on session end or a twelve-hour ceiling. An ongoing notification still
 * sitting there at noon the next day is experienced as the app being broken.
 */
class NightHudService : Service() {

    companion object {
        const val CHANNEL_ID = "rounds.night"
        const val NOTIFICATION_ID = 4201
        const val ACTION_START = "app.rounds.HUD_START"
        const val ACTION_UPDATE = "app.rounds.HUD_UPDATE"
        const val ACTION_STOP = "app.rounds.HUD_STOP"
        const val EXTRA_PAYLOAD = "payload"
        private const val CEILING_MS = 12L * 60 * 60 * 1000

        fun start(context: Context, payload: String) {
            val intent = Intent(context, NightHudService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_PAYLOAD, payload)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun update(context: Context, payload: String) {
            context.startService(Intent(context, NightHudService::class.java).apply {
                action = ACTION_UPDATE
                putExtra(EXTRA_PAYLOAD, payload)
            })
        }

        fun stop(context: Context) {
            context.startService(Intent(context, NightHudService::class.java).apply {
                action = ACTION_STOP
            })
        }
    }

    private var receiver: BroadcastReceiver? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createChannel()
        // The action buttons write to the shared store and refresh the
        // notification. They never start an Activity: opening the app to log a
        // drink is the exact friction this surface exists to remove.
        receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                val drinkId = intent.getStringExtra(QuickLogReceiver.EXTRA_DRINK) ?: return
                RoundsShared.appendPending(
                    context, RoundsShared.PendingLog.create(drinkId, "notification")
                )
                RoundsShared.hud(context)?.let { refresh(it, optimisticExtra = 1) }
            }
        }
        val filter = IntentFilter(QuickLogReceiver.ACTION_LOG)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(receiver, filter)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopForegroundCompat()
                stopSelf()
                return START_NOT_STICKY
            }
            else -> {
                val payload = intent?.getStringExtra(EXTRA_PAYLOAD)
                    ?: RoundsShared.hud(this)
                    ?: return START_NOT_STICKY
                RoundsShared.writeHud(this, payload)
                val hud = RoundsHud.parse(payload) ?: return START_NOT_STICKY

                if (System.currentTimeMillis() - hud.startedAt > CEILING_MS) {
                    stopForegroundCompat()
                    stopSelf()
                    return START_NOT_STICKY
                }
                startForeground(NOTIFICATION_ID, build(hud, 0))
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        receiver?.let { runCatching { unregisterReceiver(it) } }
        super.onDestroy()
    }

    private fun refresh(payload: String, optimisticExtra: Int) {
        val hud = RoundsHud.parse(payload) ?: return
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, build(hud, optimisticExtra))
    }

    /**
     * The count shown can run one ahead of the app's own state for a moment:
     * the tap is recorded here and the JS layer only learns about it on the next
     * foreground. Showing the optimistic number is right — the user pressed the
     * button, and a count that does not move is a button that looks broken.
     */
    private fun build(hud: RoundsHud, optimisticExtra: Int): Notification {
        val drinks = hud.drinks + optimisticExtra + RoundsShared.pending(this).size

        val open = packageManager.getLaunchIntentForPackage(packageName)?.let {
            PendingIntent.getActivity(
                this, 0, it,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        }

        val title = hud.paceWord
        val text = buildString {
            hud.venue?.let { append(it).append(" · ") }
            append("out ").append(hud.elapsedLabel).append(" · ")
            append(if (drinks == 1) "1 drink" else "$drinks drinks")
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_myplaces)
            .setContentTitle(title)
            .setContentText(text)
            .setColor(hud.accentColor)
            .setColorized(true)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)                       // never interrupt a live night
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setProgress(6, drinks.coerceAtMost(6), false)
            .setContentIntent(open)
            .addAction(
                android.R.drawable.ic_menu_add, "Water",
                QuickLogReceiver.pendingIntent(this, "water", 1)
            )
            .addAction(
                android.R.drawable.ic_menu_rotate,
                if (hud.lastDrinkName != null) "Same again" else "Log",
                QuickLogReceiver.pendingIntent(this, hud.lastDrinkId ?: "beer-pint", 2)
            )
            .build()
    }

    private fun stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION") stopForeground(true)
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        manager.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Tonight", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Your pace and one-tap logging while a night is running."
                setShowBadge(false)
                enableVibration(false)
            }
        )
    }
}
