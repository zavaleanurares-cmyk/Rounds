package app.rounds.nativemodule

import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi

/**
 * X-06 · Quick Settings tile — the Android counterpart to the iOS 18 Control
 * Center control.
 *
 * One pull down from anywhere, logs the same again. Pre-filled with the last
 * drink because the median case is another of the same.
 */
@RequiresApi(Build.VERSION_CODES.N)
class RoundsTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        qsTile?.apply {
            label = RoundsShared.tileLabel(applicationContext)
            state = Tile.STATE_ACTIVE
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                subtitle = "One tap"
            }
            icon = Icon.createWithResource(applicationContext, android.R.drawable.ic_menu_add)
            updateTile()
        }
    }

    override fun onClick() {
        super.onClick()
        val drinkId = RoundsShared.tileDrinkId(applicationContext)
        RoundsShared.appendPending(
            applicationContext,
            RoundsShared.PendingLog.create(drinkId, "tile")
        )
        // Deliberately does NOT unlock or open the app. The whole value of the
        // tile is that it works from the lock screen without doing either.
        qsTile?.apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) subtitle = "Logged"
            updateTile()
        }
    }
}
