import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, EmptyState, StatTile, DrinkGlyph, Chip, useToast } from '@/ui';
import { useStore } from '@/data/store';
import {
  POUCHES, SMOKED, POUCH_MAX_MG, UNKNOWN_NICOTINE, asDrink, isNicotine, nicotineById,
  nicotineThisWeek, nicotineFreeDays, pouchMgThisWeek,
  type NicotineProduct,
} from '@/domain/nicotine';
import { nightKey } from '@/domain/nightKey';
import { useT, useFormat } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * Y-08 · Nicotine dashboard — module-gated, off by default.
 *
 * It doubles the conceptual surface for the ~70% of people who don't smoke, so
 * it only exists once somebody has asked for it in Settings.
 *
 * Two halves, and the asymmetry between them is the point. Pouches carry the
 * strength printed on their tin, because that is the unit the category is sold
 * in and stepping down through it is the thing worth supporting. Cigarettes
 * carry a brand and no number: EU Directive 2014/40 Article 13(1)(a) took
 * nicotine content off packs because — recital 25 — it misled people into
 * ranking brands by harm, and an app that put it back would be undoing that on
 * purpose. Full reasoning at the top of `domain/nicotine.ts`.
 */
export default function Nicotine() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { profile, logs, logNicotine, undoLast } = useStore();
  const toast = useToast();

  // Remembered per visit, not per account: the picker opens on whatever was
  // last logged, because somebody logging a fifth pouch is logging the same one.
  const lastNicotine = useMemo(
    () => [...logs].reverse().find((l) => !l.deleted && isNicotine(l)),
    [logs]
  );
  const [tab, setTab] = useState<'pouch' | 'smoked'>(() =>
    lastNicotine && nicotineById(lastNicotine.drinkId)?.format === 'pouch' ? 'pouch' : 'smoked'
  );

  const week = useMemo(() => nicotineThisWeek(logs), [logs]);
  const freeDays = useMemo(() => nicotineFreeDays(logs), [logs]);
  const weekMg = useMemo(() => pouchMgThisWeek(logs), [logs]);
  const tonight = useMemo(() => {
    const key = nightKey(Date.now());
    return logs
      .filter((l) => !l.deleted && isNicotine(l) && l.nightKey === key)
      .sort((a, b) => a.at - b.at);
  }, [logs]);

  /**
   * A tin labelled "ZYN 6" says 6, not 6.0.
   *
   * `f.number(x, 1)` sets `minimumFractionDigits`, so every whole strength grew
   * a false decimal — and the accessibility label read "6.0 milligrams" for a
   * product whose own packaging says 6. Only five of the twenty-two have a
   * decimal at all.
   */
  const mg = (value: number) => f.number(value, Number.isInteger(value) ? 0 : 1);

  const log = (product: NicotineProduct) => {
    logNicotine(product.id);
    toast.show({
      message: t('stats.nicotineLogged', { what: product.name }),
      actionLabel: t('ui.undo'),
      onAction: () => undoLast(),
    });
  };

  if (!profile?.modules.nicotine) {
    return (
      <Screen title={t('stats.nicotine')} back mood="calm">
        <EmptyState
          icon="flame"
          title={t('stats.nicotineOffTitle')}
          body={t('stats.nicotineOffBody')}
          actionLabel={t('stats.turnItOn')}
          onAction={() => router.push('/settings/modules')}
        />
      </Screen>
    );
  }

  const products = tab === 'pouch' ? POUCHES : SMOKED;

  return (
    <Screen title={t('stats.nicotine')} back mood="calm">
      {/*
        These were `f.number(0, 0)` — literal zeros, for as long as the module
        existed, because nothing could be logged at all.
      */}
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('stats.thisWeek')} value={f.number(week, 0)} caption={t('stats.logged')} icon="flame" />
        <StatTile
          label={t('stats.freeStreak')}
          value={f.number(freeDays, 0)}
          caption={t('stats.days')}
          tint={color.pace.steady}
          icon="checkmark.shield"
        />
      </View>

      {/*
        Milligrams, from pouches only. Shown when there are any rather than as a
        permanent zero beside a number it cannot include — a "total nicotine"
        that silently omitted every cigarette would be worse than not offering
        one.
      */}
      {weekMg > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('stats.pouchMgHeader')}</Text>
          <Text variant="numericLarge" style={{ marginTop: space.xs }}>
            {t('stats.pouchMgValue', { mg: mg(weekMg) })}
          </Text>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>
            {t('stats.pouchMgNote')}
          </Text>
        </Card>
      ) : null}

      <Card>
        <Text variant="subheadline" tone="secondary">{t('stats.nicotineNote')}</Text>
      </Card>

      {/*
        Logged from here rather than from the drink sheet. A cigarette between a
        Negroni and a pint is in the way of the seven people in ten who do not
        smoke — the same reason the module is off by default.
      */}
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip label={t('stats.pouches')} compact selected={tab === 'pouch'} onPress={() => setTab('pouch')} />
        <Chip label={t('stats.smoked')} compact selected={tab === 'smoked'} onPress={() => setTab('smoked')} />
      </View>

      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {products.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => log(p)}
              accessibilityRole="button"
              accessibilityLabel={
                p.mg === null
                  ? p.name
                  : t('stats.pouchLabel', { name: p.name, mg: mg(p.mg) })
              }
              style={{
                width: 96,
                alignItems: 'center',
                gap: 4,
                paddingVertical: space.m,
                borderRadius: radius.control,
                backgroundColor: color.surface.secondary,
              }}
            >
              <DrinkGlyph drink={asDrink(p)} size={30} />
              <Text variant="caption1" center numberOfLines={2}>{p.name}</Text>
              {p.mg !== null ? (
                <Text variant="caption2" tone="tertiary">{t('stats.mg', { mg: mg(p.mg) })}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
        {tab === 'pouch' ? (
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
            {t('stats.pouchCapNote', { max: POUCH_MAX_MG })}
          </Text>
        ) : (
          /*
            Says out loud why there is no number here. Without it the absence
            reads as an oversight, and somebody would eventually "fix" it.
          */
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
            {t('stats.noYieldNote')}
          </Text>
        )}
      </Card>

      {tonight.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('stats.nicotineTonight')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m, marginTop: space.m }}>
            {tonight.map((l) => {
              const product = nicotineById(l.drinkId);
              return (
                <View key={l.id} style={{ alignItems: 'center', gap: 2 }}>
                  {/* `cig-other` is the neutral one. Indexing the end of the
                      list reached the vape, so an unrecognised log — a legacy
                      id, or a product dropped from the catalogue — was drawn as
                      a device somebody may never have used. */}
                  <DrinkGlyph drink={asDrink(product ?? UNKNOWN_NICOTINE)} size={26} />
                  <Text variant="caption2" tone="quaternary">{f.clock(l.at)}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
