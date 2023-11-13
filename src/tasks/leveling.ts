import { Quest } from "../engine/task";
import {
  autosell,
  buy,
  chew,
  cliExecute,
  create,
  drink,
  eat,
  Effect,
  equip,
  equippedItem,
  getMonsters,
  haveEffect,
  inebrietyLimit,
  Item,
  itemAmount,
  itemDrops,
  Location,
  mallPrice,
  Monster,
  mpCost,
  myBasestat,
  myClass,
  myHash,
  myHp,
  myInebriety,
  myLevel,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  mySoulsauce,
  print,
  putCloset,
  restoreHp,
  restoreMp,
  retrieveItem,
  runChoice,
  storageAmount,
  takeStorage,
  toInt,
  toItem,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $monsters,
  $skill,
  $slot,
  $stat,
  AutumnAton,
  clamp,
  CombatLoversLocket,
  ensureEffect,
  get,
  getBanishedMonsters,
  getKramcoWandererChance,
  have,
  SongBoom,
  SourceTerminal,
  sum,
  TunnelOfLove,
  uneffect,
  Witchess,
  withChoice,
} from "libram";
import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  boomBoxProfit,
  burnLibram,
  camelFightsLeft,
  checkPull,
  checkValue,
  chooseLibram,
  forbiddenEffects,
  fuelUp,
  generalStoreXpEffect,
  getSynthExpBuff,
  getValidComplexCandyPairs,
  overlevelled,
  reagentBalancerEffect,
  reagentBalancerIngredient,
  reagentBalancerItem,
  reagentBoosterEffect,
  reagentBoosterIngredient,
  reagentBoosterItem,
  refillLatte,
  saveLeafyBoys,
  statToMaximizerString,
  synthExpBuff,
  targetBaseMyst,
  targetBaseMystGap,
  tryAcquiringEffect,
} from "../lib";
import {
  baseOutfit,
  chooseFamiliar,
  docBag,
  garbageShirt,
  unbreakableUmbrella,
} from "../engine/outfit";
import Macro, { haveFreeBanish, haveFreeKill } from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import {
  chooseQuest,
  chooseRift,
  rufusTarget,
} from "libram/dist/resources/2023/ClosedCircuitPayphone";
import { drive } from "libram/dist/resources/2017/AsdonMartin";
import { cheatCard, getRemainingCheats } from "libram/dist/resources/2015/DeckOfEveryCard";
import { args } from "../args";

const useCinch = args.savecinch < 100 - get("_cinchUsed");
const baseBoozes = $items`bottle of rum, boxed wine, bottle of gin, bottle of vodka, bottle of tequila, bottle of whiskey`;
const freeFightMonsters: Monster[] = $monsters`Witchess Bishop, Witchess King, Witchess Witch, sausage goblin, Eldritch Tentacle`;
const godLobsterChoice = have($item`God Lobster's Ring`) ? 2 : 3;

const mainStatStr = myPrimestat().toString();
const muscleList: Effect[] = [
  $effect`Seal Clubbing Frenzy`,
  $effect`Patience of the Tortoise`,
  $effect`Disdain of the War Snapper`,
  $effect`Go Get 'Em, Tiger!`,
  $effect`Muddled`,
  $effect`Lack of Body-Building`,
  $effect`Adrenaline Rush`,
  // Weapon dmg
  $effect`Carol of the Bulls`,
];

const mysticalityList: Effect[] = [
  $effect`Pasta Oneness`,
  $effect`Saucemastery`,
  $effect`Disdain of She-Who-Was`,
  $effect`Glittering Eyelashes`,
  $effect`Uncucumbered`,
  $effect`We're All Made of Starfish`,
  $effect`Sparkling Consciousness`,
  // Spell dmg
  $effect`Carol of the Hells`,
];

const moxieList: Effect[] = [
  $effect`Disco State of Mind`,
  $effect`Mariachi Mood`,
  $effect`Butt-Rock Hair`,
  $effect`Ten out of Ten`,
  $effect`Pomp & Circumsands`,
  $effect`Sneaky Serpentine Subtlety`,
  // Weapon dmg
  $effect`Carol of the Bulls`,
];

const statEffects =
  mainStatStr === `Muscle`
    ? muscleList
    : mainStatStr === `Mysticality`
    ? mysticalityList
    : moxieList;

const usefulEffects: Effect[] = [
  // Stats
  $effect`Big`,
  $effect`Feeling Excited`,
  $effect`Triple-Sized`,
  $effect`substats.enh`,
  $effect`Broad-Spectrum Vaccine`,
  $effect`Pyrite Pride`,
  // $effect`Think Win-Lose`,
  $effect`Confidence of the Votive`,
  $effect`Song of Bravado`,

  // ML
  $effect`Pride of the Puffin`,
  $effect`Drescher's Annoying Noise`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Misplaced Rage`,

  // Xp
  $effect`Carol of the Thrills`,
  $effect`Wisdom of Others`,

  // Songs
  $effect`Stevedave's Shanty of Superiority`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Aloysius' Antiphon of Aptitude`,

  // Spell dmg
];

const prismaticEffects: Effect[] = [
  $effect`Frostbeard`,
  $effect`Intimidating Mien`,
  $effect`Pyromania`,
  $effect`Rotten Memories`,
  $effect`Takin' It Greasy`,
  $effect`Your Fifteen Minutes`,
  $effect`Bendin' Hell`,
];

const wdmgEffects: Effect[] = [
  $effect`Carol of the Bulls`,
  $effect`Disdain of the War Snapper`,
  $effect`Frenzied, Bloody`,
  $effect`Jackasses' Symphony of Destruction`,
  $effect`Rage of the Reindeer`,
  $effect`Scowl of the Auk`,
  $effect`Song of the North`,
  $effect`Tenacity of the Snapper`,
];

export function powerlevelingLocation(): Location {
  if (get("neverendingPartyAlways")) return $location`The Neverending Party`;
  else if (get("stenchAirportAlways") || get("_stenchAirportToday"))
    return $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`;
  else if (get("hotAirportAlways")) return $location`The SMOOCH Army HQ`;
  else if (get("coldAirportAlways")) return $location`VYKEA`;
  else if (get("sleazeAirportAlways")) return $location`Sloppy Seconds Diner`;
  else if (get("spookyAirportAlways")) return $location`The Deep Dark Jungle`;

  return $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice`; // Default location
}

