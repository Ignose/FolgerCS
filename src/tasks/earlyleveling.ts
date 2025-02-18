import { Quest } from "../engine/task";
import {
  abort,
  autosell,
  buy,
  cliExecute,
  eat,
  Effect,
  equip,
  getMonsters,
  getWorkshed,
  haveEquipped,
  itemDrops,
  Location,
  mallPrice,
  myAdventures,
  myClass,
  myFamiliar,
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
} from "libram";
import { CombatStrategy } from "grimoire-kolmafia";
import { baseOutfit, docBag, unbreakableUmbrella } from "../engine/outfit";
import { Cycle, setConfiguration, Station } from "libram/dist/resources/2022/TrainSet";
import Macro from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { chooseRift } from "libram/dist/resources/2023/ClosedCircuitPayphone";
import { boomBoxProfit, checkPurqoise, sellMiscellaneousItems, statToMaximizerString, tryAcquiringEffect } from "../lib";
import { args } from "../args";

const useParkaSpit = have($item`Fourth of May Cosplay Saber`) && have($skill`Feel Envy`);

const primeStat = statToMaximizerString(myPrimestat());

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

export const earlyLevelingQuest: Quest = {
  name: "Early Leveling",
  completed: () =>
    get("pizzaOfLegendEaten") ||
    !args.skipbt ||
    CommunityService.CoilWire.isDone() ||
    myAdventures() > 60,
  tasks: [
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
      name: "Install Trainset",
      ready: () => !args.asdon,
      completed: () => !have($item`model train set`) || getWorkshed() === $item`model train set`,
      do: (): void => {
        use($item`model train set`);
        visitUrl("campground.php?action=workshed");
        visitUrl("main.php");
      },
      limit: { tries: 1 },
    },
    {
      name: "Configure Trainset Early",
      ready: () => !args.asdon,
      completed: () => get("_folgerInitialConfig", false),
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
        visitUrl("campground.php?action=workshed");
        visitUrl("main.php");
        setConfiguration(newStations as Cycle);
        cliExecute("set _folgerInitialConfig = true");
      },
      limit: { tries: 2 },
    },
    {
      name: "NEP The Prequel",
      completed: () => get("_questPartyFair") !== "unstarted",
      do: $location`The Neverending Party`,
      choices: {1322: 2},
      outfit: () => ({
        ...baseOutfit(),
        shirt: $item`Jurassic Parka`,
        offhand: $item`Kramco Sausage-o-Matic™`,
      }),
      combat: new CombatStrategy().macro(Macro.default()),
    },
    {
        name: "Ghost",
        completed: () => get("questPAGhost") === "unstarted",
        ready: () =>
          have($item`protonic accelerator pack`) &&
          get("questPAGhost") !== "unstarted" &&
          !!get("ghostLocation") &&
          !have($effect`Meteor Showered`),
        do: () => get("ghostLocation") ?? abort("Failed to identify ghost location"),
        combat: new CombatStrategy().macro(
          Macro.trySkill($skill`micrometeorite`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Shoot Ghost`)
            .trySkill($skill`Trap Ghost`)
        ),
        outfit: () => ({
          ...baseOutfit,
          shirt: $item`Jurassic Parka`,
          back: $item`protonic accelerator pack`,
        }),
    },
    {
      name: "Red Skeleton, Tropical Skeleton, Two For One",
      after: ["Configure Trainset Early"],
      ready: () =>
        !have($effect`Everything Looks Yellow`) ||
        (have($skill`Feel Envy`) && get("_feelEnvyUsed") < 3) ||
        (have($skill`Feel Nostalgic`) && get("_feelNostalgicUsed") < 3),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        if (checkPurqoise(250)) autosell($item`porquoise`, 1);
        if (!have($item`red rocket`) && !have($effect`Everything Looks Red`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase red rocket!");
          buy($item`red rocket`, 1);
        }
        unbreakableUmbrella();
      },
      completed: () =>
        CombatLoversLocket.monstersReminisced().includes($monster`red skeleton`) ||
        !CombatLoversLocket.availableLocketMonsters().includes($monster`red skeleton`) ||
        args.redskeleton,
      do: () => CombatLoversLocket.reminisce($monster`red skeleton`),
      combat: new CombatStrategy().macro(
          Macro.trySkill($skill`Spring Away`)
          .trySkill($skill`Snokebomb`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Shattering Punch`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit(false),
        shirt: have($item`Jurassic Parka`) ? $item`Jurassic Parka` : undefined,
        acc3: have($item`Spring Shoes`) ? $item`Spring Shoes` : undefined,
        modifier: `${baseOutfit().modifier}`,
      }),
      limit: { tries: 1 },
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
      },
      completed: () =>
        !have($skill`Map the Monsters`) || get("_monstersMapped") >= 3 || have($item`cherry`),
      do: () => mapMonster($location`The Skeleton Store`, $monster`novelty tropical skeleton`),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Feel Nostalgic`)
          .tryItem($item`red rocket`)
          .trySkill($skill`Spit jurassic acid`)
          .abort()
      ),
      outfit: () => ({
        ...baseOutfit(false),
        shirt: have($item`Jurassic Parka`) ? $item`Jurassic Parka` : undefined,
        acc2: have($item`Lil' Doctor™ bag`) ? $item`Lil' Doctor™ bag` : undefined,
        modifier: `${baseOutfit().modifier}`,
      }),
      post: (): void => {
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
      ready: () => !args.asdon,
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
          Station.TOWER_SEWAGE, // cold res
          Station.WATER_BRIDGE, // +ML
          Station.CANDY_FACTORY, // candies
        ] as Cycle;
        for (let i = 0; i < 8; i++) {
          const newPos = (i + offset) % 8;
          newStations[newPos] = stations[i];
        }
        visitUrl("campground.php?action=workshed");
        visitUrl("main.php");
        setConfiguration(newStations as Cycle);
        cliExecute("set _folgerSecondConfig = true");
      },
      limit: { tries: 2 },
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
        shirt: $item`Jurassic Parka`,
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
        myClass() !== $class`Seal Clubber` ||
        ((get("_shatteringPunchUsed") >= 3 || !have($skill`Shattering Punch`)) &&
          (get("_gingerbreadMobHitUsed") || !have($skill`Gingerbread Mob Hit`))),
      do: () => mapMonster($location`The Haunted Kitchen`, $monster`paper towelgeist`),
      combat: new CombatStrategy().macro(
        Macro.if_(
          $monster`paper towelgeist`,
          Macro.tryItem($item`red rocket`)
            .trySkill($skill`Chest X-Ray`)
            .trySkill($skill`Gingerbread Mob Hit`)
            .trySkill($skill`Shattering Punch`)
            .default()
        ).abort()
      ),
      outfit: () => ({
        ...baseOutfit,
        shirt: $item`Jurassic Parka`,
        offhand: $item`unbreakable umbrella`,
        acc2: have($item`Lil' Doctor™ bag`) ? $item`Lil' Doctor™ bag` : undefined,
      }),
      post: (): void => {
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
        get("_citizenZone").includes("Madness"),
      do: $location`Madness Bakery`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`%fn, let's pledge allegiance to a Zone`)
          .trySkill($skill`Snokebomb`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Chest X-Ray`)
          .trySkill($skill`Gingerbread Mob Hit`)
          .trySkill($skill`Shattering Punch`)
          .default()
      ),
      outfit: () => ({
        ...baseOutfit,
        shirt: $item`Jurassic Parka`,
        familiar: $familiar`Patriotic Eagle`,
        acc2: have($item`Lil' Doctor™ bag`) ? $item`Lil' Doctor™ bag` : undefined,
        avoid: $items`toy Cupid bow`
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 2 },
    },
    {
      name: "Free Run ",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        docBag();
        restoreMp(50);
      },
      ready: () => have($familiar`Pair of Stomping Boots`),
      completed: () => get("_banderRunaways") >= 1,
      do: $location`Noob Cave`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Launch Spikolodon Spikes`)
        .runaway()
      ),
      outfit: () => ({
        ...baseOutfit,
        familiar: $familiar`Pair of Stomping Boots`,
        short: $item`jurassic parka`,
        acc3: $item`spring shoes`,
        modes: {parka: "spikolodon"},
        avoid: $items`toy Cupid bow`
      }),
      post: (): void => {
        sellMiscellaneousItems();
        boomBoxProfit();
      },
      limit: { tries: 1 },
    },

        {
          name: "Sept-ember Mouthwash",
          ready: () => args.asdon,
          prepare: () => {
            const effects: Effect[] = [
              $effect`Elemental Saucesphere`,
              $effect`Scarysauce`,
              $effect`Feel Peaceful`,
              $effect`Astral Shell`,
            ]
            effects.forEach((ef) => tryAcquiringEffect(ef));
          },
          completed: () =>
            !have($item`Sept-Ember Censer`) || have($item`bembershoot`) || args.saveembers,
          do: (): void => {
            // Grab Embers
            visitUrl("shop.php?whichshop=september");
    
            // Grab Bembershoots
            visitUrl(`shop.php?whichshop=september&action=buyitem&quantity=1&whichrow=1516&pwd`);
    
            // Grab Mouthwashes
            visitUrl("shop.php?whichshop=september&action=buyitem&quantity=3&whichrow=1512&pwd");
    
            // Re-maximize cold res after getting bembershoots
            cliExecute("maximize cold res");
    
            // eslint-disable-next-line libram/verify-constants
            use($item`Mmm-brr! brand mouthwash`, 3);
          },
          limit: { tries: 1 },
          outfit: {
            modifier: `10 cold res, 1 ${primeStat} experience percent`,
            familiar: $familiar`Exotic Parrot`,
          },
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
        args.pizza,
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
        get("pizzaOfLegendEaten") ||
        !have($item`Pizza of Legend`) ||
        myAdventures() > 60 ||
        args.pizza,
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
        args.calzone,
      do: (): void => {
        if (storageAmount($item`Calzone of Legend`) === 0) {
          print("Uh oh! You do not seem to have a Calzone of Legend in Hagnk's", "red");
          print(
            "Consider pulling something to make up for the turngen and 300%myst (e.g. a roasted vegetable focaccia),",
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
        eat($item`Calzone of Legend`, 1);
      },
      limit: { tries: 1 },
    },
  ],
};
