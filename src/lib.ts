import {
  availableAmount,
  buy,
  cliExecute,
  create,
  Effect,
  effectModifier,
  getCampground,
  getClanName,
  haveEffect,
  holiday,
  Item,
  itemAmount,
  mallPrice,
  monkeyPaw,
  mpCost,
  myBasestat,
  myBuffedstat,
  myLevel,
  myMaxhp,
  myMp,
  myPrimestat,
  numericModifier,
  print,
  restoreMp,
  retrieveItem,
  retrievePrice,
  Skill,
  Stat,
  sweetSynthesis,
  toInt,
  toItem,
  toSkill,
  toStat,
  use,
  useSkill,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $modifier,
  $monster,
  $skill,
  $skills,
  $stat,
  canRememberSong,
  CombatLoversLocket,
  CommunityService,
  get,
  getKramcoWandererChance,
  have,
  set,
  sumNumbers,
  Witchess,
} from "libram";
import { printModtrace } from "libram/dist/modifier";
import { forbiddenEffects } from "./resources";
import { mainStat } from "./combat";
import { effect } from "libram/dist/resources/2022/TrainSet";

export const startingClan = getClanName();

export const testModifiers = new Map([
  [CommunityService.HP, ["Maximum HP", "Maximum HP Percent", "Muscle", "Muscle Percent"]],
  [CommunityService.Muscle, ["Muscle", "Muscle Percent"]],
  [CommunityService.Mysticality, ["Mysticality", "Mysticality Percent"]],
  [CommunityService.Moxie, ["Moxie", "Moxie Percent"]],
  [CommunityService.FamiliarWeight, ["Familiar Weight"]],
  [CommunityService.WeaponDamage, ["Weapon Damage", "Weapon Damage Percent"]],
  [CommunityService.SpellDamage, ["Spell Damage", "Spell Damage Percent"]],
  [CommunityService.Noncombat, ["Combat Rate"]],
  [CommunityService.BoozeDrop, ["Item Drop", "Booze Drop"]],
  [CommunityService.HotRes, ["Hot Resistance"]],
  [CommunityService.CoilWire, []],
]);

/*export function checkGithubVersion(): void {
  const gitBranches: { name: string; commit: { sha: string } }[] = JSON.parse(
    visitUrl(`https://github.com/Ignose/InstantSCCS_Ignose`)
  );
  const releaseBranch = gitBranches.find((branchInfo) => branchInfo.name === "release");
  const releaseSHA = releaseBranch?.commit.sha ?? "Not Found";
  const localBranch = gitInfo("Ignose");
  const localSHA = localBranch.commit;
  if (releaseSHA === localSHA) {
    print("InstantSCCS is up to date!", "green");
  } else {
    print(
      `InstantSCCS is out of date - your version was last updated on ${localBranch.last_changed_date}.`,
      "red"
    );
    print("Please run 'git update'!", "red");
    print(`Local Version: ${localSHA}.`);
    print(`Release Version: ${releaseSHA}`);
  }
}*/

export function fuelUp(): void {
  buy(1, $item`all-purpose flower`);
  use(1, $item`all-purpose flower`);
  buy(availableAmount($item`wad of dough`), $item`soda water`);
  create(availableAmount($item`wad of dough`), $item`loaf of soda bread`);
  cliExecute(`asdonmartin fuel ${availableAmount($item`loaf of soda bread`)} soda bread`);
}

export function simpleDateDiff(t1: string, t2: string): number {
  // Returns difference in milliseconds
  const yearDiff = toInt(t2.slice(0, 4)) - toInt(t1.slice(0, 4));
  const monthDiff = 12 * yearDiff + toInt(t2.slice(4, 6)) - toInt(t1.slice(4, 6));
  const dayDiff =
    monthDiff * Math.max(toInt(t1.slice(6, 8)), toInt(t2.slice(6, 8))) +
    toInt(t2.slice(6, 8)) -
    toInt(t1.slice(6, 8));
  const hourDiff = 24 * dayDiff + toInt(t2.slice(8, 10)) - toInt(t1.slice(8, 10));
  const minDiff = 60 * hourDiff + toInt(t2.slice(10, 12)) - toInt(t1.slice(10, 12));
  const secDiff = 60 * minDiff + toInt(t2.slice(12, 14)) - toInt(t1.slice(12, 14));
  const msDiff = 1000 * secDiff + toInt(t2.slice(14)) - toInt(t1.slice(14));

  return msDiff;
}

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