let _bestShadowRift: Location | null = null;
export function bestShadowRift(): Location {
  if (!_bestShadowRift) {
    _bestShadowRift =
      chooseRift({
        canAdventure: true,
        sortBy: (l: Location) => {
          const drops = getMonsters(l)
            .map((m) =>
              [
                ...Object.keys(itemDrops(m)).map((s) => toItem(s)),
                m === $monster`shadow guy` &&
                have($skill`Just the Facts`) &&
                myClass() === $class`Pastamancer`
                  ? $item`pocket wish`
                  : m === $monster`shadow spider` &&
                    have($skill`Just the Facts`) &&
                    myClass() === $class`Accordion Thief`
                  ? $item`pocket wish`
                  : $item.none,
              ].filter((i) => i !== $item.none)
            )
            .reduce((acc, val) => acc.concat(val), []);
          return sum(drops, mallPrice);
        },
      }) ?? $location.none;
    if (_bestShadowRift === $location.none && have($item`closed-circuit pay phone`)) {
      throw new Error("Failed to find a suitable Shadow Rift to adventure in");
    }
  }
  return _bestShadowRift;
}

function sendAutumnaton(): void {
  if (AutumnAton.availableLocations().includes(bestShadowRift()) && have($item`autumn-aton`))
    AutumnAton.sendTo(bestShadowRift());
}

function sellMiscellaneousItems(): void {
  const items: Item[] = [
    $item`cardboard ore`,
    $item`hot buttered roll`,
    $item`toast`,
    $item`meat paste`,
    $item`meat stack`,
    $item`jar of swamp honey`,
    $item`turtle voicebox`,
    $item`grody jug`,
    $item`gas can`,
    $item`Middle of the Road™ brand whiskey`,
    $item`neverending wallet chain`,
    $item`pentagram bandana`,
    $item`denim jacket`,
    $item`ratty knitted cap`,
    $item`jam band bootleg`,
    $item`Purple Beast energy drink`,
    $item`cosmetic football`,
    $item`shoe ad T-shirt`,
    $item`pump-up high-tops`,
    $item`noticeable pumps`,
    $item`surprisingly capacious handbag`,
    $item`electronics kit`,
    $item`PB&J with the crusts cut off`,
    $item`dorky glasses`,
    $item`ponytail clip`,
    $item`paint palette`,
    ...baseBoozes,
  ];
  items.forEach((it) => {
    if (itemAmount(it) > 1) autosell(it, itemAmount(it) - 1);
  });
}

