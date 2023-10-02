import { Quest } from "../engine/task";
import {
  autosell,
  buy,
  cliExecute,
  eat,
  equip,
  getMonsters,
  haveEquipped,
  Item,
  itemAmount,
  itemDrops,
  Location,
  mallPrice,
  myClass,
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
} from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $slot,
  AutumnAton,
  clamp,
  CombatLoversLocket,
  get,
  getKramcoWandererChance,
  have,
  sum,
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import { baseOutfit, unbreakableUmbrella } from "../engine/outfit";
import Macro from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { chooseRift } from "libram/dist/resources/2023/ClosedCircuitPayphone";

const useParkaSpit = have($item`Fourth of May Cosplay Saber`) && have($skill`Feel Envy`);
const baseBoozes = $items`bottle of rum, boxed wine, bottle of gin, bottle of vodka, bottle of tequila, bottle of whiskey`;

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
    (get("calzoneOfLegendEaten") && get("pizzaOfLegendEaten") && get("deepDishOfLegendEaten")) ||
    (get("instant_skipBorrowedTime", false) &&
      !get("instant_skipEarlyTrainsetMeat", false) &&
      get("instant_skipOffstatPizzas", false)),
  tasks: [
    {
      name: "Red Skeleton, Tropical Skeleton, Two For One",
      ready: () =>
        !have($effect`Everything Looks Yellow`) ||
        (have($skill`Feel Envy`) && get("_feelEnvyUsed") < 3) ||
        (have($skill`Feel Nostalgic`) && get("_feelNostalgicUsed") < 3),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
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
      combat: new CombatStrategy().macro(Macro.trySkill($skill`Snokebomb`).default()),
      outfit: () => baseOutfit(false),
      limit: { tries: 1 },
    },
    {
      name: "Map Novelty Tropical Skeleton",
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
        !have($skill`Map the Monsters`) ||
        get("_monstersMapped") >= 3 ||
        have($item`cherry`) ||
        (() => {
          // if we have another skeleton in the ice house, we don't need to map a novelty skeleton
          const banishes = get("banishedMonsters").split(":");
          const iceHouseIndex = banishes.map((string) => string.toLowerCase()).indexOf("ice house");
          if (iceHouseIndex === -1) return false;
          return ["remaindered skeleton", "factory-irregular skeleton", "swarm of skulls"].includes(
            banishes[iceHouseIndex - 1]
          );
        })(),
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
      },
      limit: { tries: 1 },
    },
    {
      name: "Kramco",
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
      name: "Pull Deep Dish of Legend",
      completed: () =>
        have($item`Deep Dish of Legend`) ||
        have($effect`In the Depths`) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Deep Dish of Legend`).toString()) ||
        get("_instant_skipDeepDishOfLegend", false) ||
        (get("instant_skipOffstatPizzas", false) && myPrimestat() !== `Muscle`),
      do: (): void => {
        if (storageAmount($item`Deep Dish of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Deep Dish of Legend in Hagnk's", "red");
          print("Consider pulling something to make up for the turngen and 300%mus,", "red");
          print(
            "then type 'set _instant_skipDeepDishOfLegend=true' before re-running instantsccs",
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
        have($item`Calzone of Legend`) ||
        have($effect`In the 'zone zone!`) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Calzone of Legend`).toString()) ||
        get("_instant_skipCalzoneOfLegend", false) ||
        (get("instant_skipOffstatPizzas", false) && myPrimestat() !== `Mysticality`),
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
      name: "Pull Pizza of Legend",
      completed: () =>
        have($item`Pizza of Legend`) ||
        have($effect`Endless Drool`) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Pizza of Legend`).toString()) ||
        get("_instant_skipPizzaOfLegend", false) ||
        (get("instant_skipOffstatPizzas", false) && myPrimestat() !== `Moxie`),
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
      name: "Eat Calzone",
      completed: () => get("calzoneOfLegendEaten") || !have($item`Calzone of Legend`),
      do: () => eat($item`Calzone of Legend`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Eat Deep Dish",
      completed: () => get("deepDishOfLegendEaten") || !have($item`Deep Dish of Legend`),
      do: () => eat($item`Deep Dish of Legend`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Eat Pizza",
      ready: () => have($effect`Ready to Eat`), // only eat this after we red rocket
      completed: () => get("pizzaOfLegendEaten") || !have($item`Pizza of Legend`),
      do: () => eat($item`Pizza of Legend`, 1),
      limit: { tries: 1 },
    },
  ],
};