function logRelevantStats(whichTest: CommunityService): void {
  if (
    [CommunityService.Muscle, CommunityService.Mysticality, CommunityService.Moxie].includes(
      whichTest
    )
  ) {
    const testStat = toStat(whichTest.statName);
    const statString = testStat.toString().slice(0, 3);
    print(
      `Base ${statString}: ${myBasestat(testStat)}; Buffed ${statString}: ${myBuffedstat(testStat)}`
    );
  } else if (whichTest === CommunityService.HP) {
    print(`Buffed Mus: ${myBuffedstat($stat`Muscle`)}; HP: ${myMaxhp()};`);
  }
}

export function logTestSetup(whichTest: CommunityService): void {
  const testTurns = whichTest.actualCost();
  printModtrace(testModifiers.get(whichTest) ?? []);
  logRelevantStats(whichTest);
  print(
    `${whichTest.statName} ${
      whichTest !== CommunityService.CoilWire ? "Test" : ""
    } takes ${testTurns} adventure${testTurns === 1 ? "" : "s"} (predicted: ${
      whichTest.prediction
    }).`,
    "blue"
  );
  set(`_CSTest${whichTest.id}`, testTurns + (have($effect`Simmering`) ? 1 : 0));
}

export function tryAcquiringEffect(ef: Effect, tryRegardless = false): void {
  // Try acquiring an effect
  if (have(ef)) return;
  // If we already have the effect, we're done
  else if (forbiddenEffects.includes(ef)) return; // Don't acquire the effect if we are saving it

  if (ef === $effect`Sparkling Consciousness`) {
    // This has no ef.default for some reason
    if (holiday() === "Dependence Day" && !get("_fireworkUsed") && retrieveItem($item`sparkler`, 1))
      use($item`sparkler`, 1);
    return;
  }
  if (!ef.default) return; // No way to acquire?

  if (ef === $effect`Ode to Booze`) restoreMp(60);
  if (tryRegardless || canAcquireEffect(ef)) {
    const efDefault = ef.default;
    if (efDefault.split(" ")[0] === "cargo") return; // Don't acquire effects with cargo (items are usually way more useful)
    cliExecute(efDefault.replace(/cast 1 /g, "cast "));
  }
}

export function canAcquireEffect(ef: Effect): boolean {
  // This will not attempt to craft items to acquire the effect, which is the behaviour of ef.default
  // You will need to have the item beforehand for this to return true
  return ef.all
    .map((defaultAction) => {
      if (defaultAction.length === 0) return false; // This effect is not acquirable
      const splitString = defaultAction.split(" ");
      const action = splitString[0];
      const target = splitString.slice(2).join(" ");

      switch (action) {
        case "eat": // We have the food
        case "drink": // We have the booze
        case "chew": // We have the spleen item
        case "use": // We have the item
          if (ef === $effect`Sparkling Consciousness` && get("_fireworkUsed")) return false;
          return have(toItem(target));
        case "cast":
          return have(toSkill(target)) && myMp() >= mpCost(toSkill(target)); // We have the skill and can cast it
        case "cargo":
          return false; // Don't acquire effects with cargo (items are usually way more useful)
        case "synthesize":
          return false; // We currently don't support sweet synthesis
        case "barrelprayer":
          return get("barrelShrineUnlocked") && !get("_barrelPrayer");
        case "witchess":
          return Witchess.have() && get("puzzleChampBonus") >= 20 && !get("_witchessBuff");
        case "telescope":
          return get("telescopeUpgrades") > 0 && !get("telescopeLookedHigh");
        case "beach":
          return have($item`Beach Comb`); // need to check if specific beach head has been taken
        case "spacegate":
          return get("spacegateAlways") && !get("_spacegateVaccine");
        case "pillkeeper":
          return have($item`Eight Days a Week Pill Keeper`);
        case "pool":
          return get("_poolGames") < 3;
        case "swim":
          return !get("_olympicSwimmingPool");
        case "shower":
          return !get("_aprilShower");
        case "terminal":
          return (
            get("_sourceTerminalEnhanceUses") <
            1 +
              get("sourceTerminalChips")
                .split(",")
                .filter((s) => s.includes("CRAM")).length
          );
        case "daycare":
          return get("daycareOpen") && !get("_daycareSpa");
        default:
          return true; // Whatever edge cases we have not handled yet, just try to acquire it
      }
    })
    .some((b) => b);
}

