import { beretBuskingEffects, Effect, equip, getPower, Item, Modifier, numericModifier, print, retrieveItem, toEffect, toInt, toSlot } from "kolmafia";
import { $familiar, $item, $items, $skill, $slot, clamp, get, have, sum } from "libram";

export interface Busk {
  effects: Effect[];
  score: number;
  buskIndex: number;
  daRaw: number;
}

export interface BuskResult {
  score: number;
  busks: Busk[];
}

// eslint-disable-next-line libram/verify-constants
const beret = $item`prismatic beret`;
const taoMultiplier = have($skill`Tao of the Terrapin`) ? 2 : 1;

function scoreBusk(
  effects: Effect[],
  weightedModifiers: [Modifier, number][],
  uselessEffects: Effect[]
): number {
  const usefulEffects = effects.filter((ef) => !uselessEffects.includes(ef));

  return sum(
    weightedModifiers,
    ([modifier, weight]) => weight * sum(usefulEffects, (ef) => numericModifier(ef, modifier))
  );
}

const uselessEffects = Effect.all().filter((e) => have(e));

export function findTopBusks(
  weightedModifiers: [Modifier, number][]
): Busk | null {
  const buskUses = clamp(toInt(get("_beretBuskingUses")), 0, 5);
  if (buskUses >= 5) return null;

  const targetBuskIndex = buskUses;
  const bestBusks: Busk[] = [];

  for (const daRaw of beretDASum) {
    const rawEffects = beretBuskingEffects(daRaw, targetBuskIndex);
    const effects: Effect[] = Array.from(
      new Set(
        Object.keys(rawEffects)
          .map((name) => {
            try {
              return toEffect(name);
            } catch {
              print(`Invalid effect name: ${name}`, "red");
              return null;
            }
          })
          .filter((e): e is Effect => e !== null)
      )
    );

    const score = scoreBusk(effects, weightedModifiers, uselessEffects);
    bestBusks.push({
      daRaw,
      effects,
      score,
      buskIndex: targetBuskIndex,
    });
  }

  return bestBusks.reduce((a, b) => (a.score > b.score ? a : b), bestBusks[0] ?? null);
}

export function reconstructOutfit(daRaw: number): Item[] {
  for (const hat of allHats()) {
    const hatPower = have($skill`Tao of the Terrapin`)
      ? taoMultiplier * getPower(hat)
      : getPower(hat);
    for (const shirt of allShirts()) {
      const shirtPower = getPower(shirt);
      for (const pants of allPants()) {
        const pantsPower = have($skill`Tao of the Terrapin`)
          ? taoMultiplier * getPower(pants)
          : getPower(pants);
        if (shirtPower + hatPower + pantsPower === daRaw) {
          return [hat, shirt, pants ];
        }
      }
    }
  }

  return [beret];
}

// Equipment setup
const allItems = () => Item.all().filter((i) => have(i));
const shopItems = $items`snorkel, Kentucky-style derby, pentacorn hat, goofily-plumed helmet, yellow plastic hard hat, wooden salad bowl, football helmet, fishin' hat, studded leather boxer shorts, chain-mail monokini, union scalemail pants, paper-plate-mail pants, troutpiece, alpha-mail pants`;
allItems().push(...shopItems);
const allHats = () => have($familiar`Mad Hatrack`)
  ? allItems().filter((i) => toSlot(i) === $slot`hat`)
  : [beret];
const allPants = () => allItems().filter((i) => toSlot(i) === $slot`pants`);
const allShirts = () => allItems().filter((i) => toSlot(i) === $slot`shirt`);

const hats = () => [...new Set(allHats().map((i) => taoMultiplier * getPower(i)))];

const pants = () => [...new Set(allPants().map((i) => taoMultiplier * getPower(i)))];
const shirts = () => [...new Set(allShirts().map((i) => getPower(i)))];

export const beretDASum = [
  ...new Set(
    hats().flatMap((hat) => pants().flatMap((pant) => shirts().flatMap((shirt) => hat + pant + shirt)))
  ),
];

export function chooseBuskEquipment(weightedModifiers: [Modifier, number][]) {
  const buskUses = clamp(toInt(get("_beretBuskingUses")), 0, 5);
  if (buskUses >= 5) {
    throw new Error("All 5 beret busks have already been used.");
  }

  const buskIndex = buskUses;

  // Find best DA combo for the upcoming busk
  const best = beretDASum
    .map((daRaw): Busk => {
      const rawEffects = beretBuskingEffects(daRaw, buskIndex);
      const effects: Effect[] = Array.from(
        new Set(
          Object.keys(rawEffects)
            .map((name) => {
              try {
                return toEffect(name);
              } catch {
                print(`Invalid effect name: ${name}`, "red");
                return null;
              }
            })
            .filter((e): e is Effect => e !== null)
        )
      );
      const score = scoreBusk(effects, weightedModifiers, uselessEffects);
      return { daRaw, effects, score, buskIndex };
    })
    .reduce((a, b) => (a.score > b.score ? a : b));

  // Reconstruct and equip outfit
  const [hat, shirt, pants] = reconstructOutfit(best.daRaw);
    if (shopItems.includes(hat)) retrieveItem(hat,1);
    if (shopItems.includes(pants)) retrieveItem(pants,1);
    if (hat) equip(hat);
    if (shirt) equip(shirt);
    if (pants) equip(pants);

  print(`Equipped best outfit for Busk ${buskIndex+1} (Power: ${best.daRaw})`, "green");
}