export const LevelingQuest: Quest = {
  name: "Leveling",
  completed: () =>
    get("csServicesPerformed").split(",").length > 1 ||
    (myBasestat(myPrimestat()) >= targetBaseMyst &&
      get("_feelPrideUsed", 3) >= 3 &&
      camelFightsLeft() === 0 &&
      (get("camelSpit") < 94 || get("camelSpit") >= 100) &&
      !haveFreeKill()),
  tasks: [
    {
      name: "LED Candle",
      // eslint-disable-next-line libram/verify-constants
      completed: () => !have($item`LED candle`) || get("ledCandleMode", "") === "reading",
      do: () => cliExecute("jillcandle reading"),
      limit: { tries: 1 },
    },
    {
      name: "Scorched Earth",
      ready: () => checkValue($item`Napalm In The Morning™ candle`, 1),
      completed: () => !have($item`Napalm In The Morning™ candle`) || have($effect`Scorched Earth`),
      do: () => use($item`Napalm In The Morning™ candle`),
      limit: { tries: 1 },
    },
    {
      name: "Bird Blessing",
      ready: () => myClass() !== $class`Disco Bandit`,
      completed: () => !have($skill`Seek out a Bird`) || have($effect`Blessing of the Bird`),
      do: () => useSkill($skill`Seek out a Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Soul Food",
      ready: () => mySoulsauce() >= 5,
      completed: () => mySoulsauce() < 5 || myMp() > myMaxmp() - 15 || !have($skill`Soul Food`),
      do: (): void => {
        while (mySoulsauce() >= 5 && myMp() <= myMaxmp() - 15) useSkill($skill`Soul Food`);
      },
    },
    {
      name: "Clan Shower",
      completed: () => get("_aprilShower"),
      do: (): void => {
        const aprilShowerEffect: Effect = {
          Muscle: $effect`Muscle Unbound`,
          Mysticality: $effect`Thaumodynamic`,
          Moxie: $effect`So Fresh and So Clean`,
        }[mainStatStr];
        ensureEffect(aprilShowerEffect);
      },
      limit: { tries: 1 },
    },
    {
      name: "Mainstat Gaze",
      completed: () =>
        ((have($effect`Inscrutable Gaze`) || !have($skill`Inscrutable Gaze`)) &&
          myPrimestat() === $stat`Mysticality`) ||
        ((have($effect`Patient Smile`) || !have($skill`Patient Smile`)) &&
          myPrimestat() === $stat`Muscle`) ||
        ((have($effect`Knowing Smile`) || !have($skill`Knowing Smile`)) &&
          myPrimestat() === $stat`Moxie`),
      do: (): void => {
        const mainStatGainEffect: Effect = {
          Muscle: $effect`Patient Smile`,
          Mysticality: $effect`Inscrutable Gaze`,
          Moxie: $effect`Knowing Smile`,
        }[mainStatStr];
        ensureEffect(mainStatGainEffect);
      },
      limit: { tries: 5 },
    },
    {
      name: "Hot in Herre",
      completed: () =>
        have($effect`Hot in Herre`) ||
        !have($item`2002 Mr. Store Catalog`) ||
        forbiddenEffects.includes($effect`Hot in Herre`),
      do: (): void => {
        if (!have($item`Charter: Nellyville`)) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Charter: Nellyville`);
        }
        use($item`Charter: Nellyville`, 1);
      },
      limit: { tries: 3 },
    },
    {
      name: "Driving Recklessly",
      ready: () => args.asdon,
      completed: () => have($effect`Driving Recklessly`),
      do: (): void => {
        fuelUp(), drive($effect`Driving Recklessly`);
      },
      limit: { tries: 3 },
    },
    {
      name: "Crimbo Candy",
      completed: () =>
        get("_candySummons", 0) > 0 ||
        !have($skill`Summon Crimbo Candy`) ||
        !have($skill`Sweet Synthesis`),
      do: () => useSkill($skill`Summon Crimbo Candy`),
      limit: { tries: 1 },
    },
    {
      name: "Synth Exp Buff",
      completed: () =>
        !have($skill`Sweet Synthesis`) ||
        args.synthxp ||
        have(synthExpBuff) ||
        getValidComplexCandyPairs().length === 0,
      do: (): void => getSynthExpBuff(),
      limit: { tries: 5 },
    },
    {
      name: "Pull Deep Dish of Legend",
      ready: () => !args.deepdish,
      completed: () =>
        checkPull($item`Deep Dish of Legend`) || have($effect`In the Depths`) || args.deepdish,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        if (storageAmount($item`Deep Dish of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Deep Dish of Legend in Hagnk's", "red");
          print("Consider pulling something to make up for the turngen and 300%mus,", "red");
          print(
            "then type 'set instant_skipDeepDishOfLegend=true' before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`Deep Dish of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Calzone of Legend",
      completed: () =>
        checkPull($item`Calzone of Legend`) || have($effect`In the 'zone zone!`) || args.calzone,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        if (storageAmount($item`Calzone of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Calzone of Legend in Hagnk's", "red");
          print(
            "Consider pulling something to make up for the turngen and 300%myst (e.g. a roasted vegetable focaccia),",
            "red"
          );
          print(
            "then type 'set instant_skipCalzoneOfLegend=true' before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`Calzone of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Pizza of Legend",
      completed: () =>
        checkPull($item`Pizza of Legend`) || have($effect`Endless Drool`) || args.pizza,
      do: (): void => {
        if (storageAmount($item`Pizza of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Pizza of Legend in Hagnk's", "red");
          print("Consider pulling something to make up for the turngen and 300%mox,", "red");
          print(
            "then type 'set instant_skipPizzaOfLegend=true' before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`Pizza of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Buddy Bjorn",
      ready: () => args.dopulls,
      completed: () => checkPull($item`Buddy Bjorn`),
      do: (): void => {
        takeStorage($item`Buddy Bjorn`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Stick-Knife",
      ready: () => args.dopulls,
      completed: () => checkPull($item`Stick-Knife of Loathing`),
      do: (): void => {
        takeStorage($item`Stick-Knife of Loathing`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Repaid Diaper",
      ready: () => args.dopulls,
      completed: () =>
        checkPull($item`Great Wolf's beastly trousers`) || checkPull($item`repaid diaper`),
      do: (): void => {
        takeStorage($item`repaid diaper`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Beastly Trousers",
      ready: () => args.dopulls,
      completed: () =>
        checkPull($item`Great Wolf's beastly trousers`) || have($item`astral trousers`),
      do: (): void => {
        takeStorage($item`Great Wolf's beastly trousers`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Staff of Simering Hatred",
      ready: () => args.dopulls,
      completed: () => checkPull($item`Staff of Simmering Hatred`),
      do: (): void => {
        takeStorage($item`Staff of Simmering Hatred`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Tobiko Marble Soda",
      ready: () => args.dopulls,
      completed: () => checkPull($item`tobiko marble soda`),
      do: (): void => {
        takeStorage($item`tobiko marble soda`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Lathe",
      prepare: () => visitUrl("shop.php?whichshop=lathe"),
      completed: () =>
        have($item`weeping willow wand`) ||
        !have($item`SpinMaster™ lathe`) ||
        have($item`ebony epee`) ||
        get("_spinmasterLatheVisited", false),
      do: (): void => {
        if (!have($item`Staff of Simmering Hatred`)) {
          retrieveItem($item`weeping willow wand`);
        } else retrieveItem($item`ebony epee`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Grab Green Mana",
      ready: () => have($item`Deck of Every Card`),
      completed: () =>
        getRemainingCheats() <= 2 ||
        args.savedeck ||
        have($effect`Giant Growth`) ||
        !have($skill`Giant Growth`),
      do: (): void => {
        cheatCard("Forest");
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Daypass",
      completed: () =>
        powerlevelingLocation() !== $location`Uncle Gator's Country Fun-Time Liquid Waste Sluice` ||
        5 - get("_roninStoragePulls").split(",").length >= args.savepulls ||
        get("stenchAirportAlways") ||
        get("_stenchAirportToday"),
      do: (): void => {
        if (storageAmount($item`one-day ticket to Dinseylandfill`) === 0) {
          print(
            "Uh oh! You do not seem to have a one-day ticket to Dinseylandfill in Hagnk's",
            "red"
          );
          print(
            "Try to purchase one from the mall with your meat from Hagnk's before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`one-day ticket to Dinseylandfill`, 1);
        use($item`one-day ticket to Dinseylandfill`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Use Ten-Percent Bonus",
      prepare: (): void => {
        if (get("getawayCampsiteUnlocked")){
          visitUrl("place.php?whichplace=campaway&action=campaway_sky");
          if(!have($effect`That's just Cloud-Talk, Man`)
            print("No cloud talk today :(");
        }
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      completed: () => !have($item`a ten-percent bonus`),
      do: () => use($item`a ten-percent bonus`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Bastille",
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      completed: () => get("_bastilleGames") > 0 || !have($item`Bastille Battalion control rig`),
      do: () => cliExecute("bastille.ash mainstat brutalist"),
      limit: { tries: 1 },
    },
    {
      name: "Restore mp",
      completed: () => get("timesRested") >= args.saverests || myMp() >= Math.min(200, myMaxmp()),
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
      },
      do: (): void => {
        if (get("chateauAvailable")) {
          visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
        } else if (get("getawayCampsiteUnlocked")) {
          visitUrl("place.php?whichplace=campaway&action=campaway_tentclick");
        } else {
          visitUrl("campground.php?action=rest");
        }
      },
      outfit: { modifier: "myst, mp, -tie" },
    },
    {
      name: "Alice Army",
      completed: () => get("grimoire3Summons") > 0 || !have($skill`Summon Alice's Army Cards`),
      do: () => useSkill($skill`Summon Alice's Army Cards`),
      limit: { tries: 1 },
    },
    {
      name: "Confiscator's Grimoire",
      completed: () =>
        get("_grimoireConfiscatorSummons") > 0 || !have($skill`Summon Confiscated Things`),
      do: () => useSkill($skill`Summon Confiscated Things`),
      limit: { tries: 1 },
    },
    {
      name: "Eat Calzone",
      completed: () => get("calzoneOfLegendEaten") || !have($item`Calzone of Legend`),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        eat($item`Calzone of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Eat Deep Dish",
      completed: () =>
        get("deepDishOfLegendEaten") || !have($item`Deep Dish of Legend`) || args.deepdish,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        if (have($item`familiar scrapbook`)) {
          equip($item`familiar scrapbook`);
        }
        eat($item`Deep Dish of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Cast Prevent Scurvy",
      completed: () => !have($skill`Prevent Scurvy and Sobriety`) || get("_preventScurvy"),
      prepare: () => restoreMp(mpCost($skill`Prevent Scurvy and Sobriety`)),
      do: () => useSkill($skill`Prevent Scurvy and Sobriety`),
      limit: { tries: 1 },
    },
    {
      name: "Cast Perfect Freeze",
      completed: () =>
        !have($skill`Perfect Freeze`) || get("_perfectFreezeUsed") || args.perfectfreeze,
      prepare: () => restoreMp(mpCost($skill`Perfect Freeze`)),
      do: () => useSkill($skill`Perfect Freeze`),
      limit: { tries: 1 },
    },
    {
      name: "Drink Perfect Drink",
      completed: () =>
        myInebriety() >= 3 ||
        !have($item`perfect ice cube`) ||
        !baseBoozes.some((it) => have(it)) ||
        args.perfectfreeze,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        tryAcquiringEffect($effect`Ode to Booze`);
        const baseBooze = baseBoozes.filter((it) => have(it))[0];
        let booze;
        switch (baseBooze) {
          case $item`bottle of vodka`:
            booze = $item`perfect cosmopolitan`;
            break;
          case $item`bottle of whiskey`:
            booze = $item`perfect old-fashioned`;
            break;
          case $item`boxed wine`:
            booze = $item`perfect mimosa`;
            break;
          case $item`bottle of rum`:
            booze = $item`perfect dark and stormy`;
            break;
          case $item`bottle of tequila`:
            booze = $item`perfect paloma`;
            break;
          case $item`bottle of gin`:
            booze = $item`perfect negroni`;
            break;
          default:
            break;
        }
        if (booze) {
          create(booze, 1);
          drink(booze, 1);
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Consult Fortune Teller",
      completed: () => get("_clanFortuneBuffUsed") || args.savefortune,
      do: () => cliExecute(`fortune buff ${statToMaximizerString(myPrimestat())}`),
      limit: { tries: 1 },
    },
    {
      name: "Use General Store Statboost",
      completed: () => have(generalStoreXpEffect),
      do: () => ensureEffect(generalStoreXpEffect),
    },
    {
      name: "Buy Oversized Sparkler",
      ready: () => have($effect`Everything Looks Blue`) && get("hasRange") && myMeat() >= 1000,
      completed: () => have($item`oversized sparkler`),
      do: () => buy($item`oversized sparkler`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Eat Pizza",
      ready: () => have($effect`Ready to Eat`), // only eat this after we red rocket
      completed: () => get("pizzaOfLegendEaten") || !have($item`Pizza of Legend`),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        eat($item`Pizza of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Drink Astral Pilsners",
      ready: () => myLevel() >= 11,
      completed: () =>
        myInebriety() >= inebrietyLimit() ||
        (!have($item`astral six-pack`) && itemAmount($item`astral pilsner`) <= args.astralpils),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
        tryAcquiringEffect($effect`Ode to Booze`);
      },
      do: (): void => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`, 1);
        if (itemAmount($item`astral pilsner`) > args.astralpils) drink($item`astral pilsner`, 1);
      },
      post: (): void => {
        if (!have($item`astral six-pack`) && itemAmount($item`astral pilsner`) <= args.astralpils)
          uneffect($effect`Ode to Booze`);
      },
      limit: { tries: 6 },
    },
    {
      name: "Eat Magical Sausages",
      completed: () =>
        (!have($item`magical sausage`) && !have($item`magical sausage casing`)) ||
        myMeat() <= 3000 ||
        get("_sausagesMade") >= 3,
      do: (): void => {
        if (have($item`magical sausage casing`)) create($item`magical sausage`, 1);
        eat($item`magical sausage`, itemAmount($item`magical sausage`));
      },
      post: () => autosell($item`meat stack`, itemAmount($item`meat stack`)),
      limit: { tries: 23 },
    },
    {
      name: "BoomBox Meat",
      ready: () => have($item`Punching Potion`),
      completed: () =>
        SongBoom.song() === "Total Eclipse of Your Meat" || !have($item`SongBoom™ BoomBox`),
      do: () => SongBoom.setSong("Total Eclipse of Your Meat"),
      limit: { tries: 1 },
    },
    {
      name: "Map Amateur Ninja",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (!have($effect`Everything Looks Blue`) && !have($item`blue rocket`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase blue rocket!");
          buy($item`blue rocket`, 1);
        }
        unbreakableUmbrella();
        docBag();
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      completed: () =>
        !have($skill`Map the Monsters`) ||
        get("_monstersMapped") >= 3 ||
        have($item`li'l ninja costume`) ||
        !have($familiar`Trick-or-Treating Tot`) ||
        args.ninjamap,
      do: () => mapMonster($location`The Haiku Dungeon`, $monster`amateur ninja`),
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`amateur ninja`,
          Macro.tryItem($item`blue rocket`)
            .tryItem($item`red rocket`)
            .trySkill($skill`Chest X-Ray`)
            .trySkill($skill`Gingerbread Mob Hit`)
            .trySkill($skill`Shattering Punch`)
            .default()
        ).abort()
      ),
      outfit: () => ({
        ...baseOutfit,
        familiar: $familiar`Trick-or-Treating Tot`,
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Free Fight Leafy Boys",
      completed: () =>
        get("_leafMonstersFought", 0) >= 5 || !have($item`inflammable leaf`, 11) || saveLeafyBoys(),
      do: (): void => {
        visitUrl("campground.php?preaction=leaves");
        visitUrl("choice.php?pwd&whichchoice=1510&option=1&leaves=11");
      },
      combat: new CombatStrategy().macro(Macro.default()),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 5 },
    },
    {
      name: "Restore MP with Glowing Blue",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (!have($effect`Everything Looks Blue`) && !have($item`blue rocket`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase blue rocket!");
          buy($item`blue rocket`, 1);
        }
        unbreakableUmbrella();
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      completed: () => have($effect`Everything Looks Blue`),
      do: powerlevelingLocation(), // if your powerleveling location is the NEP you don't immediately get the MP regen
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Curse of Weaksauce`)
          .tryItem($item`blue rocket`)
          .tryItem($item`red rocket`)
          .default()
      ),
      outfit: () => baseOutfit(false),
      post: () => sellMiscellaneousItems(),
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      limit: { tries: 2 },
    },
    {
      name: "Restore MP with Glowing Blue (continued)",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
      },
      // We need to spend at least 1adv to get the mp regen from Glowing Blue
      // This is only an issue if our powerleveling zone is the NEP, since the previous fight would be free
      completed: () =>
        powerlevelingLocation() !== $location`The Neverending Party` ||
        haveEffect($effect`Glowing Blue`) !== 10 ||
        myMp() >= 500,
      do: $location`The Dire Warren`,
      outfit: () => baseOutfit(false),
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Get Rufus Quest",
      completed: () => get("_shadowAffinityToday") || !have($item`closed-circuit pay phone`),
      do: () => chooseQuest(() => 2),
      limit: { tries: 1 },
    },
    {
      name: "Shadow Rift",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      completed: () =>
        have($item`Rufus's shadow lodestone`) ||
        (!have($effect`Shadow Affinity`) && get("encountersUntilSRChoice") !== 0) ||
        !have($item`closed-circuit pay phone`),
      do: bestShadowRift(),
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`red rocket`)
          .trySkill($skill`Giant Growth`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .default()
      ),
      outfit: baseOutfit,
      post: (): void => {
        if (have(rufusTarget() as Item)) {
          withChoice(1498, 1, () => use($item`closed-circuit pay phone`));
        }
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 12 },
    },
    {
      name: "Get Range",
      completed: () => get("hasRange"),
      do: (): void => {
        if (!have($item`Dramatic™ range`)) {
          buy(1, $item`Dramatic™ range`);
        }
        use(1, $item`Dramatic™ range`);
      },
    },
    {
      name: "Use Reagent Booster",
      completed: () =>
        (!have(reagentBoosterIngredient) && !have(reagentBoosterItem)) ||
        have(reagentBoosterEffect),
      do: (): void => {
        if (!have(reagentBoosterItem)) {
          if (get("reagentSummons") === 0) useSkill($skill`Advanced Saucecrafting`, 1);
          create(reagentBoosterItem, 1);
        }
        ensureEffect(reagentBoosterEffect);
      },
    },
    {
      name: "Use Reagent Balancer",
      ready: () => get("_loveTunnelUsed") || !get("loveTunnelAvailable"),
      completed: () =>
        (!have(reagentBalancerIngredient) && itemAmount(reagentBalancerItem) <= 1) ||
        have(reagentBalancerEffect) ||
        itemAmount(reagentBalancerItem) === 1,
      do: (): void => {
        if (!have(reagentBalancerItem)) {
          if (get("reagentSummons") === 0) useSkill($skill`Advanced Saucecrafting`, 1);
          create(reagentBalancerItem, 1);
        }
        if (itemAmount(reagentBalancerItem) > 1)
          use(reagentBalancerItem, itemAmount(reagentBalancerItem) - 1);
        if (have(reagentBalancerIngredient) && have(reagentBalancerEffect))
          putCloset(itemAmount(reagentBalancerIngredient), reagentBalancerIngredient);
      },
      limit: { tries: 1 },
    },
    {
      name: "Snojo",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (get("snojoSetting") === null) {
          visitUrl("place.php?whichplace=snojo&action=snojo_controller");
          runChoice(1);
        }
        unbreakableUmbrella();
        restoreMp(50);
      },
      completed: () => get("_snojoFreeFights") >= 10 || !get("snojoAvailable"),
      do: $location`The X-32-F Combat Training Snowman`,
      combat: new CombatStrategy().macro(
        Macro.if_(
          "!haseffect Citizen of a Zone",
          Macro.trySkill($skill`%fn, let's pledge allegiance to a Zone`)
        )
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit,
        familiar: !have($effect`Citizen of a Zone`) ? $familiar`Patriotic Eagle` : chooseFamiliar(),
      }),
      limit: { tries: 10 },
      post: (): void => {
        if (get("_snojoFreeFights") >= 10) cliExecute("hottub");
        sendAutumnaton();
        sellMiscellaneousItems();
      },
    },
    {
      name: "Get Totem and Saucepan",
      completed: () => have($item`turtle totem`) && have($item`saucepan`),
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
      },
      limit: { tries: 50 },
    },
    {
      name: "Red Skeleton",
      ready: () =>
        !have($effect`Everything Looks Yellow`) ||
        (have($skill`Feel Envy`) && get("_feelEnvyUsed") < 3),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (!have($item`yellow rocket`) && !have($effect`Everything Looks Yellow`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase yellow rocket!");
          buy($item`yellow rocket`, 1);
        }
        unbreakableUmbrella();
        docBag();
      },
      completed: () =>
        CombatLoversLocket.monstersReminisced().includes($monster`red skeleton`) ||
        !CombatLoversLocket.availableLocketMonsters().includes($monster`red skeleton`) ||
        args.redskeleton ||
        checkValue("Locket", 4),
      do: () => CombatLoversLocket.reminisce($monster`red skeleton`),
      combat: new CombatStrategy().macro(
        Macro.if_("!haseffect Everything Looks Yellow", Macro.tryItem($item`yellow rocket`))
          .trySkill($skill`Feel Envy`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .default()
      ),
      outfit: () => baseOutfit(false),
      post: (): void => {
        use($item`red box`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Bakery Pledge",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        docBag();
        restoreMp(50);
      },
      ready: () => !get("snojoAvailable", false),
      completed: () =>
        have($effect`Citizen of a Zone`) ||
        !have($familiar`Patriotic Eagle`) ||
        get("_pledgeCheck", false) ||
        ((get("_shatteringPunchUsed") >= 3 || !have($skill`Shattering Punch`)) &&
          (get("_gingerbreadMobHitUsed") || !have($skill`Gingerbread Mob Hit`))),
      do: $location`Madness Bakery`,
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`blue rocket`)
          .tryItem($item`red rocket`)
          .trySkill($skill`%fn, let's pledge allegiance to a Zone`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Shattering Punch`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit,
        familiar: $familiar`Patriotic Eagle`,
      }),
      post: (): void => {
        sellMiscellaneousItems(), cliExecute("set _pledgeCheck = true");
      },
      limit: { tries: 2 },
    },
    {
      name: "LOV Tunnel",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        tryAcquiringEffect($effect`Comic Violence`);
      },
      completed: () => get("_loveTunnelUsed") || !get("loveTunnelAvailable"),
      do: () =>
        TunnelOfLove.fightAll(
          "LOV Epaulettes",
          "Open Heart Surgery",
          "LOV Extraterrestrial Chocolate"
        ),
      combat: new CombatStrategy().macro(
        Macro.if_($monster`LOV Enforcer`, Macro.attack().repeat())
          .if_(
            $monster`LOV Engineer`,
            Macro.while_(
              `!mpbelow ${mpCost($skill`Toynado`)} && hasskill ${toInt($skill`Toynado`)}`,
              Macro.skill($skill`Toynado`)
            )
              .while_(
                `!mpbelow ${mpCost($skill`Saucegeyser`)} && hasskill ${toInt($skill`Saucegeyser`)}`,
                Macro.skill($skill`Saucegeyser`)
              )
              .while_(
                `!mpbelow ${mpCost($skill`Saucestorm`)} && hasskill ${toInt($skill`Saucestorm`)}`,
                Macro.skill($skill`Saucestorm`)
              )
              .repeat()
          )
          .if_($monster`LOV Equivocator`, Macro.default())
      ),
      outfit: () => ({
        ...baseOutfit(false),
        weapon: $item`Fourth of May Cosplay Saber`,
      }),
      limit: { tries: 1 },
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        if (have($item`LOV Extraterrestrial Chocolate`))
          use($item`LOV Extraterrestrial Chocolate`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
      },
    },
    {
      name: "Restore cinch",
      completed: () =>
        get("timesRested") >= args.saverests || get("_cinchUsed", 0) <= 95 || !useCinch,
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
      },
      do: (): void => {
        if (get("chateauAvailable")) {
          visitUrl("place.php?whichplace=chateau&action=chateau_restbox");
        } else if (get("getawayCampsiteUnlocked")) {
          visitUrl("place.php?whichplace=campaway&action=campaway_tentclick");
        } else {
          visitUrl("campground.php?action=rest");
        }
      },
      outfit: { modifier: "myst, mp" },
    },
    {
      name: "Monster Habitats",
      ready: () =>
        get("_monsterHabitatsFightsLeft") > 0 &&
        (haveFreeBanish() ||
          Array.from(getBanishedMonsters().values()).includes($monster`fluffy bunny`)),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () => get("_monsterHabitatsFightsLeft") === 0,
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(() =>
        Macro.if_($monster`fluffy bunny`, Macro.banish())
          .externalIf(
            get("_monsterHabitatsFightsLeft") <= 1 &&
              toInt(get("_monsterHabitatsRecalled")) < 3 - toInt(args.savehabitats) &&
              have($skill`Recall Facts: Monster Habitats`) &&
              (haveFreeBanish() ||
                Array.from(getBanishedMonsters().values()).includes($monster`fluffy bunny`)),
            Macro.trySkill($skill`Recall Facts: Monster Habitats`)
          )
          .default(useCinch)
      ),
      outfit: baseOutfit,
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 15 },
    },
    {
      name: "Backups",
      ready: () => freeFightMonsters.includes(get("lastCopyableMonster") ?? $monster.none),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () =>
        !have($item`backup camera`) ||
        !freeFightMonsters.includes(get("lastCopyableMonster") ?? $monster.none) ||
        get("_backUpUses") >= 11 - clamp(args.savebackups, 0, 11) ||
        myBasestat(myPrimestat()) >= 190, // no longer need to back up Witchess Kings
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Back-Up to your Last Enemy`).default(useCinch)
      ),
      outfit: () => ({
        ...baseOutfit(),
        acc3: $item`backup camera`,
      }),
      post: (): void => {
        if (!freeFightMonsters.includes(get("lastCopyableMonster") ?? $monster.none))
          throw new Error("Fought unexpected monster");
        sendAutumnaton();
        sellMiscellaneousItems();
      },
      limit: { tries: 11 },
    },
    {
      name: "Kramco",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      ready: () => getKramcoWandererChance() >= 1.0,
      completed: () => getKramcoWandererChance() < 1.0 || !have($item`Kramco Sausage-o-Matic™`),
      do: $location`Noob Cave`,
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`Kramco Sausage-o-Matic™`,
      }),
      combat: new CombatStrategy().macro(() =>
        Macro.externalIf(
          get("_monsterHabitatsFightsLeft") <= 1 &&
            toInt(get("_monsterHabitatsRecalled")) < 3 - args.savehabitats &&
            have($skill`Recall Facts: Monster Habitats`) &&
            (haveFreeBanish() ||
              Array.from(getBanishedMonsters().values()).includes($monster`fluffy bunny`)),
          Macro.trySkill($skill`Recall Facts: Monster Habitats`)
        ).default(useCinch)
      ),
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Oliver's Place (Map)",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
        if (SourceTerminal.have()) cliExecute("terminal educate portscan");
      },
      completed: () =>
        get("_speakeasyFreeFights", 0) >= 1 ||
        !get("ownsSpeakeasy") ||
        !have($skill`Map the Monsters`) ||
        get("_monstersMapped") >= 3,
      do: () => mapMonster($location`An Unusually Quiet Barroom Brawl`, $monster`goblin flapper`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Envy`)
          .trySkill($skill`Portscan`)
          .default()
      ),
      outfit: baseOutfit,
      limit: { tries: 1 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Oliver's Place (Portscan)",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
        if (SourceTerminal.have()) cliExecute("terminal educate portscan");
      },
      completed: () =>
        get("_speakeasyFreeFights", 0) >= 2 ||
        !get("ownsSpeakeasy") ||
        !SourceTerminal.have() ||
        get("_sourceTerminalPortscanUses") > 0,
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Portscan`).default()),
      outfit: baseOutfit,
      limit: { tries: 1 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Oliver's Place",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
      },
      completed: () => get("_speakeasyFreeFights", 0) >= 3 || !get("ownsSpeakeasy"),
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: baseOutfit,
      limit: { tries: 3 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Map Pocket Wishes",
      after: ["Oliver's Place (Map)"],
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (!have($effect`Everything Looks Blue`) && !have($item`blue rocket`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase blue rocket!");
          buy($item`blue rocket`, 1);
        }
        unbreakableUmbrella();
        docBag();
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      completed: () =>
        !have($skill`Map the Monsters`) ||
        !have($skill`Just the Facts`) ||
        get("_monstersMapped") >= 3 ||
        have($item`pocket wish`, 1) ||
        myClass() !== $class`Seal Clubber` ||
        ((get("_shatteringPunchUsed") >= 3 || !have($skill`Shattering Punch`)) &&
          (get("_gingerbreadMobHitUsed") || !have($skill`Gingerbread Mob Hit`))),
      do: () => mapMonster($location`The Haunted Kitchen`, $monster`paper towelgeist`),
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`paper towelgeist`,
          Macro.tryItem($item`blue rocket`)
            .tryItem($item`red rocket`)
            .trySkill($skill`Chest X-Ray`)
            .trySkill($skill`Gingerbread Mob Hit`)
            .trySkill($skill`Shattering Punch`)
            .default()
        ).abort()
      ),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "God Lobster",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () => get("_godLobsterFights") >= 3 || !have($familiar`God Lobster`),
      do: () => visitUrl("main.php?fightgodlobster=1"),
      combat: new CombatStrategy().macro(Macro.default(useCinch)),
      choices: { 1310: godLobsterChoice }, // Get xp on last fight
      outfit: () => ({
        ...baseOutfit(),
        famequip: $items`God Lobster's Ring, God Lobster's Scepter`,
        familiar: $familiar`God Lobster`,
      }),
      limit: { tries: 3 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Eldritch Tentacle",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () => get("_eldritchHorrorEvoked") || !have($skill`Evoke Eldritch Horror`),
      do: () => useSkill($skill`Evoke Eldritch Horror`),
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        sendAutumnaton();
        sellMiscellaneousItems();
      },
      combat: new CombatStrategy().macro(Macro.default(useCinch)),
      outfit: baseOutfit,
      limit: { tries: 1 },
    },
    {
      name: "Witchess Bishop",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () =>
        get("_witchessFights") >= 4 - (args.skipbishop ? 2 : 0) ||
        !Witchess.have() ||
        args.witchess,
      do: () => Witchess.fightPiece($monster`Witchess Bishop`),
      combat: new CombatStrategy().macro(() =>
        Macro.externalIf(
          get("_monsterHabitatsFightsLeft") <= 1 &&
            toInt(get("_monsterHabitatsRecalled")) < 3 - args.savehabitats &&
            have($skill`Recall Facts: Monster Habitats`) &&
            (haveFreeBanish() ||
              Array.from(getBanishedMonsters().values()).includes($monster`fluffy bunny`)),
          Macro.trySkill($skill`Recall Facts: Monster Habitats`)
        ).default(useCinch)
      ),
      outfit: baseOutfit,
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 5 },
    },
    {
      name: "DMT",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () => get("_machineTunnelsAdv") >= 5 || !have($familiar`Machine Elf`),
      do: $location`The Deep Machine Tunnels`,
      combat: new CombatStrategy().macro(Macro.default(useCinch)),
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Machine Elf`,
      }),
      limit: { tries: 5 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Powerlevel",
      completed: () =>
        myBasestat(myPrimestat()) >= targetBaseMyst - targetBaseMystGap && // I don't know if this will cause issues.
        (powerlevelingLocation() !== $location`The Neverending Party` ||
          overlevelled() ||
          get("_neverendingPartyFreeTurns") >= 10),
      do: powerlevelingLocation(),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        if (mainStatStr === `Muscle`) {
          muscleList.forEach((ef) => tryAcquiringEffect(ef));
        }
        if (mainStatStr === `Mysticality`) {
          mysticalityList.forEach((ef) => tryAcquiringEffect(ef));
        }
        if (mainStatStr === `Moxie`) {
          moxieList.forEach((ef) => tryAcquiringEffect(ef));
        }
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      outfit: baseOutfit,
      limit: { tries: 60 },
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`red rocket`)
          .trySkill($skill`Feel Pride`)
          .trySkill($skill`Cincho: Confetti Extravaganza`)
          .trySkill($skill`Bowl Sideways`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .default(useCinch)
      ),
      post: (): void => {
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Extra Camelspit Leveling",
      ready: () => get("camelSpit") >= 94 && myBasestat(myPrimestat()) >= targetBaseMyst,
      completed: () => !args.camelhat || get("camelSpit") >= 100,
      do: powerlevelingLocation(),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        if (mainStatStr === `Muscle`) {
          muscleList.forEach((ef) => tryAcquiringEffect(ef));
        }
        if (mainStatStr === `Mysticality`) {
          mysticalityList.forEach((ef) => tryAcquiringEffect(ef));
        }
        if (mainStatStr === `Moxie`) {
          moxieList.forEach((ef) => tryAcquiringEffect(ef));
        }
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
        if (!have($effect`Everything Looks Red`) && !have($item`red rocket`)) {
          if (myMeat() >= 250) buy($item`red rocket`, 1);
        }
      },
      outfit: () => ({
        ...baseOutfit(),
        familiar: $familiar`Melodramedary`,
      }),
      limit: { tries: 60 },
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Pride`)
          .trySkill($skill`Cincho: Confetti Extravaganza`)
          .trySkill($skill`Gulp Latte`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .default(useCinch)
      ),
      post: (): void => {
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Drink Bee's Knees",
      after: ["Powerlevel"],
      completed: () => have($effect`On the Trolley`) || args.beesknees,
      do: (): void => {
        if (myMeat() < 500) throw new Error("Insufficient Meat to purchase Bee's Knees!");
        tryAcquiringEffect($effect`Ode to Booze`);
        visitUrl(`clan_viplounge.php?preaction=speakeasydrink&drink=5&pwd=${+myHash()}`); // Bee's Knees
      },
      limit: { tries: 1 },
    },
    {
      name: "Acquire Lyle's Buff",
      completed: () => get("_lyleFavored"),
      do: (): void => {
        tryAcquiringEffect($effect`Favored by Lyle`);
        tryAcquiringEffect($effect`Starry-Eyed`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess King",
      prepare: (): void => {
        garbageShirt();
        [
          ...usefulEffects.filter((ef) => !$effects`Song of Sauce, Song of Bravado`.includes(ef)),
          ...prismaticEffects,
          ...wdmgEffects,
          ...statEffects,
        ].forEach((ef) => tryAcquiringEffect(ef));
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        have($item`dented scepter`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess,
      do: () => Witchess.fightPiece($monster`Witchess King`),
      combat: new CombatStrategy().macro(Macro.default(useCinch)),
      outfit: baseOutfit,
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess Witch",
      prepare: (): void => {
        garbageShirt();
        [
          ...usefulEffects.filter((ef) => !$effects`Song of Sauce, Song of Bravado`.includes(ef)),
          ...prismaticEffects,
          ...wdmgEffects,
          ...statEffects,
        ].forEach((ef) => tryAcquiringEffect(ef));
        if (get("_hotTubSoaks") < 5 && myHp() < myMaxhp()) cliExecute("hottub");
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        have($item`battle broom`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess,
      do: () => Witchess.fightPiece($monster`Witchess Witch`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Curse of Weaksauce`)
          .attack()
          .repeat()
      ),
      outfit: {
        ...baseOutfit(),
        weapon:
          have($effect`Comic Violence`) && have($item`Fourth of May Cosplay Saber`)
            ? $item`Fourth of May Cosplay Saber`
            : $item`June cleaver`,
        offhand: have($skill`Double-Fisted Skull Smashing`) ? $item`dented scepter` : undefined,
        modifier: "weapon dmg",
      },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess Queen",
      prepare: (): void => {
        garbageShirt();
        [
          ...usefulEffects.filter((ef) => !$effects`Song of Sauce, Song of Bravado`.includes(ef)),
          ...prismaticEffects,
          ...wdmgEffects,
          ...statEffects,
        ].forEach((ef) => tryAcquiringEffect(ef));
        if (get("_hotTubSoaks") < 5 && myHp() < myMaxhp()) cliExecute("hottub");
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        have($item`very pointy crown`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess,
      do: () => Witchess.fightPiece($monster`Witchess Queen`),
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
      outfit: {
        ...baseOutfit(),
        weapon:
          have($effect`Comic Violence`) && have($item`Fourth of May Cosplay Saber`)
            ? $item`Fourth of May Cosplay Saber`
            : $item`June cleaver`,
        offhand: have($skill`Double-Fisted Skull Smashing`) ? $item`dented scepter` : undefined,
      },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess King (Locket)",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        garbageShirt();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      completed: () =>
        CombatLoversLocket.monstersReminisced().includes($monster`Witchess King`) ||
        !CombatLoversLocket.availableLocketMonsters().includes($monster`Witchess King`) ||
        args.witchessking ||
        have($item`dented scepter`),
      do: () => CombatLoversLocket.reminisce($monster`Witchess King`),
      combat: new CombatStrategy().macro(() =>
        Macro.externalIf(
          get("_monsterHabitatsFightsLeft") <= 1 &&
            get("_monsterHabitatsRecalled") < 3 - args.savehabitats &&
            have($skill`Recall Facts: Monster Habitats`) &&
            (haveFreeBanish() ||
              Array.from(getBanishedMonsters().values()).includes($monster`fluffy bunny`)),
          Macro.trySkill($skill`Recall Facts: Monster Habitats`)
        ).default(useCinch)
      ),
      outfit: baseOutfit,
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Free Kills and More Fights",
      after: ["Drink Bee's Knees"],
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        if (equippedItem($slot`offhand`) !== $item`latte lovers member's mug`) {
          unbreakableUmbrella();
        }
        garbageShirt();
        docBag();
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
        restoreMp(50);
      },
      outfit: (): OutfitSpec => {
        if (
          chooseLibram() === $skill.none ||
          !have($item`latte lovers member's mug`) ||
          get("_latteRefillsUsed") >= 3
        )
          return baseOutfit();
        else
          return {
            ...baseOutfit(),
            offhand: $item`latte lovers member's mug`,
          };
      },
      completed: () =>
        (myBasestat(myPrimestat()) >= targetBaseMyst && get("_feelPrideUsed", 3) >= 3) ||
        ((get("_shatteringPunchUsed") >= 3 || !have($skill`Shattering Punch`)) &&
          (get("_gingerbreadMobHitUsed") || !have($skill`Gingerbread Mob Hit`))) ||
        overlevelled(),
      do: powerlevelingLocation(),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Pride`)
          .trySkill($skill`Cincho: Confetti Extravaganza`)
          .trySkill($skill`Gulp Latte`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Shattering Punch`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Bowl Sideways`)
          .default(useCinch)
      ),
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
      },
      post: (): void => {
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        burnLibram(500);
        refillLatte();
        boomBoxProfit();
      },
      limit: { tries: 20 },
    },
  ],
};
