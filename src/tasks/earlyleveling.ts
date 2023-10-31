import { Quest } from "../engine/task";
import {
  autosell,
  buy,
  cliExecute,
  eat,
  equip,
  getMonsters,
  getWorkshed,
  handlingChoice,
  haveEquipped,
  Item,
  itemAmount,
  itemDrops,
  Location,
  mallPrice,
  myAdventures,
  myClass,
  myLevel,
  myMaxhp,
  myMeat,
  myPrimestat,
  print,
  restoreHp,
  restoreMp,
  storageAmount,
  takeStorage,
  toInt,
  toItem,
  use,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  AutumnAton,
  clamp,
  CombatLoversLocket,
  CommunityService,
  get,
  getKramcoWandererChance,
  have,
  sum,
  TrainSet,
  uneffect,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import { baseOutfit, docBag, unbreakableUmbrella } from "../engine/outfit";
import { Cycle, setConfiguration, Station } from "libram/dist/resources/2022/TrainSet";
import Macro from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { chooseRift } from "libram/dist/resources/2023/ClosedCircuitPayphone";
import { boomBoxProfit } from "../lib";

const useParkaSpit = have($item`Fourth of May Cosplay Saber`) && have($skill`Feel Envy`);
const baseBoozes = $items`bottle of rum, boxed wine, bottle of gin, bottle of vodka, bottle of tequila, bottle of whiskey`;
let pledgeCheck = false;

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

export const earlyLevelingQuest: Quest = {
  name: "Early Leveling",
  completed: () =>
    get("pizzaOfLegendEaten") ||
    !get("instant_skipBorrowedTime", false) ||
    get("instant_useAsdon", false) ||
    CommunityService.CoilWire.isDone(),
  tasks: [
    {
      name: "Install Trainset",
      completed: () => !have($item`model train set`) || getWorkshed() === $item`model train set`,
      do: (): void => {
        use($item`model train set`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Scavenge",
      completed: () => get("_daycareGymScavenges") > 0 || !get("daycareOpen"),
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      do: (): void => {
        cliExecute("daycare scavenge free");
      },
      limit: { tries: 1 },
    },
    {
      name: "Configure Trainset",
      after: ["Install Trainset"],
      completed: () => get("_folgerInitialConfig", false),
      do: (): void => {
        const statStation: Station = {
          Muscle: Station.BRAWN_SILO,
          Mysticality: Station.BRAIN_SILO,
          Moxie: Station.GROIN_SILO,
        }[myPrimestat().toString()];
        use($item`model train set`);
        setConfiguration([
          Station.COAL_HOPPER, // double mainstat gain
          statStation, // main stats
          Station.VIEWING_PLATFORM, // all stats
          Station.GAIN_MEAT, // meat (we don't gain meat during free banishes)
          Station.WATER_BRIDGE, // +ML
          Station.TOWER_FIZZY, // mp regen
          Station.TOWER_FROZEN, // hot resist (useful)
          Station.CANDY_FACTORY, // candies (we don't get items during free banishes)
        ]);
        cliExecute("set _folgerInitialConfig = true");
      },
      limit: { tries: 1 },
    },
    {
      name: "Red Skeleton, Tropical Skeleton, Two For One",
      after: ["Configure Trainset"],
      ready: () =>
        !have($effect`Everything Looks Yellow`) ||
        (have($skill`Feel Envy`) && get("_feelEnvyUsed") < 3) ||
        (have($skill`Feel Nostalgic`) && get("_feelNostalgicUsed") < 3),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        if (!have($item`red rocket`) && !have($effect`Everything Looks Yellow`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase red rocket!");
          buy($item`red rocket`, 1);
        }
        unbreakableUmbrella();
      },
      completed: () =>
        CombatLoversLocket.monstersReminisced().includes($monster`red skeleton`) ||
        !CombatLoversLocket.availableLocketMonsters().includes($monster`red skeleton`) ||
        get("instant_saveLocketRedSkeleton", false),
      do: () => CombatLoversLocket.reminisce($monster`red skeleton`),
      combat: get("_daycareGymScavenges")
        ? new CombatStrategy().macro(
            Macro.trySkill($skill`Bowl a Curveball`)
              .trySkill($skill`Snokebomb`)
              .trySkill($skill`Reflex Hammer`)
              .trySkill($skill`Chest X-Ray`)
              .trySkill($skill`Gingerbread Mob Hit`)
              .trySkill($skill`Shattering Punch`)
              .default()
          )
        : new CombatStrategy().macro(
            Macro.trySkill($skill`Reflex Hammer`)
              .trySkill($skill`Chest X-Ray`)
              .trySkill($skill`Gingerbread Mob Hit`)
              .trySkill($skill`Shattering Punch`)
              .default()
          ),
      outfit: () => baseOutfit(true),
      limit: { tries: 1 },
    },
    {
      name: "June Cleaver",
      completed: () =>
        !have($item`June cleaver`) || get("_juneCleaverFightsLeft") > 0 || myAdventures() === 0,
      choices: {
        1467: 3, //Poetic Justice
        1468: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Aunts not Ants
        1469: 3, //Beware of Aligator
        1470: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Teacher's Pet
        1471: 1, //Lost and Found
        1472: () => (get("_juneCleaverSkips") < 5 ? 4 : 1), //Summer Days
        1473: () => (get("_juneCleaverSkips") < 5 ? 4 : 1), //Bath Time
        1474: () => (get("_juneCleaverSkips") < 5 ? 4 : 2), //Delicious Sprouts
        1475: 1, //Hypnotic Master
      },
      do: $location`Noob Cave`,
      post: (): void => {
        if (handlingChoice()) visitUrl("main.php");
        if (have($effect`Beaten Up`)) uneffect($effect`Beaten Up`);
      },
      outfit: () => ({ equip: $items`June cleaver` }),
      limit: undefined,
    },
    {
      name: "Map Novelty Tropical Skeleton",
      after: ["Red Skeleton, Tropical Skeleton, Two For One"],
      prepare: (): void => {
        if (useParkaSpit) {
          cliExecute("parka dilophosaur");
        } else if (!have($item`red rocket`) && !have($effect`Everything Looks Yellow`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase red rocket!");
          buy($item`red rocket`, 1);
        }
        unbreakableUmbrella();
        if (haveEquipped($item`miniature crystal ball`)) equip($slot`familiar`, $item.none);
      },
      completed: () =>
        !have($skill`Map the Monsters`) || get("_monstersMapped") >= 3 || have($item`cherry`),
      do: () => mapMonster($location`The Skeleton Store`, $monster`novelty tropical skeleton`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Nostalgic`)
          .tryItem($item`red rocket`)
          .if_(
            $monster`novelty tropical skeleton`,
            (useParkaSpit ? Macro.trySkill($skill`Spit jurassic acid`) : new Macro()).tryItem(
              $item`yellow rocket`
            )
          )
          .abort()
      ),
      outfit: () => ({
        ...baseOutfit(false),
        modifier: `${baseOutfit().modifier}, -equip miniature crystal ball`,
      }),
      post: (): void => {
        if (have($item`MayDay™ supply package`) && !get("instant_saveMayday", false))
          use($item`MayDay™ supply package`, 1);
        if (have($item`space blanket`)) autosell($item`space blanket`, 1);
        use($item`red box`, 1);
        sendAutumnaton();
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "ReConfigure Trainset",
      after: ["Map Novelty Tropical Skeleton"],
      completed: () => get("_folgerSecondConfig", false),
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
          Station.BRAIN_SILO, // myst stats
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
      limit: { tries: 1 },
    },
    {
      name: "Kramco",
      after: ["ReConfigure Trainset"],
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      ready: () => getKramcoWandererChance() >= 1.0,
      completed: () => getKramcoWandererChance() < 1.0 || !have($item`Kramco Sausage-o-Matic™`),
      do: $location`Noob Cave`,
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`Kramco Sausage-o-Matic™`,
      }),
      combat: new CombatStrategy().macro(Macro.default()),
    },
    {
      name: "Map Pocket Wishes",
      after: ["Kramco"],
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(30);
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
      ready: () => myLevel() < 5,
      completed: () =>
        !have($skill`Map the Monsters`) ||
        !have($skill`Just the Facts`) ||
        get("_monstersMapped") >= 3 ||
        have($item`pocket wish`, 1) ||
        get("instant_saveGenie", false) ||
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
      outfit: () => ({
        ...baseOutfit,
        acc2: have($item`Lil' Doctor™ bag`) ? $item`Lil' Doctor™ bag` : undefined,
      }),
      post: () => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Bakery Pledge",
      after: ["Map Pocket Wishes"],
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
        pledgeCheck ||
        get("_pledgeCheck", false),
      do: $location`Madness Bakery`,
      combat: new CombatStrategy().macro(
        Macro.tryItem($item`blue rocket`)
          .tryItem($item`red rocket`)
          .trySkill($skill`%fn, let's pledge allegiance to a Zone`)
          .trySkill($skill`Snokebomb`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Shattering Punch`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit,
        familiar: $familiar`Patriotic Eagle`,
        acc2: have($item`Lil' Doctor™ bag`) ? $item`Lil' Doctor™ bag` : undefined,
      }),
      post: () => {
        sellMiscellaneousItems(), (pledgeCheck = true);
        cliExecute("set _pledgeCheck = true");
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },
    {
      name: "Bastille",
      after: ["Bakery Pledge"],
      ready: () => myLevel() < 5,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      completed: () => get("_bastilleGames") > 0 || !have($item`Bastille Battalion control rig`),
      do: (): void => {
        if (have($item`familiar scrapbook`)) {
          equip($item`familiar scrapbook`);
        }
        cliExecute("bastille.ash mainstat brutalist");
      },
      limit: { tries: 1 },
    },
    {
      name: "Whetstone",
      after: ["Bakery Pledge"],
      completed: () => !have($item`whet stone`),
      do: (): void => {
        use($item`whet stone`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Pizza of Legend",
      after: ["Bakery Pledge"],
      completed: () =>
        have($item`Pizza of Legend`) ||
        have($effect`Endless Drool`) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Pizza of Legend`).toString()) ||
        get("instant_skipPizzaOfLegend", false),
      do: (): void => {
        if (storageAmount($item`Pizza of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Pizza of Legend in Hagnk's", "red");
          print("Consider pulling something to make up for the turngen and 300%mox,", "red");
          print(
            "then type 'set _instant_skipPizzaOfLegend=true' before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`Pizza of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Eat Pizza",
      ready: () => have($effect`Ready to Eat`), // only eat this after we red rocket
      completed: () =>
        get("pizzaOfLegendEaten") || !have($item`Pizza of Legend`) || myAdventures() > 60,
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
      name: "Pull Calzone of Legend",
      after: ["Eat Pizza"],
      completed: () =>
        have($item`Calzone of Legend`) ||
        have($effect`In the 'zone zone!`) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Calzone of Legend`).toString()) ||
        get("instant_skipCalzoneOfLegend", false),
      do: (): void => {
        if (storageAmount($item`Calzone of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Calzone of Legend in Hagnk's", "red");
          print(
            "Consider pulling something to make up for the turngen and 300%myst (e.g. a roasted vegetable focaccia),",
            "red"
          );
          print(
            "then type 'set _instant_skipCalzoneOfLegend=true' before re-running instantsccs",
            "red"
          );
        }
        takeStorage($item`Calzone of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Eat Calzone",
      after: ["Eat Pizza"],
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
      },
      completed: () =>
        get("calzoneOfLegendEaten") || !have($item`Calzone of Legend`) || myAdventures() > 60,
      do: (): void => {
        if (have($item`familiar scrapbook`)) {
          equip($item`familiar scrapbook`);
        }
        eat($item`Deep Dish of Legend`, 1);
      },
      limit: { tries: 1 },
    },
  ],
};
