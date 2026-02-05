import { OutfitSpec } from "grimoire-kolmafia";
import {
  cliExecute,
  equip,
  equippedItem,
  Familiar,
  Item,
  Monster,
  myMaxmp,
  myMp,
  myPrimestat,
  numericModifier,
  print,
  toInt,
  totalTurnsPlayed,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $familiars,
  $item,
  $monster,
  $skill,
  $slot,
  examine,
  get,
  getScalingRate,
  have,
  maxBy,
  ToyCupidBow,
} from "libram";
import { camelFightsLeft, statToMaximizerString } from "../lib";
import { args } from "../args";
import { restoreMPEfficiently } from "../tasks/leveling";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function melodramedary(_allowAttackingFamiliars = false): Familiar {
  return !have($effect`Spit Upon`) &&
    !(
      have($item`legendary seal-clubbing club`) &&
      have($item`Heartstone`) &&
      get("_clubEmTimeUsed") < 4
    )
    ? $familiar`Melodramedary`
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
      ? $familiars`Jill-of-All-Trades, Patriotic Eagle, Galloping Grill`
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

function homemade(): Familiar {
  if (
    have($familiar`Homemade Robot`) &&
    have($familiar`Comma Chameleon`) &&
    have($item`toy Cupid bow`) &&
    !have($item`homemade robot gear`) &&
    camelFightsLeft() >= 5
  )
    return $familiar`Homemade Robot`;
  return $familiar.none;
}

export function chooseFamiliar(allowAttackingFamiliars = true): Familiar {
  const ignoredFamiliars = args.explicitlyexcludedfams.split(",").map((i) => toInt(i));
  const defaultFam = have($familiar`Cookbookbat`) ? $familiar`Cookbookbat` : $familiar.none;
  const tcbFamiliar = ToyCupidBow.currentFamiliar();
  if (tcbFamiliar !== null) {
    if (ToyCupidBow.turnsLeft() < 5) {
      return tcbFamiliar;
    }
  }
  const familiars = [
    melodramedary,
    shorterOrderCook,
    garbageFire,
    nanorhino,
    optimisticCandle,
    rockinRobin,
    homemade,
    sombrero,
  ]
    .map((fn) => fn(allowAttackingFamiliars))
    .filter((fam) => have(fam) && !ignoredFamiliars.includes(toInt(fam)));

  print(`Familiar order: ${familiars}`);
  return familiars.length > 0 ? familiars[0] : defaultFam;
}

const specialEquipFamiliars = $familiars`Disembodied Hand, Left-Hand Man, Mad Hatrack, Fancypants Scarecrow, Ghost of Crimbo Carols, Ghost of Crimbo Cheer, Ghost of Crimbo Commerce`;
export function chooseHeaviestFamiliar(): Familiar {
  return maxBy(
    Familiar.all().filter((fam) => have(fam) && !specialEquipFamiliars.includes(fam)),
    (fam) => fam.experience
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
    return true;
  }
  return false;
}

function baseOutfitFirstPass(
  allowAttackingFamiliars = true,
  avoidGarbageShirt = false,
  medianMonster?: Monster
): OutfitSpec {
  parka();
  const mainstat = myPrimestat();
  const mainstatString = statToMaximizerString(mainstat);

  const monster = medianMonster ? medianMonster : $monster`flaming leaflet`;
  const monsterScaling = getScalingRate(monster);

  const stringPrequel =
    monsterScaling > 0
      ? `10 ${mainstatString}, 2 ML, 1 ${mainstatString} exp, 25 ${mainstatString} experience percent,`
      : `2 ML, 3 ${mainstatString} exp, 25 ${mainstatString} experience percent,`;

  return {
    weapon: useCandyCaneSword()
      ? candySword
      : have($item`June cleaver`)
      ? $item`June cleaver`
      : undefined,
    back:
      get("questPAGhost") === "unstarted" && get("nextParanormalActivity") <= totalTurnsPlayed()
        ? $item`protonic accelerator pack`
        : undefined,
    shirt: garbageShirt() && !avoidGarbageShirt ? $item`makeshift garbage shirt` : undefined,
    offhand:
      myMaxmp() > 200 && myMp() < 75 && restoreMPEfficiently() === "Gulp"
        ? $item`latte lovers member's mug`
        : undefined,
    acc1:
      have($item`Cincho de Mayo`) &&
      get("_cinchUsed", 0) < 95 &&
      100 - get("_cinchUsed", 0) > args.savecinch
        ? $item`Cincho de Mayo`
        : undefined,
    familiar: chooseFamiliar(allowAttackingFamiliars),
    famequip:
      have($item`tiny rake`) && get("_leafMonstersFought", 0) < 5 ? $item`tiny rake` : undefined,
    modifier: `${stringPrequel} 0.001 familiar experience, -equip tinsel tights, -equip wad of used tape`,
    avoid: [...sugarItemsAboutToBreak()],
  };
}

export function baseOutfit(
  allowAttackingFamiliars = true,
  avoidGarbageShirt = false,
  medianMonster?: Monster
): OutfitSpec {
  const outfit = baseOutfitFirstPass(allowAttackingFamiliars, avoidGarbageShirt, medianMonster);

  if (outfit.familiar === $familiar`Melodramedary`) {
    if (have($item`dromedary drinking helmet`)) {
      outfit.famequip = $item`dromedary drinking helmet`;
    } else {
      if (have($item`toy Cupid bow`)) {
        outfit.famequip = $item`toy Cupid bow`;
      }
    }
  }

  if (outfit.familiar === $familiar`Shorter-Order Cook`) {
    if (have($item`blue plate`)) {
      outfit.famequip = $item`blue plate`;
    } else {
      outfit.famequip = $item`toy Cupid bow`;
    }
  }

  if (
    outfit.familiar === $familiar`Homemade Robot` ||
    outfit.familiar === $familiar`Mu` ||
    outfit.familiar === $familiar`Cornbeefadon`
  ) {
    outfit.famequip = $item`toy Cupid bow`;
  }

  return outfit;
}