// Adapted from goorbo
const gardens = $items`packet of pumpkin seeds, Peppermint Pip Packet, packet of dragon's teeth, packet of beer seeds, packet of winter seeds, packet of thanksgarden seeds, packet of tall grass seeds, packet of mushroom spores, packet of rock seeds`;
export function getGarden(): Item {
  return gardens.find((it) => it.name in getCampground()) || $item.none;
}

export function wishFor(ef: Effect, useGenie = true): void {
  // Tries to wish for an effect, but does not guarantee it
  if (have(ef)) return;
  if (forbiddenEffects.includes(ef)) return;
  // Genie and Monkey Paw both support wishing for effects
  // However, we can always sell Genie Wishes, so we prioritize using the paw
  // TODO: Use mafia's pref to check if we can still use the paw for wishes

  if (
    have($item`cursed monkey's paw`) &&
    get("_monkeyPawWishesUsed", 0) < 5
  ) {
    if (monkeyPaw(ef)) return;
  }

  if (have($item`pocket wish`) && useGenie) {
    cliExecute(`genie effect ${ef.name}`);
  }
}

export function overlevelled(): boolean {
  return myLevel() >= 20;
}
export const targetBaseMyst = get("instant_targetBaseMyst", 190);
export const targetBaseMystGap = get("instant_targetBaseMystGap", 15);

export const synthExpBuff =
  mainStat === $stat`Muscle`
    ? $effect`Synthesis: Movement`
    : mainStat === $stat`Mysticality`
    ? $effect`Synthesis: Learning`
    : $effect`Synthesis: Style`;

export const complexCandies = $items``.filter((candy) => candy.candyType === "complex");
const peppermintCandiesCosts = new Map<Item, number>([
  [$item`peppermint sprout`, 1],
  [$item`peppermint twist`, 1],
  [$item`peppermint patty`, 2],
  [$item`peppermint crook`, 3],
  [$item`cane-mail pants`, 10],
  [$item`peppermint rhino baby`, 11],
  [$item`cane-mail shirt`, 15],
]);
const nonPeppermintCandies = complexCandies.filter(
  (candy) => !Array.from(peppermintCandiesCosts.keys()).includes(candy)
);

function haveCandies(a: Item, b: Item): boolean {
  const candiesRequired = new Map<Item, number>();
  [a, b].forEach((candy) => {
    const currentAmount = candiesRequired.get(candy) ?? 0;
    if (nonPeppermintCandies.includes(candy)) candiesRequired.set(candy, currentAmount + 1);
    else
      candiesRequired.set(
        $item`peppermint sprout`,
        currentAmount + (peppermintCandiesCosts.get(candy) ?? Infinity)
      );
  });

  candiesRequired.forEach((amount, candy) => {
    candiesRequired.set(candy, itemAmount(candy) >= amount ? 1 : 0);
  });

  return Array.from(candiesRequired.values()).every((val) => val === 1);
}

const rem = mainStat === $stat`Muscle` ? 2 : mainStat === $stat`Mysticality` ? 3 : 4;
const complexCandyPairs = complexCandies
  .map((a, i) => complexCandies.slice(i).map((b) => [a, b]))
  .reduce((acc, val) => acc.concat(val), [])
  .filter(([a, b]) => (toInt(a) + toInt(b)) % 5 === rem);

export function getValidComplexCandyPairs(): Item[][] {
  return complexCandyPairs.filter(([a, b]) => haveCandies(a, b));
}

export function getSynthExpBuff(): void {
  const filteredComplexCandyPairs = getValidComplexCandyPairs();
  if (filteredComplexCandyPairs.length === 0) return;

  const bestPair = filteredComplexCandyPairs.reduce((left, right) =>
    left.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val) <
    right.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val)
      ? left
      : right
  );
  if (bestPair[0] === bestPair[1]) retrieveItem(bestPair[0], 2);
  else bestPair.forEach((it) => retrieveItem(it));
  sweetSynthesis(bestPair[0], bestPair[1]);
}

