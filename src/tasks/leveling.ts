import { Quest } from "../engine/task";
import {
  abort,
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
  getWorkshed,
  haveEffect,
  holiday,
  inebrietyLimit,
  Item,
  itemAmount,
  itemDrops,
  Location,
  mallPrice,
  mpCost,
  myAdventures,
  myBasestat,
  myClass,
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
  refreshStatus,
  restoreHp,
  restoreMp,
  retrieveItem,
  runChoice,
  storageAmount,
  takeStorage,
  toInt,
  toItem,
  toSkill,
  use,
  useFamiliar,
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
  $skill,
  $slot,
  $stat,
  AprilingBandHelmet,
  AutumnAton,
  CinchoDeMayo,
  clamp,
  CombatLoversLocket,
  ensureEffect,
  get,
  getKramcoWandererChance,
  have,
  Leprecondo,
  MayamCalendar,
  PeridotOfPeril,
  PrismaticBeret,
  set,
  // set,
  SongBoom,
  SourceTerminal,
  sum,
  TrainSet,
  TunnelOfLove,
  uneffect,
  unequip,
  Witchess,
  withChoice,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import {
  boomBoxProfit,
  burnLibram,
  //burnLibram,
  camelFightsLeft,
  checkPurqoise,
  checkValue,
  forbiddenEffects,
  generalStoreXpEffect,
  mainStatMaximizerStr,
  peridotChoice,
  reagentBalancerEffect,
  reagentBalancerIngredient,
  reagentBalancerItem,
  reagentBoosterEffect,
  reagentBoosterIngredient,
  reagentBoosterItem,
  refillLatte,
  sellMiscellaneousItems,
  statToMaximizerString,
  tryAcquiringEffect,
  useOffhandRemarkable,
} from "../lib";
import { baseOutfit, garbageShirt, unbreakableUmbrella } from "../engine/outfit";
import Macro, { haveFreeKill } from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import {
  chooseQuest,
  chooseRift,
  rufusTarget,
} from "libram/dist/resources/2023/ClosedCircuitPayphone";
import { cheatCard, getRemainingCheats } from "libram/dist/resources/2015/DeckOfEveryCard";
import { args } from "../args";
import {
  canConfigure,
  Cycle,
  setConfiguration,
  Station,
} from "libram/dist/resources/2022/TrainSet";
import { freekillMacro, freekillOutfit, freekillsRemaining } from "../engine/resources";

export const useCinch = () => get("_cinchUsed") <= 75;
const godLobsterChoice = () => (have($item`God Lobster's Ring`) ? 2 : 3);

export function restoreMPEfficiently(): string {
  if (have($item`bat wings`) && get("_batWingsRestUsed", 0) < 11) return "Bat Wings";
  if (have($item`magical sausage`)) return "Sausage";
  if (!get("_latteDrinkUsed", false) && have($item`latte lovers member's mug`)) return "Gulp";
  if (have($item`magical sausage casing`) && myMeat() >= 3000) return "Make Sausage";
  if (have($item`latte lovers member's mug`) && get("_latteRefillsUsed") < 3) return "Refill Latte";
  if (!have($effect`Everything Looks Blue`)) return "Blue Rocket";
  return "No restore available";
}

const mainStatStr = myPrimestat().toString();
const LOVEquip =
  myPrimestat() === $stat`Muscle`
    ? "LOV Eardigan"
    : myPrimestat() === $stat`Mysticality`
    ? "LOV Epaulettes"
    : "LOV Earring";
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
  $effect`Rage of the Reindeer`,
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
  $effect`substats.enh`,
  $effect`Broad-Spectrum Vaccine`,
  $effect`Pyrite Pride`,
  $effect`Having a Ball!`,
  // $effect`Think Win-Lose`,
  $effect`Confidence of the Votive`,
  $effect`Song of Bravado`,
  $effect`Cold as Nice`,
  $effect`Ultraheart`,

  // ML
  $effect`Pride of the Puffin`,
  $effect`Drescher's Annoying Noise`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Misplaced Rage`,

  // Xp
  $effect`Carol of the Thrills`,
  $effect`Wisdom of Others`,
  $effect`Best Pals`,

  // Songs
  $effect`Stevedave's Shanty of Superiority`,
  $effect`Ur-Kel's Aria of Annoyance`,
  $effect`Aloysius' Antiphon of Aptitude`,

  // Spell dmg
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

function prepCommon(hp: boolean = true, mp: boolean = true, effects: boolean = true) {
  if (hp) restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
  unbreakableUmbrella();
  garbageShirt();
  if (effects) [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
  if (mp) restoreMp(50);
}

export const LevelingQuest: Quest = {
  name: "Leveling",
  completed: () =>
    get("csServicesPerformed").split(",").length > 1 ||
    (have($effect`Spit Upon`) && have($item`short stack of pancakes`) && myLevel() >= 20) ||
    (get("_feelPrideUsed", 3) >= 3 && camelFightsLeft() === 0 && !haveFreeKill()),
  tasks: [
    {
      name: "Open Mayday",
      ready: () => have($item`MayDay™ supply package`) && !args.savemayday,
      completed: () => !have($item`MayDay™ supply package`),
      do: (): void => {
        use($item`MayDay™ supply package`);
        if (have($item`space blanket`)) autosell($item`space blanket`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Eat Magical Sausages",
      ready: () =>
        restoreMPEfficiently() === "Sausage" ||
        restoreMPEfficiently() === "Make Sausage" ||
        myAdventures() < 1,
      completed: () =>
        get("_sausagesMade") >= 23 ||
        (myMp() >= 75 &&
          restoreMPEfficiently() !== "Sausage" &&
          restoreMPEfficiently() !== "Make Sausage" &&
          myAdventures() > 1),
      do: (): void => {
        if (restoreMPEfficiently() === "Sausage") eat($item`magical sausage`, 1);
        else {
          create($item`magical sausage`, 1);
          eat($item`magical sausage`, 1);
        }
      },
      post: () => autosell($item`meat stack`, itemAmount($item`meat stack`)),
      limit: { tries: 23 },
    },
    {
      name: "LED Candle",
      completed: () => !have($item`LED candle`) || get("ledCandleMode", "") === "reading",
      do: () => cliExecute("jillcandle reading"),
      limit: { tries: 1 },
    },
    {
      name: "Leprecondo",
      ready: () => Leprecondo.have(),
      completed: () => Leprecondo.installedFurniture().includes("sous vide laboratory"),
      do: () => Leprecondo.setFurniture("sous vide laboratory", "couch and flatscreen", "whiskeybed", "beer pong table"),
      limit: { tries: 1 },
    },
    {
      name: "Cross Streams",
      ready: () => have($item`protonic accelerator pack`),
      completed: () => get("_streamsCrossed"),
      do: () => cliExecute("crossstreams"),
      limit: { tries: 1 },
    },
    {
      name: "Party Soundtrack",
      ready: () => have($item`Cincho de Mayo`) && CinchoDeMayo.currentCinch() >= 30,
      completed: () => have($effect`Party Soundtrack`),
      do: () => useSkill($skill`Cincho: Party Soundtrack`),
      limit: { tries: 1 },
    },
    {
      name: "Beret? Beret.",
      ready: () =>
        have(toItem(11919)) && have($item`punk rock jacket`) && myBasestat($stat`muscle`) > 100,
      completed: () => get("_beretBuskingUses", 0) >= 5 || get("_triedBeret", false),
      do: () => {
        PrismaticBeret.buskAt(825, true);
        PrismaticBeret.buskAt(800, true);
        PrismaticBeret.buskAt(885, true);
        PrismaticBeret.buskAt(765, true);
        PrismaticBeret.buskAt(800, true);
        set("_triedBeret", true);
      },
      limit: { tries: 1 },
    },
    {
      name: "Do the sweats",
      ready: () => have($item`blood cubic zirconia`),
      completed: () => have($effect`Up To 11`),
      do: () => {
        useSkill($skill`BCZ: Dial it up to 11`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Leprecondo",
      ready: () => Leprecondo.have(),
      completed: () => Leprecondo.installedFurniture().includes("sous vide laboratory") || get("_condoTested", false),
      do: () => {
        Leprecondo.setFurniture(
          "sous vide laboratory",
          "couch and flatscreen",
          "whiskeybed",
          "beer pong table"
        )
        set("_condoTested", true);
      },
      limit: { tries: 1 },
    },
    {
      name: "Smile of Lyle",
      ready: () => have($item`candy cane sword cane`),
      completed: () => get("_lyleFavored"),
      do: () => cliExecute("monorail buff"),
    },
    {
      name: "Telescope",
      completed: () => get("telescopeLookedHigh"),
      do: () => cliExecute("telescope look high"),
    },
    {
      name: "Offhand Remarkable Maybe",
      ready: () => useOffhandRemarkable(),
      completed: () => have($effect`Offhand Remarkable`) || get("_aug13Cast", false),
      do: () => useSkill($skill`Aug. 13th: Left/Off Hander's Day!`),
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
      name: "Wardrobe-o-matic",
      ready: () => myLevel() >= 20 && have($item`wardrobe-o-matic`),
      completed: () => get("_wardrobeUsed", false),
      do: (): void => {
        use($item`wardrobe-o-matic`);
        cliExecute("set _wardrobeUsed = true");
      },
      limit: { tries: 1 },
    },
    {
      name: "Crimbo Candy",
      completed: () => get("_candySummons", 0) > 0 || !have($skill`Summon Crimbo Candy`),
      do: () => useSkill($skill`Summon Crimbo Candy`),
      limit: { tries: 1 },
    },
    {
      name: "Extra Buffs",
      prepare: () => equip($item`April Shower Thoughts shield`),
      completed: () => have($effect`Thoughtful Empathy`),
      do: () => {
        visitUrl("inventory.php?action=shower&pwd");
        visitUrl("shop.php?whichshop=showerthoughts");
        visitUrl("shop.php?whichshop=showerthoughts&action=buyitem&quantity=1&whichrow=1581&pwd");
        use($item`wet paper weights`);
        useSkill($skill`Disco Aerobics`);
        useSkill($skill`Patience of the Tortoise`);
        useSkill($skill`Empathy of the Newt`);
        unequip($item`April Shower Thoughts shield`);
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
        } else if (!have($item`candy cane sword cane`) || !have($item`Stick-Knife of Loathing`))
          retrieveItem($item`ebony epee`);
        else retrieveItem($item`weeping willow wand`);
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
        if (get("getawayCampsiteUnlocked")) {
          visitUrl("place.php?whichplace=campaway&action=campaway_sky");
          if (!have($effect`That's Just Cloud-Talk, Man`)) print("No cloud talk today :(");
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
      name: "Punk Rock Giant Spit",
      completed: () => have($effect`Everything Looks Yellow`) || have($item`punk rock jacket`),
      do: (): void => {
        CombatLoversLocket.reminisce($monster`Punk Rock Giant`);
      },
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`Jurassic Parka`,
        modes: { parka: "dilophosaur" },
      }),
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Spit jurassic acid`).abort()),
      limit: { tries: 1 },
    },
    {
      name: "Restore mp",
      completed: () => get("timesRested") >= args.saverests || myMp() >= Math.min(50, myMaxmp()),
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
        sellMiscellaneousItems();
      },
      do: (): void => {
        if (myMeat() >= 2000) {
          restoreMp(50);
        }
        useFamiliar($familiar`Skeleton of Crimbo Past`);
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
      completed: () => get("deepDishOfLegendEaten") || !have($item`Deep Dish of Legend`),
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
      name: "Eat Pizza",
      completed: () => get("pizzaOfLegendEaten") || !have($item`Pizza of Legend`),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        if (have($item`familiar scrapbook`)) {
          equip($item`familiar scrapbook`);
        }
        eat($item`Pizza of Legend`, 1);
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
      name: "Consult Fortune Teller",
      completed: () => get("_clanFortuneBuffUsed") || args.savefortune,
      do: () => cliExecute(`fortune buff ${statToMaximizerString(myPrimestat())}`),
      limit: { tries: 1 },
    },
    {
      name: "Use General Store Statboost",
      prepare: (): void => {
        sellMiscellaneousItems();
        if (checkPurqoise(250)) autosell($item`porquoise`, 1);
      },
      completed: () => have(generalStoreXpEffect),
      do: () => ensureEffect(generalStoreXpEffect),
    },
    {
      name: "Buy Oversized Sparkler",
      ready: () => get("hasRange") && myMeat() >= 1000,
      prepare: (): void => {
        sellMiscellaneousItems();
        if (checkPurqoise(250)) autosell($item`porquoise`, 1);
      },
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
        (!have($item`astral six-pack`) && itemAmount($item`astral pilsner`) <= 5),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
        tryAcquiringEffect($effect`Ode to Booze`);
      },
      do: (): void => {
        if (have($item`astral six-pack`)) use($item`astral six-pack`, 1);
        if (
          have($familiar`Cooler Yeti`) &&
          MayamCalendar.have() &&
          !MayamCalendar.symbolsUsed().includes("fur") &&
          AprilingBandHelmet.have()
        ) {
          useFamiliar($familiar`Cooler Yeti`);
          MayamCalendar.submit("fur yam2 wall yam4");
          AprilingBandHelmet.joinSection("Apriling band piccolo");
          AprilingBandHelmet.play("Apriling band piccolo");
          AprilingBandHelmet.play("Apriling band piccolo");
        }
        if (have($familiar`Cooler Yeti`) && $familiar`Cooler Yeti`.experience > 225) {
          visitUrl("main.php?talktoyeti=1", false);
          runChoice(3);
        }
        if (itemAmount($item`astral pilsner`) > 5) drink($item`astral pilsner`, 1);
      },
      post: (): void => {
        if (!have($item`astral six-pack`) && itemAmount($item`astral pilsner`) <= args.astralpils)
          uneffect($effect`Ode to Booze`);
      },
      limit: { tries: 6 },
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
      // Set up a pretty lit buff
      name: "NEP Episode 2: The Prequel",
      ready: () => get("noncombatForcerActive"),
      completed: () => have($effect`Spiced Up`),
      prepare: () => prepCommon,
      do: $location`The Neverending Party`,
      choices: {
        1324: 2,
        1326: 2,
        1562: 9,
      },
      combat: new CombatStrategy().macro(Macro.trySkill($skill`%fn, spit on me!`).kill()),
      outfit: () => ({
        ...baseOutfit(),
        acc3: get("_mobiusStripEncounters", 0) === 0 ? $item`Möbius ring` : undefined,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Get an S",
      ready: () =>
        have($item`legendary seal-clubbing club`) && have($item`Heartstone`),
      prepare: () => prepCommon,
      completed: () =>
        get("_clubEmTimeUsed") >= 1 ||
        PeridotOfPeril.zonesToday().includes($location`The Outskirts of Cobb's Knob`),
      do: $location`The Outskirts of Cobb's Knob`,
      choices: peridotChoice($monster`Knob Goblin Assistant Chef`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Steal Monster's Heart`)
          .trySkill($skill`Club 'Em Back in Time`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`legendary seal-clubbing club`,
        acc2: $item`Heartstone`,
        acc3: $item`Peridot of Peril`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        refreshStatus();
      },
    },
    {
      name: "Get a P",
      ready: () =>
        have($item`legendary seal-clubbing club`) && have($item`Heartstone`),
      prepare: () => prepCommon,
      completed: () =>
        get("_clubEmTimeUsed") >= 2 ||
        PeridotOfPeril.zonesToday().includes($location`The Sleazy Back Alley`),
      do: $location`The Sleazy Back Alley`,
      choices: peridotChoice($monster`big creepy spider`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Steal Monster's Heart`)
          .trySkill($skill`Club 'Em Back in Time`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`legendary seal-clubbing club`,
        acc2: $item`Heartstone`,
        acc3: $item`Peridot of Peril`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        refreshStatus();
      },
    },
    {
      name: "Get an I",
      ready: () =>
        have($item`legendary seal-clubbing club`) && have($item`Heartstone`),
      prepare: () => prepCommon,
      completed: () =>
        get("_clubEmTimeUsed") >= 3 ||
        PeridotOfPeril.zonesToday().includes($location`The Skeleton Store`),
      do: $location`The Skeleton Store`,
      choices: peridotChoice($monster`novelty tropical skeleton`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Steal Monster's Heart`)
          .trySkill($skill`Club 'Em Back in Time`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`legendary seal-clubbing club`,
        acc2: $item`Heartstone`,
        acc3: $item`Peridot of Peril`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        refreshStatus();
      },
    },
    {
      name: "Get a T",
      ready: () =>
        have($item`legendary seal-clubbing club`) && have($item`Heartstone`),
      prepare: () => prepCommon,
      completed: () =>
        get("_clubEmTimeUsed") >= 4 ||
        PeridotOfPeril.zonesToday().includes($location`The Haunted Conservatory`),
      do: $location`The Haunted Conservatory`,
      choices: peridotChoice($monster`skeletal cat`),

      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Steal Monster's Heart`)
          .trySkill($skill`Club 'Em Back in Time`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`legendary seal-clubbing club`,
        acc2: $item`Heartstone`,
        acc3: $item`Peridot of Peril`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        refreshStatus();
      },
    },
    {
      // This won't actually run until it's ready, but we put it here, early, so that when it's ready it can run
      name: "Early Camel Spit",
      ready: () => get("camelSpit") >= 100,
      prepare: () => prepCommon,
      completed: () => have($effect`Spit Upon`),
      do: $location`Noob Cave`,
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
        1326: 2,
      },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Spring Away`)
          .abort()
      ),
      outfit: () => ({
        acc3: $item`spring shoes`,
        shirt: $item`Jurassic Parka`,
        familiar: $familiar`Melodramedary`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        refreshStatus();
      },
    },
    {
      name: "Ghost",
      prepare: () => {
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () => get("questPAGhost") === "unstarted",
      ready: () =>
        have($item`protonic accelerator pack`) &&
        get("questPAGhost") !== "unstarted" &&
        !!get("ghostLocation") &&
        !have($effect`Meteor Showered`),
      do: () => get("ghostLocation") ?? abort("Failed to identify ghost location"),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Micrometeorite`)
          .trySkill($skill`Shoot Ghost`)
          .trySkill($skill`Shoot Ghost`)
          .trySkill($skill`Shoot Ghost`)
          .trySkill($skill`Trap Ghost`)
      ),
      outfit: () => ({
        // eslint-disable-next-line libram/verify-constants
        ...baseOutfit(true, false, $monster`ice woman`),
        back: $item`protonic accelerator pack`,
      }),
    },
    {
      name: "Map Amateur Ninja",
      prepare: () => prepCommon,
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
      prepare: () => {
        [...usefulEffects, ...statEffects].forEach((ef) => tryAcquiringEffect(ef));
      },
      ready: () => !have($effect`Shadow Affinity`),
      completed: () => get("_leafMonstersFought", 0) >= 5 || !have($item`inflammable leaf`, 11),
      do: (): void => {
        visitUrl("campground.php?preaction=leaves");
        visitUrl("choice.php?pwd&whichchoice=1510&option=1&leaves=11");
      },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Spring Growth Spurt`)
          .trySkill($skill`Tear Away your Pants!`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit(true, true, $monster`flaming leaflet`),
        pants: have($item`tearaway pants`) ? $item`tearaway pants` : undefined,
        acc3: have($item`spring shoes`) ? $item`spring shoes` : undefined,
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 5 },
    },
    {
      name: "ReConfigure Trainset",
      ready: () => canConfigure(),
      completed: () =>
        args.asdon ||
        !have($item`model train set`) ||
        (getWorkshed() === $item`model train set` && !canConfigure()),
      do: (): void => {
        const offset = get("trainsetPosition") % 8;
        const newStations: TrainSet.Station[] = [];
        const statStation: Station = {
          Muscle: Station.BRAWN_SILO,
          Mysticality: Station.BRAIN_SILO,
          Moxie: Station.GROIN_SILO,
        }[myPrimestat().toString()];
        const stations = [
          Station.COAL_HOPPER, // double mainstat gain
          statStation, // main stats
          Station.VIEWING_PLATFORM, // all stats
          Station.GAIN_MEAT, // meat
          Station.TOWER_FIZZY, // mp regen
          Station.TOWER_SEWAGE, // cold res
          Station.WATER_BRIDGE, // +ML
          Station.CANDY_FACTORY, // candies
        ] as Cycle;
        for (let i = 0; i < 8; i++) {
          const newPos = (i + offset) % 8;
          newStations[newPos] = stations[i];
        }
        setConfiguration(newStations as Cycle);
        cliExecute("set _folgerSecondConfig = true");
      },
      limit: { tries: 5 },
    },
    {
      name: "Rest Upside Down",
      ready: () => restoreMPEfficiently() === "Bat Wings",
      completed: () => myMp() >= 75 || restoreMPEfficiently() !== "Bat Wings",
      do: (): void => {
        cliExecute("cast rest upside down");
      },
      outfit: { back: $item`bat wings` },
      limit: { tries: 11 },
    },
    {
      name: "Restore MP with Glowing Blue",
      ready: () => restoreMPEfficiently() === "Blue Rocket",
      prepare: () => prepCommon,
      completed: () =>
        have($effect`Everything Looks Blue`) ||
        myMp() >= 75 ||
        have($item`magical sausage`) ||
        have($item`magical sausage casing`),
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
        1324: 2,
        1326: 2,
      },
      limit: { tries: 2 },
    },
    {
      name: "Restore MP with Glowing Blue (continued)",
      ready: () => restoreMPEfficiently() === "Blue Rocket",
      prepare: () => prepCommon,
      // We need to spend at least 1adv to get the mp regen from Glowing Blue
      // This is only an issue if our powerleveling zone is the NEP, since the previous fight would be free
      completed: () =>
        powerlevelingLocation() !== $location`The Neverending Party` ||
        haveEffect($effect`Glowing Blue`) !== 10 ||
        myMp() >= 75 ||
        have($item`magical sausage`) ||
        have($item`magical sausage casing`),
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
      do: (): void => {
        chooseQuest(() => 2);
        if (holiday().includes("April Fool's Day")) visitUrl("questlog.php?which=7");
      },
      limit: { tries: 1 },
    },
    {
      name: "Shadow Rift",
      prepare: () => prepCommon,
      completed: () =>
        have($item`Rufus's shadow lodestone`) ||
        (!have($effect`Shadow Affinity`) && get("encountersUntilSRChoice") !== 0) ||
        !have($item`closed-circuit pay phone`),
      do: bestShadowRift(),
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`red rocket`)
          .trySkill($skill`Gulp Latte`)
          .trySkill($skill`Giant Growth`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .default()
      ),
      outfit: () => ({ ...baseOutfit(true, false, $monster`shadow slab`) }),
      post: (): void => {
        if (have(rufusTarget() as Item)) {
          withChoice(1498, 1, () => use($item`closed-circuit pay phone`));
        }
        if (restoreMPEfficiently() === "Refill Latte" && myMp() < 75) refillLatte();
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 12 },
    },
    {
      name: "Run CyberRealm",
      ready: () => have($item`server room key`) && have($skill`OVERCLOCK(10)`) && !args.savecyber,
      prepare: () => {
        prepCommon();
        $effects`Astral Shell, Elemental Saucesphere, Scarysauce`.forEach((ef) => {
          if (!have(ef)) useSkill(toSkill(ef));
        });
      },
      completed: () =>
        $location`Cyberzone 1`.turnsSpent >= 11 || toInt(get("_cyberZone1Turns")) >= 11,
      choices: { 1545: 1, 1546: 1 },
      do: $location`Cyberzone 1`,
      outfit: () => ({ ...baseOutfit(true, false, $monster`shadow slab`) }),
      combat: new CombatStrategy().macro(() =>
        Macro.if_("!monsterphylum construct", Macro.default())
          .skill($skill`Throw Cyber Rock`)
          .repeat()
      ),
      limit: { tries: 11 },
    },
    {
      name: "Get Range",
      prepare: (): void => {
        sellMiscellaneousItems();
        if (checkPurqoise(500)) autosell($item`porquoise`, 1);
      },
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
      name: "Snojo Pledge",
      prepare: () => prepCommon,
      ready: () => have($familiar`Patriotic Eagle`) && get("snojoAvailable"),
      completed: () => get("_citizenZone").includes("Snowman"),
      do: $location`The X-32-F Combat Training Snowman`,
      combat: new CombatStrategy().macro(
        Macro.if_(
          "!haseffect Citizen of a Zone",
          Macro.trySkill($skill`%fn, let's pledge allegiance to a Zone`)
        )
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .trySkill($skill`Gulp Latte`)
          .default()
      ),
      outfit: () => ({
        familiar: $familiar`Patriotic Eagle`,
      }),
      limit: { tries: 10 },
      post: (): void => {
        if (get("_snojoFreeFights") >= 10) cliExecute("hottub");
        if (restoreMPEfficiently() === "Refill Latte" && myMp() < 75) refillLatte();
        sendAutumnaton();
        sellMiscellaneousItems();
      },
    },
    {
      name: "Snojo",
      prepare: () => prepCommon,
      completed: () => get("_snojoFreeFights") >= 10 || !get("snojoAvailable"),
      do: $location`The X-32-F Combat Training Snowman`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({
        ...baseOutfit(true, false, $monster`X-32-F Combat Training Snowman`),
        shirt: garbageShirt() ? $item`makeshift garbage shirt` : undefined,
      }),
      limit: { tries: 10 },
      post: (): void => {
        if (get("_snojoFreeFights") >= 10) cliExecute("hottub");
        if (restoreMPEfficiently() === "Refill Latte" && myMp() < 75) refillLatte();
        sendAutumnaton();
        sellMiscellaneousItems();
      },
    },
    {
      name: "Get Totem and Saucepan",
      prepare: () => sellMiscellaneousItems(),
      completed: () => have($item`turtle totem`) && have($item`saucepan`),
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
      },
      limit: { tries: 50 },
    },
    {
      name: "Bakery Pledge",
      prepare: () => prepCommon,
      ready: () => !get("snojoAvailable"),
      completed: () =>
        have($effect`Citizen of a Zone`) ||
        !have($familiar`Patriotic Eagle`) ||
        get("_citizenZone").includes("Madness") ||
        ((get("_shatteringPunchUsed") >= 3 || !have($skill`Shattering Punch`)) &&
          (get("_gingerbreadMobHitUsed") || !have($skill`Gingerbread Mob Hit`))),
      do: $location`Madness Bakery`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`%fn, let's pledge allegiance to a Zone`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Shattering Punch`)
          .default()
      ),
      outfit: () => ({
        shirt: $item`Jurassic Parka`,
        familiar: $familiar`Patriotic Eagle`,
        modes: { parka: "spikolodon" },
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 2 },
    },
    {
      name: "LOV Tunnel",
      prepare: (): void => {
        prepCommon();
        tryAcquiringEffect($effect`Comic Violence`);
        tryAcquiringEffect($effect`Fat Leon's Phat Loot Lyric`);
      },
      completed: () => get("_loveTunnelUsed") || !get("loveTunnelAvailable"),
      do: () =>
        TunnelOfLove.fightAll(LOVEquip, "Open Heart Surgery", "LOV Extraterrestrial Chocolate"),
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
        ...baseOutfit(false, false, $monster`LOV Engineer`),
        modifier: `0.25 ${mainStatMaximizerStr}, 0.001 item%, -equip tinsel tights, -equip wad of used tape, -equip Kramco Sausage-o-Matic™`,
      }),
      limit: { tries: 1 },
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        if (have($item`LOV Extraterrestrial Chocolate`))
          use($item`LOV Extraterrestrial Chocolate`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
        uneffect($effect`Fat Leon's Phat Loot Lyric`);
      },
    },
    {
      name: "Sept-ember Mouthwash",
      prepare: () => {
        const effects: Effect[] = [
          $effect`Elemental Saucesphere`,
          $effect`Scarysauce`,
          // eslint-disable-next-line libram/verify-constants
          $effect`Feel Peaceful`,
          $effect`Astral Shell`,
        ];
        effects.forEach((ef) => tryAcquiringEffect(ef));
      },
      completed: () =>
        !have($item`Sept-Ember Censer`) || get("availableSeptEmbers") === 1 || args.saveembers,
      do: (): void => {
        // Saber a camel
        if (
          have($familiar`Melodramedary`) &&
          have($item`Fourth of May Cosplay Saber`) &&
          !get("_entauntaunedToday")
        ) {
          const weapon = equippedItem($slot`weapon`);
          useFamiliar($familiar`Melodramedary`);
          equip($item`Fourth of May Cosplay Saber`);
          visitUrl("/main.php?action=camel");
          runChoice(1);
          useFamiliar($familiar`Cooler Yeti`);
          equip(weapon);
        }

        if (!have($effect`Cold as Nice`) && have($item`Beach Comb`))
          tryAcquiringEffect($effect`Cold as Nice`);

        // Grab Embers
        visitUrl("shop.php?whichshop=september");

        // Grab Mouthwashes
        visitUrl("shop.php?whichshop=september&action=buyitem&quantity=3&whichrow=1512&pwd");

        use($item`Mmm-brr! brand mouthwash`, 3);
      },
      limit: { tries: 1 },
      outfit: () => ({
        hat: $item`prismatic beret`,
        weapon: $item`McHugeLarge right pole`,
        offhand: $item`McHugeLarge left pole`,
        back: $item`McHugeLarge duffel bag`,
        shirt: $item`LOV Eardigan`,
        pants: $item`tearaway pants`,
        acc1: $item`The Eternity Codpiece`,
        acc2: $item`McHugeLarge left ski`,
        acc3: $item`McHugeLarge right ski`,
        familiar: $familiar`Cooler Yeti`,
        famequip: $item`tiny stillsuit`,
      }),
    },
    {
      name: "Restore cinch",
      completed: () =>
        get("timesRested") >= args.saverests || get("_cinchUsed", 0) <= 95 || !useCinch,
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
      },
      do: (): void => {
        useFamiliar($familiar`Skeleton of Crimbo Past`);
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
      name: "Kramco",
      prepare: () => prepCommon,
      ready: () => getKramcoWandererChance() >= 1.0,
      completed: () => getKramcoWandererChance() < 1.0 || !have($item`Kramco Sausage-o-Matic™`),
      do: $location`Noob Cave`,
      outfit: () => ({
        ...baseOutfit(true, false, $monster`sausage goblin`),
        offhand: $item`Kramco Sausage-o-Matic™`,
        shirt: garbageShirt() ? $item`makeshift garbage shirt` : undefined,
      }),
      combat: new CombatStrategy().macro(() => Macro.default(useCinch())),
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Oliver's Place (Peridot)",
      prepare: (): void => {
        prepCommon();
        if (SourceTerminal.have()) cliExecute("terminal educate portscan");
      },
      completed: () =>
        get("_speakeasyFreeFights", 0) >= 1 || !get("ownsSpeakeasy") || have($item`imported taffy`),
      do: () => $location`An Unusually Quiet Barroom Brawl`,
      choices: peridotChoice($monster`goblin flapper`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Envy`)
          .trySkill($skill`Portscan`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit(true, false, $monster`goblin flapper`),
        acc3: $item`Peridot of Peril`,
      }),
      limit: { tries: 2 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "Oliver's Place",
      prepare: () => prepCommon,
      completed: () => get("_speakeasyFreeFights", 0) >= 3 || !get("ownsSpeakeasy"),
      do: $location`An Unusually Quiet Barroom Brawl`,
      combat: new CombatStrategy().macro(Macro.default()),
      outfit: () => ({ ...baseOutfit(true, false, $monster`goblin flapper`) }),
      limit: { tries: 3 },
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
    },
    {
      name: "God Lobster",
      prepare: () => prepCommon,
      completed: () => get("_godLobsterFights") >= 3 || !have($familiar`God Lobster`),
      do: () => visitUrl("main.php?fightgodlobster=1"),
      combat: new CombatStrategy().macro(Macro.default(useCinch())),
      choices: { 1310: godLobsterChoice() }, // Get xp on last fight
      outfit: () => ({
        ...baseOutfit(true, false, $monster`God Lobster`),
        famequip: $items`God Lobster's Ring, God Lobster's Scepter`,
        familiar: $familiar`God Lobster`,
        shirt: garbageShirt() ? $item`makeshift garbage shirt` : undefined,
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
      prepare: () => prepCommon,
      completed: () => get("_eldritchHorrorEvoked") || !have($skill`Evoke Eldritch Horror`),
      do: () => useSkill($skill`Evoke Eldritch Horror`),
      post: (): void => {
        if (have($effect`Beaten Up`)) cliExecute("hottub");
        sendAutumnaton();
        sellMiscellaneousItems();
      },
      combat: new CombatStrategy().macro(Macro.default(useCinch())),
      outfit: () => ({ ...baseOutfit(true, false, $monster`Eldritch Tentacle`) }),
      limit: { tries: 1 },
    },
    {
      name: "Witchess Bishop",
      prepare: () => prepCommon,
      completed: () =>
        get("_witchessFights") >= 4 - (args.skipbishop ? 2 : 0) ||
        !Witchess.have() ||
        args.witchess,
      do: () => Witchess.fightPiece($monster`Witchess Bishop`),
      combat: new CombatStrategy().macro(() => Macro.default(useCinch())),
      outfit: () => ({ ...baseOutfit(true, false, $monster`Witchess Knight`) }),
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 5 },
    },
    {
      name: "DMT",
      prepare: () => prepCommon,
      completed: () => get("_machineTunnelsAdv") >= 5 || !have($familiar`Machine Elf`),
      do: $location`The Deep Machine Tunnels`,
      combat: new CombatStrategy().macro(Macro.default(useCinch())),
      outfit: () => ({
        ...baseOutfit(true, false, $monster`Perceiver of Sensations`),
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
      completed: () => get("_neverendingPartyFreeTurns") >= 10,
      do: powerlevelingLocation(),
      prepare: () => prepCommon,
      outfit: () => ({
        ...baseOutfit(true, false, $monster`burnout`),
      }),
      limit: { tries: 60 },
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
        1326: 2,
      },
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`red rocket`)
          .trySkill($skill`Gulp Latte`)
          .trySkill($skill`Feel Pride`)
          .trySkill($skill`Cincho: Confetti Extravaganza`)
          .trySkill($skill`Recall Facts: %phylum Circadian Rhythms`)
          .default(useCinch())
      ),
      post: (): void => {
        if (have($item`SMOOCH coffee cup`)) chew($item`SMOOCH coffee cup`, 1);
        if (restoreMPEfficiently() === "Refill Latte" && myMp() < 75) refillLatte();
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
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
      prepare: () => prepCommon,
      completed: () =>
        have($item`dented scepter`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess ||
        args.skipking,
      do: () => Witchess.fightPiece($monster`Witchess King`),
      combat: new CombatStrategy().macro(Macro.default(useCinch())),
      outfit: () => ({ ...baseOutfit(true, false, $monster`Witchess Knight`) }),
      post: (): void => {
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Witchess Witch",
      prepare: () => prepCommon,
      completed: () =>
        have($item`battle broom`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess ||
        args.skipwitch,
      do: () => Witchess.fightPiece($monster`Witchess Witch`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Curse of Weaksauce`)
          .attack()
          .repeat()
      ),
      outfit: {
        ...baseOutfit(true, false, $monster`Witchess Knight`),
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
      prepare: () => prepCommon,
      completed: () =>
        have($item`very pointy crown`) ||
        get("_witchessFights") >= 5 ||
        !Witchess.have() ||
        args.witchess ||
        args.skipqueen,
      do: () => Witchess.fightPiece($monster`Witchess Queen`),
      combat: new CombatStrategy().macro(Macro.attack().repeat()),
      outfit: {
        ...baseOutfit(true, false, $monster`Witchess Knight`),
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
      name: "Authority",
      prepare: () => prepCommon,
      ready: () =>
        have($item`Sheriff moustache`) && have($item`Sheriff badge`) && have($item`Sheriff pistol`),
      completed: () => get("_assertYourAuthorityCast") >= 3,
      do: powerlevelingLocation(),
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Assert your Authority`).abort()),
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
        1326: 2,
      },
      outfit: () => ({
        ...baseOutfit(true, false, $monster`burnout`),
        weapon: $item`Sheriff pistol`,
        acc2: $item`Sheriff badge`,
        acc3: $item`Sheriff moustache`,
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 3 },
    },
    {
      name: "Free Kills and More Fights",
      prepare: () => prepCommon,
      outfit: freekillOutfit,
      completed: () => !freekillsRemaining(),
      do: powerlevelingLocation(),
      combat: new CombatStrategy().macro(freekillMacro()),
      choices: {
        1094: 5,
        1115: 6,
        1322: 2,
        1324: 5,
        1326: 2,
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
