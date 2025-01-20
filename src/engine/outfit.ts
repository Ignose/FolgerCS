import { OutfitSpec } from "grimoire-kolmafia";
import {
  cliExecute,
  equip,
  equippedItem,
  Familiar,
  Item,
  myMaxmp,
  myMp,
  myPrimestat,
  numericModifier,
  print,
  toInt,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $familiars,
  $item,
  $skill,
  $slot,
  DaylightShavings,
  examine,
  get,
  have,
  maxBy,
} from "libram";
import { camelFightsLeft, statToMaximizerString } from "../lib";
import { args } from "../args";
import { restoreMPEfficiently } from "../tasks/leveling";

const primeStat = statToMaximizerString(myPrimestat());

export function garbageShirt(): boolean {
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
    return true;
  }
  return false;
}

export function parka(): boolean {
  if (!have($item`Jurassic Parka`) || !have($skill`Torso Awareness`)) return false;
  if (get("parkaMode") !== "spikolodon") cliExecute("parka spikolodon");
  return true;
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
    ...(allowAttackingFamiliars
      ? // eslint-disable-next-line libram/verify-constants
        $familiars`Jill-of-All-Trades, Patriotic Eagle, Galloping Grill`
      : []),
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
  if (have($effect`Spit Upon`)) return $familiar.none;
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
  const ignoredFamiliars = args.explicitlyexcludedfams.split(",").map((i) => toInt(i));
  const defaultFam = have($familiar`Cookbookbat`) ? $familiar`Cookbookbat` : $familiar.none;
  const familiars = [
    melodramedary,
    shorterOrderCook,
    garbageFire,
    nanorhino,
    optimisticCandle,
    rockinRobin,
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

const candySword = $item`candy cane sword cane`;

function useCandyCaneSword(): boolean {
  if (!have(candySword)) return false;
  examine(candySword);
  if (
    numericModifier(candySword, "Weapon Damage") < 115 &&
    get("_surprisinglySweetSlashUsed", 0) < 11 &&
    get("_surprisinglySweetStabUsed", 0) < 11
  ) {
    print(`Candy Cane at ${numericModifier(candySword, "Weapon Damage")} weapon damage`);
    return true;
  }
  return false;
}

export function baseOutfit(allowAttackingFamiliars = true): OutfitSpec {
  // Only try equipping/nag LOV Epaulettes if we are done with the LOV tunnel
  const lovTunnelCompleted = get("_loveTunnelUsed") || !get("loveTunnelAvailable");
  parka();

  return {
    weapon: useCandyCaneSword()
      ? candySword
      : have($item`June cleaver`)
      ? $item`June cleaver`
      : undefined,
    hat: avoidDaylightShavingsHelm() ? undefined : $item`Daylight Shavings Helmet`,
    offhand:
      myMaxmp() > 200 && myMp() < 75 && restoreMPEfficiently() === "Gulp"
        ? $item`latte lovers member's mug`
        : $item`unbreakable umbrella`,
    acc1: have($item`codpiece`) ? $item`codpiece` : undefined,
    acc2:
      have($item`Cincho de Mayo`) &&
      get("_cinchUsed", 0) < 95 &&
      100 - get("_cinchUsed", 0) > args.savecinch
        ? $item`Cincho de Mayo`
        : undefined,
    familiar:
      have($familiar`Melodramedary`) && get("camelSpit") < 100 && !have($effect`spit upon`)
        ? $familiar`Melodramedary`
        : chooseFamiliar(allowAttackingFamiliars),
    famequip:
      have($item`dromedary drinking helmet`) && chooseFamiliar() === $familiar`Melodramedary`
        ? $item`dromedary drinking helmet`
        : have($item`tiny rake`) &&
          chooseFamiliar() === $familiar`Melodramedary` &&
          get("_leafMonstersFought", 0) < 5
        ? $item`tiny rake`
        : undefined,
    modifier: `1 ${primeStat}, 1 ML, 6 ${primeStat} exp, 30 ${primeStat} experience percent, -equip tinsel tights, -equip wad of used tape`, //Update to check prime stat
    avoid: [
      ...sugarItemsAboutToBreak(),
      ...(avoidDaylightShavingsHelm() ? [$item`Daylight Shavings Helmet`] : []),
    ],
  };
}