const allTomes = $skills`Summon Resolutions, Summon Love Song, Summon Candy Heart, Summon Taffy, Summon BRICKOs, Summon Party Favor, Summon Dice`;
const availableTomes = allTomes.filter((tome) => have(tome));
export function chooseLibram(): Skill {
  const needLoveSong =
    have($skill`Summon Love Song`) &&
    itemAmount($item`love song of icy revenge`) +
      Math.floor(haveEffect($effect`Cold Hearted`) / 5) <
      4;
  const needCandyHeart =
    have($skill`Summon Candy Heart`) &&
    ((!have($item`green candy heart`) && !have($effect`Heart of Green`)) ||
      (!have($item`lavender candy heart`) && !have($effect`Heart of Lavender`)));

  if (
    have($skill`Summon Resolutions`) &&
    ((!have($item`resolution: be happier`) && !have($effect`Joyful Resolve`)) ||
      (!have($item`resolution: be feistier`) && !have($effect`Destructive Resolve`)))
  ) {
    return $skill`Summon Resolutions`;
  } else if (needCandyHeart) {
    return $skill`Summon Candy Heart`;
  } else if (needLoveSong) {
    return $skill`Summon Love Song`;
  } else if (
    have($skill`Summon Resolutions`) &&
    !have($item`resolution: be kinder`) &&
    !have($effect`Kindly Resolve`)
  ) {
    return $skill`Summon Resolutions`;
  }
  return availableTomes[0];
}

export function burnLibram(saveMp: number): void {
  if (availableTomes.length === 0) return;
  while (myMp() >= mpCost(chooseLibram()) + saveMp) {
    useSkill(chooseLibram());
  }
}

export function camelFightsLeft(): number {
  // Only consider those free fights where we can use the camel
  const shadowRift = have($item`closed-circuit pay phone`)
    ? have($effect`Shadow Affinity`)
      ? haveEffect($effect`Shadow Affinity`)
      : get("_shadowAffinityToday")
      ? 11
      : 0
    : 0;
  const snojo = get("snojoAvailable") ? 10 - get("_snojoFreeFights") : 0;
  const NEP = get("neverendingPartyAlways") ? 10 - get("_neverendingPartyFreeTurns") : 0;
  const witchess = Witchess.have() ? 5 - get("_witchessFights") : 0;
  const DMT = have($familiar`Machine Elf`) ? 5 - get("_machineTunnelsAdv") : 0;
  const LOV = get("loveTunnelAvailable") && !get("_loveTunnelToday") ? 3 : 0;
  const olivers = get("ownsSpeakeasy") ? 3 - get("_speakeasyFreeFights", 0) : 0;
  const tentacle = get("_eldritchTentacleFought") ? 1 : 0;
  const sausageGoblin = getKramcoWandererChance() >= 1.0 ? 1 : 0;
  const XRay = have($item`Lil' Doctor™ bag`) ? 3 - get("_chestXRayUsed") : 0;
  const shatteringPunch = have($skill`Shattering Punch`) ? 3 - get("_shatteringPunchUsed") : 0;
  const mobHit = have($skill`Gingerbread Mob Hit`) && !get("_gingerbreadMobHitUsed") ? 1 : 0;
  const locketedWitchess =
    !Witchess.have() &&
    CombatLoversLocket.availableLocketMonsters().includes($monster`Witchess King`) &&
    !CombatLoversLocket.monstersReminisced().includes($monster`Witchess King`) &&
    !get("instant_saveLocketWitchessKing", false)
      ? 1
      : 0;
  const backups =
    Witchess.have() || have($item`Kramco Sausage-o-Matic™`)
      ? Math.max(11 - get("instant_saveBackups", 0) - get("_backUpUses"), 0)
      : 0; // No guarantee that we hit a tentacle, so we ignore that here
  // Currently does not consider gregs (require free banish + free fight source)

  // Include guaranteed non-free fights
  const noveltySkeleton = have($item`cherry`) || CommunityService.CoilWire.isDone() ? 0 : 1;
  // Red skeleton is not guaranteed since we can't guarantee we run out of yellow ray by then

  return sumNumbers([
    shadowRift,
    snojo,
    NEP,
    witchess,
    DMT,
    LOV,
    olivers,
    tentacle,
    sausageGoblin,
    XRay,
    shatteringPunch,
    mobHit,
    locketedWitchess,
    backups,
    noveltySkeleton,
  ]);
}

