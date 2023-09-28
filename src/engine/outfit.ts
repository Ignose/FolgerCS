import { OutfitSpec } from "grimoire-kolmafia";
import { cliExecute, equip, equippedItem, Familiar, Item, myPrimestat, toInt } from "kolmafia";
import {
  $effect,
  $familiar,
  $familiars,
  $item,
  $skill,
  $slot,
  DaylightShavings,
  get,
  have,
  maxBy,
} from "libram";
import { camelFightsLeft, haveCBBIngredients, statToMaximizerString } from "../lib";

export function garbageShirt(): void {
  if (
    have($item`January's Garbage Tote`) &&
    get("garbageShirtCharge") > 0 &&
    have($skill`Torso Awareness`)
  ) {
    if (get("garbageShirtCharge") === 1) {
      if (equippedItem($slot`shirt`) === $item`makeshift garbage shirt`)
        equip($slot`shirt`, $item.none);
    } else {
      if (!have($item`makeshift garbage shirt`)) cliExecute("fold makeshift garbage shirt");
      equip($slot`shirt`, $item`makeshift garbage shirt`);
    }
  }
}

export function unbreakableUmbrella(): void {
  if (have($item`unbreakable umbrella`) && get("umbrellaState") !== "broken")
    cliExecute("umbrella ml");
}

export function docBag(): void {
  if (have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3)
    equip($slot`acc3`, $item`Lil' Doctor™ bag`);
}

export function sugarItemsAboutToBreak(): Item[] {
  const sugarItems = [
    { id: 4180, item: $item`sugar shank` },
    { id: 4181, item: $item`sugar chapeau` },
    { id: 4182, item: $item`sugar shorts` },
    { id: 4183, item: $item`sugar shield` }, //Panto, why not Sugar Shield? Does Fam Wt not matter to you!?
  ];
  return sugarItems
    .map((entry) => {
      const { id, item } = entry;
      const itemAboutToBreak = parseInt(get(`sugarCounter${id.toString()}`), 10) >= 30;
      return itemAboutToBreak ? [item] : [];
    })
    .reduce((a, b) => a.concat(b));
}

function nanorhino(allowAttackingFamiliars = false): Familiar {
  return allowAttackingFamiliars && get("_nanorhinoCharge", 0) === 100
    ? $familiar`Nanorhino`
    : $familiar.none;
}

function cookbookbat(): Familiar {
  return !haveCBBIngredients(true) ? $familiar`Cookbookbat` : $familiar.none;
}

function shorterOrderCook(allowAttackingFamiliars = true): Familiar {
  return allowAttackingFamiliars && !have($item`short stack of pancakes`)
    ? $familiar`Shorter-Order Cook`
    : $familiar.none;
}

function garbageFire(): Familiar {
  return !have($item`burning newspaper`) ? $familiar`Garbage Fire` : $familiar.none;
}

function sombrero(allowAttackingFamiliars = true): Familiar {
  const sombreros = [
    ...(allowAttackingFamiliars ? $familiars`Patriotic Eagle, Galloping Grill` : []),
    $familiar`Baby Sandworm`,
    $familiar`Hovering Sombrero`,
  ].filter((fam) => have(fam));
  return sombreros.length > 0 ? sombreros[0] : $familiar.none;
}

function rockinRobin(): Familiar {
  return !have($item`robin's egg`) ? $familiar`Rockin' Robin` : $familiar.none;
}

function optimisticCandle(): Familiar {
  return !have($item`glob of melted wax`) ? $familiar`Optimistic Candle` : $familiar.none;
}

function melodramedary(): Familiar {
  return (have($familiar`Melodramedary`) &&
    camelFightsLeft() >= Math.ceil((100 - get("camelSpit")) / 3.0) &&
    get("camelSpit") < 100) ||
    (have($familiar`Melodramedary`) &&
      camelFightsLeft() >= Math.ceil((100 - get("camelSpit")) / 4.0) &&
      get("camelSpit") < 100 &&
      have($item`dromedary drinking helmet`))
    ? $familiar`Melodramedary`
    : $familiar.none;
}

export function chooseFamiliar(allowAttackingFamiliars = true): Familiar {
  const ignoredFamiliars = get("instant_explicitlyExcludedFamiliars", "")
    .split(",")
    .map((i) => toInt(i));
  const defaultFam = have($familiar`Cookbookbat`) ? $familiar`Cookbookbat` : $familiar.none;
  const familiars = [
    cookbookbat,
    shorterOrderCook,
    garbageFire,
    nanorhino,
    optimisticCandle,
    rockinRobin,
    melodramedary,
    sombrero,
  ]
    .map((fn) => fn(allowAttackingFamiliars))
    .filter((fam) => have(fam) && !ignoredFamiliars.includes(toInt(fam)));
  return familiars.length > 0 ? familiars[0] : defaultFam;
}

const specialEquipFamiliars = $familiars`Disembodied Hand, Left-Hand Man, Mad Hatrack, Fancypants Scarecrow, Ghost of Crimbo Carols, Ghost of Crimbo Cheer, Ghost of Crimbo Commerce`;
export function chooseHeaviestFamiliar(): Familiar {
  return maxBy(
    Familiar.all().filter((fam) => have(fam) && !specialEquipFamiliars.includes(fam)),
    (fam) => fam.experience
  );
}

export function avoidDaylightShavingsHelm(): boolean {
  return (
    DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` ||
    DaylightShavings.hasBuff() ||
    !have($item`Daylight Shavings Helmet`)
  );
}

export function baseOutfit(allowAttackingFamiliars = true): OutfitSpec {
  // Only try equipping/nag LOV Epaulettes if we are done with the LOV tunnel
  const lovTunnelCompleted = get("_loveTunnelUsed") || !get("loveTunnelAvailable");

  return {
    weapon: have($item`fish hatchet`)
      ? $item`fish hatchet`
      : have($item`bass clarinet`)
      ? $item`bass clarinet`
      : undefined,
    hat: avoidDaylightShavingsHelm() ? undefined : $item`Daylight Shavings Helmet`,
    offhand: $item`unbreakable umbrella`,
    back: lovTunnelCompleted ? $item`LOV Epaulettes` : undefined,
    acc1: have($item`codpiece`) ? $item`codpiece` : undefined,
    acc2:
      have($item`Cincho de Mayo`) &&
      get("_cinchUsed", 0) < 95 &&
      100 - get("_cinchUsed", 0) < get("instant_saveCinch", 0)
        ? $item`Cincho de Mayo`
        : undefined,
    familiar: chooseFamiliar(allowAttackingFamiliars),
    famequip:
      have($item`dromedary drinking helmet`) && chooseFamiliar() === $familiar`Melodramedary`
        ? $item`dromedary drinking helmet`
        : undefined,
    modifier: `0.25 ${statToMaximizerString(
      myPrimestat()
    )}, 0.33 ML, -equip tinsel tights, -equip wad of used tape`, //Update to check prime stat
    avoid: [
      ...sugarItemsAboutToBreak(),
      ...(avoidDaylightShavingsHelm() ? [$item`Daylight Shavings Helmet`] : []),
    ],
  };
}
