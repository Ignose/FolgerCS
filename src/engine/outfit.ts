import { OutfitSpec } from "grimoire-kolmafia";
import {
  cliExecute,
  equip,
  equippedItem,
  Familiar,
  Item,
  monsterLevelAdjustment,
  myBuffedstat,
  myMaxmp,
  myMp,
  myPrimestat,
  numericModifier,
  print,
  Stat,
  toInt,
  toString,
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
  DaylightShavings,
  examine,
  get,
  getModifier,
  have,
  maxBy,
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

function homemade(): Familiar {
  if (have($familiar`Homemade Robot`) && have($familiar`Comma Chameleon`) && have($item`toy Cupid bow`) && !have($item`homemade robot gear`) && camelFightsLeft() >= 5)
    return $familiar`Homemade Robot`
  return $familiar.none
}

function weightCamel(): Familiar {
  if (have($item`Sept-Ember Censer`) && have($familiar`Melodramedary`) && get("availableSeptEmbers") >= 2 && !get("_entauntaunedToday"))
    return $familiar`Melodramedary`
  return $familiar.none
}

function cornbeefadon(): Familiar {
  if (have($item`toy Cupid bow`) && !have($item`amulet coin`) && camelFightsLeft() >= 5 && have($familiar`Cornbeefadon`))
    return $familiar`Cornbeefadon`
  return $familiar.none
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
    homemade,
    cornbeefadon,
    weightCamel,
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

// Function to calculate the base ML using scaler and buffed mainstat, capped by a value
function calculateBaseML(mainstat: Stat, cap: number): number {
    const scaler = monsterLevelAdjustment()/3 + ($monster`burnout`.baseAttack / 4);
    const buffedStat = myBuffedstat(mainstat);
    const baseML = scaler * buffedStat;
    return Math.min(baseML, cap)/2; // Cap the base ML
}

function round(value: number, significantFigures: number): number {
  const exponent = Math.floor(Math.log10(value))
  const nIntegers = exponent + 1
  const precision = 10 ** (nIntegers - significantFigures)
  return Math.round(value / precision) * precision
}

// Function to calculate the relative weight of each modifier
function calculateRelativeWeights(): { mainstatWeight: number, mlWeight: number, expWeight: number, experiencePercentWeight: number } {
  const mainstat = myPrimestat();
  const cap = 20_000;
  const muscleExperience = getModifier("Muscle Experience");
    const baseML = calculateBaseML(mainstat, cap);
    
    // Calculate the contribution of each modifier
    // Calculate how much each component affects the stat gains
    
    const statGain = (1 / 4) * baseML;
    const perML = statGain / 3;
    const experienceGain = getModifier(`${mainstat.toString()} Experience Percent`) / 100;
    
    const totalGain = statGain + perML + experienceGain + muscleExperience;
    
    // Weighting factors based on how much each component contributes
    const mainstatWeight = round(statGain / totalGain,2);
    const mlWeight = round(perML / totalGain,2);
    const expWeight = round(muscleExperience / totalGain,2);
    const experiencePercentWeight = round(totalGain/100,2);
    
    return { mainstatWeight, mlWeight, expWeight, experiencePercentWeight };
}

export function buildMaximizerString(): string {
    const mainstat = myPrimestat();
    // Get the relative weights dynamically
    const { mainstatWeight, mlWeight, expWeight, experiencePercentWeight } = calculateRelativeWeights();
    
    // Build the maximizer string
    const mainstatString = statToMaximizerString(mainstat);
    
    const maximizerString = `${mainstatWeight} ${mainstatString}, 
        ${mlWeight} ML, 
        ${expWeight} ${mainstatString} exp, 
        ${experiencePercentWeight} ${mainstatString} experience percent,
    `;
    
    return maximizerString;
}


function baseOutfitFirstPass(allowAttackingFamiliars = true): OutfitSpec {
  parka();

  return {
    weapon: useCandyCaneSword()
      ? candySword
      : have($item`June cleaver`)
      ? $item`June cleaver`
      : undefined,
    back: get("questPAGhost") === "unstarted" && get("nextParanormalActivity") <= totalTurnsPlayed()
      ? $item`protonic accelerator pack` : undefined,
    shirt: garbageShirt() ? $item`makeshift garbage shirt` : undefined,
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
    familiar:
      have($familiar`Melodramedary`) && get("camelSpit") < 100 && !have($effect`spit upon`)
        ? $familiar`Melodramedary`
        : chooseFamiliar(allowAttackingFamiliars),
    famequip:
      have($item`dromedary drinking helmet`) && chooseFamiliar() === $familiar`Melodramedary` && !have($effect`spit upon`)
        ? $item`dromedary drinking helmet`
        : have($item`tiny rake`) &&
          chooseFamiliar() === $familiar`Melodramedary` &&
          get("_leafMonstersFought", 0) < 5
        ? $item`tiny rake`
        : undefined,
    modifier: `${buildMaximizerString()} 0.001 familiar experience, -equip tinsel tights, -equip wad of used tape`,
    avoid: [
      ...sugarItemsAboutToBreak(),
    ],
  };
}

export function baseOutfit(allowAttackingFamiliars = true): OutfitSpec {
  const outfit = baseOutfitFirstPass(allowAttackingFamiliars);

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
    if(have($item`blue plate`)) {
      outfit.famequip = $item`blue plate`
    } else {
      outfit.famequip = $item`toy Cupid bow`;
    }
  }

  if (outfit.familiar === $familiar`Homemade Robot` || outfit.familiar === $familiar`mu` || outfit.familiar === $familiar`Cornbeefadon`) {
    outfit.famequip = $item`toy Cupid bow`;
  }

  print(`Modifier: ${outfit.modifier}`)
    return outfit
}