export function computeCombatFrequency(): number {
  const vipHat = have($item`Clan VIP Lounge key`) ? -5 : 0;
  const hat = vipHat;

  const protopack = have($item`protonic accelerator pack`) ? -5 : 0;
  const back = protopack;

  const parka = have($item`Jurassic Parka`) ? -5 : 0;
  const shirt = parka;

  const umbrella = have($item`unbreakable umbrella`) ? -10 : 0;
  const offhand = umbrella;

  const pantogram =
    have($item`portable pantogram`) && !get("instant_savePantogram", false) ? -5 : 0;
  const pants = pantogram;

  const kgb =
    have($item`Kremlin's Greatest Briefcase`) && !get("instant_saveKGBClicks", false) ? -5 : 0;
  const codpiece =
    have($item`Clan VIP Lounge key`) && !get("instant_saveFloundry", false) ? -10 : 0;
  const atlas = get("hasMaydayContract") && !get("instant_saveMayday", false) ? -5 : 0;
  const accessories = sumNumbers([kgb, codpiece, atlas]);

  const rose = -20;
  const smoothMovements = have($skill`Smooth Movement`) ? -5 : 0;
  const sonata = have($skill`The Sonata of Sneakiness`) ? -5 : 0;
  const favoriteBird =
    have($item`Bird-a-Day calendar`) &&
    get("yourFavoriteBirdMods").includes("Combat Frequency") &&
    !get("instant_saveFavoriteBird", false)
      ? toInt(
          get("yourFavoriteBirdMods")
            .split(", ")
            .filter((s) => s.includes("Combat Frequency"))
            .join("")
            .split(": ")[1]
        )
      : 0;
  const shadowWaters = have($item`closed-circuit pay phone`) ? -10 : 0;
  const powerfulGlove =
    have($item`Powerful Glove`) && !forbiddenEffects.includes($effect`Invisible Avatar`) ? -10 : 0;
  const shoeGum = get("hasDetectiveSchool") && !get("instant_saveCopDollars", false) ? -5 : 0;
  const silentRunning = -5;
  const feelingLonely = have($skill`Feel Lonely`) ? -5 : 0;
  const effects = sumNumbers([
    rose,
    smoothMovements,
    sonata,
    favoriteBird,
    shadowWaters,
    powerfulGlove,
    shoeGum,
    silentRunning,
    feelingLonely,
  ]);

  const disgeist = have($familiar`Disgeist`) ? -5 : 0;
  const familiar = disgeist;

  const darkHorse = get("horseryAvailable") ? -5 : 0;
  const others = darkHorse;

  const total = sumNumbers([
    hat,
    shirt,
    back,
    offhand,
    pants,
    accessories,
    effects,
    familiar,
    others,
  ]);

  print("Determining if we should run NC before fam test...");
  print(
    `Hat ${hat}, Shirt ${shirt}, Back ${back}, Offhand ${offhand}, Pants ${pants}, Accessories ${accessories}, Effects ${effects}, Others ${others}`
  );
  if (total <= -95) {
    print(`Total ${total} <= -95`, "green");
  } else {
    print(`Total ${total} > -95`, "red");
  }

  return total;
}

export function refillLatte(): void {
  if (
    !have($item`latte lovers member's mug`) ||
    !get("_latteDrinkUsed") ||
    get("_latteRefillsUsed") >= 3
  )
    return;

  const lastIngredient = get("latteUnlocks").includes("carrot") ? "carrot" : "pumpkin";
  if (get("_latteRefillsUsed") < 3) cliExecute(`latte refill cinnamon vanilla ${lastIngredient}`);
}

export function statToMaximizerString(stat: Stat): string {
  return stat === $stat`Muscle` ? "mus" : stat === $stat`Mysticality` ? "myst" : "mox";
}

export function shrugAT(): void {
  if (canRememberSong(1)) return;
  else {
    cliExecute("shrug Stevedave's Shanty of Superiority");
    cliExecute("shrug Carol of the Thrills");
    cliExecute("shrug Stevedave's Shanty of Superiority");
    cliExecute("shrug Ur-Kel's Aria of Annoyance");
    cliExecute("shrug Aloysius' Antiphon of Aptitude");
    return;
  }
}

//Define how to determine mainstat and define certain effects, incredients, and reagant needs based on mainstat
export const mainStatStr = myPrimestat().toString();

export const reagentBalancerEffect: Effect = {
  Muscle: $effect`Stabilizing Oiliness`,
  Mysticality: $effect`Expert Oiliness`,
  Moxie: $effect`Slippery Oiliness`,
}[mainStatStr];

export const reagentBalancerItem: Item = {
  Muscle: $item`oil of stability`,
  Mysticality: $item`oil of expertise`,
  Moxie: $item`oil of slipperiness`,
}[mainStatStr];

export const reagentBalancerIngredient: Item = {
  Muscle: $item`lime`,
  Mysticality: $item`cherry`,
  Moxie: $item`jumbo olive`,
}[mainStatStr];

export const reagentBoosterEffect: Effect = {
  Muscle: $effect`Phorcefullness`,
  Mysticality: $effect`Mystically Oiled`,
  Moxie: $effect`Superhuman Sarcasm`,
}[mainStatStr];

export const reagentBoosterItem: Item = {
  Muscle: $item`philter of phorce`,
  Mysticality: $item`ointment of the occult`,
  Moxie: $item`serum of sarcasm`,
}[mainStatStr];

export const reagentBoosterIngredient: Item = {
  Muscle: $item`lemon`,
  Mysticality: $item`grapefruit`,
  Moxie: $item`olive`,
}[mainStatStr];

export const snapperXpItem: Item = {
  Muscle: $item`vial of humanoid growth hormone`,
  Mysticality: $item`non-Euclidean angle`,
  Moxie: $item`Shantix™`,
}[mainStatStr];

export const abstractionXpItem: Item = {
  Muscle: $item`abstraction: purpose`,
  Mysticality: $item`abstraction: category`,
  Moxie: $item`abstraction: perception`,
}[mainStatStr];

export const abstractionXpEffect: Effect = {
  Muscle: $effect`Purpose`,
  Mysticality: $effect`Category`,
  Moxie: $effect`Perception`,
}[mainStatStr];

export const generalStoreXpEffect: Effect = {
  Muscle: $effect`Go Get 'Em, Tiger!`,
  Mysticality: $effect`Glittering Eyelashes`,
  Moxie: $effect`Butt-Rock Hair`,
}[mainStatStr];

export function checkLocketAvailable(): number {
  const locketAvailable =
    (get("instant_saveLocketRedSkeleton", false) ? 1 : 0) +
    (get("instant_saveLocketWitchessKing", false) ? 1 : 0) +
    (get("instant_saveLocketFactoryWorker", false) ? 1 : 0);

  return locketAvailable;
}

type Thing = Item | Effect | string;

export function resourceTurnSave(thing: Effect, modifier: string): number {
  if (haveEffect(thing)) return 0;
  switch (modifier) {
      case "Booze Drop":
        return Math.floor(numericModifier(thing, modifier)/15);
      case "Item Drop":
         if(have($skill`Steely-Eyed Squint`) || have($effect`Steely-Eyed Squint`)) return Math.floor(numericModifier(thing, modifier)/15);
         return Math.floor(numericModifier(thing, modifier)/30);
      case "Weapon Damage Percent":
        if(have($effect`Bow-Legged Swagger`) || have($skill`Bow-Legged Swagger`)) return Math.floor(numericModifier(thing, modifier)/25);
        return Math.floor(numericModifier(thing, modifier)/50);
      case "Spell Damage Percent":
        return Math.floor(numericModifier(thing, modifier)/50);
      case "Hot Res":
        return numericModifier(thing, modifier);
      case "Familiar Weight":
        return Math.floor(numericModifier(thing, modifier)/5);
      case "NonCombat":
        return Math.floor(numericModifier(thing, modifier)*3/5);
      default:
        return 0;
    }
}

export function checkValue(thing: Thing, turns: number): boolean {
  if (get("valueOfAdventure") * turns > checkPrice(thing)) return true;
  return false;
}

function checkPrice(thing: Thing): number {
  if (thing instanceof Item) return mallPrice(thing);
  if (typeof thing === "string")
    switch (thing) {
      case "Locket":
        return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5);
      case "Deck Cheat":
        return 10000;
      case "Fax":
        return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5);
      case "2002":
        return mallPrice($item`Spooky VHS Tape`);
      case "Favorite Bird":
        return 20000;
      case "August Scepter":
        return mallPrice($item`waffle`) * 3;
      case "Pillkeeper":
        if(get("_freePillKeeperUsed", false))
          return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5); //Lucky
        else return 7.5 * get("valueOfAdventure", 4000) + get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5);
      case "Cargo":
        return 15000;
      default:
        return 0;
    }
  return 0;
}
