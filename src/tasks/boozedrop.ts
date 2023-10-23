import { Quest } from "../engine/task";
import {
  adv1,
  autosell,
  buy,
  cliExecute,
  create,
  drink,
  Effect,
  equip,
  faxbot,
  getWorkshed,
  hermit,
  inebrietyLimit,
  inMuscleSign,
  itemAmount,
  myClass,
  myInebriety,
  myMeat,
  print,
  retrieveItem,
  runChoice,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  CombatLoversLocket,
  CommunityService,
  DaylightShavings,
  get,
  have,
  TrainSet,
  uneffect,
  withChoice,
} from "libram";
import {
  canConfigure,
  Cycle,
  setConfiguration,
  Station,
} from "libram/dist/resources/2022/TrainSet";
import {
  checkLocketAvailable,
  checkValue,
  fuelUp,
  logTestSetup,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro from "../combat";
import { forbiddenEffects } from "../resources";
import { drive } from "libram/dist/resources/2017/AsdonMartin";

export const BoozeDropQuest: Quest = {
  name: "Booze Drop",
  completed: () => CommunityService.BoozeDrop.isDone(),
  tasks: [
    {
      name: "Configure Trainset",
      completed: () =>
        (getWorkshed() === $item`model train set` && !canConfigure()) ||
        !TrainSet.have() ||
        get("instant_ExperimentalRouting", false) ||
        getWorkshed() === $item`Asdon Martin keyfob`,
      do: (): void => {
        const offset = get("trainsetPosition") % 8;
        const newStations: TrainSet.Station[] = [];
        const stations = [
          Station.COAL_HOPPER, // double hot resist
          Station.TOWER_FROZEN, // hot resist
          Station.GAIN_MEAT, // meat
          Station.TOWER_FIZZY, // mp regen
          Station.BRAIN_SILO, // myst stats
          Station.VIEWING_PLATFORM, // all stats
          Station.WATER_BRIDGE, // +ML
          Station.CANDY_FACTORY, // candies
        ] as Cycle;
        for (let i = 0; i < 8; i++) {
          const newPos = (i + offset) % 8;
          newStations[newPos] = stations[i];
        }
        setConfiguration(newStations as Cycle);
      },
      limit: { tries: 1 },
    },
    {
      name: "Use Shadow Lodestone",
      ready: () => have($item`Rufus's shadow lodestone`),
      completed: () => have($effect`Shadow Waters`),
      do: (): void => {
        visitUrl("place.php?whichplace=town_right&action=townright_shadowrift");
        runChoice(2);
      },
      choices: {
        1500: 2,
      },
      combat: new CombatStrategy().macro(Macro.abort()),
      limit: { tries: 1 },
    },
    {
      name: "Acquire Clover",
      completed: () =>
        have($item`11-leaf clover`) ||
        get("_cloversPurchased") >= 2 ||
        get("instant_skipCyclopsEyedrops", false),
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
        hermit($item`11-leaf clover`, 1);
      },
      limit: { tries: 50 },
    },
    {
      name: "Get Cyclops Eyedrops",
      ready: () => checkValue($item`11-leaf clover`, Math.min(6.6, CommunityService.BoozeDrop.prediction - 1)),
      completed: () =>
        have($item`cyclops eyedrops`) ||
        have($effect`One Very Clear Eye`),
      do: (): void => {
        if (!have($effect`Lucky!`)) use($item`11-leaf clover`);
        if (!have($item`cyclops eyedrops`)) adv1($location`The Limerick Dungeon`, -1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Acquire Government",
      completed: () =>
        !have($item`government cheese`) ||
        get("lastAnticheeseDay") > 0 ||
        get("instant_skipGovernment", false),
      do: (): void => {
        inMuscleSign()
          ? retrieveItem($item`bitchin' meatcar`)
          : retrieveItem($item`Desert Bus pass`);
        if (!have($item`Desert Bus pass`) && !have($item`bitchin' meatcar`)) {
          autosell($item`government cheese`, itemAmount($item`government cheese`));
          return;
        }
        visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse");
        retrieveItem($item`government`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Fax Ungulith",
      completed: () =>
        get("instant_ExperimentalRouting", false) ||
        have($item`corrupted marrow`) ||
        have($effect`Cowrruption`),
      do: (): void => {
        const monsterCow =
          myClass().toString() === "Seal Clubber" &&
          CombatLoversLocket.unlockedLocketMonsters().includes($monster`furious cow`)
            ? $monster`furious cow`
            : $monster`ungulith`;
        if (checkLocketAvailable() >= 2) {
          CombatLoversLocket.reminisce(monsterCow);
        } else {
          cliExecute("chat");
          if (have($item`photocopied monster`) && get("photocopyMonster") !== monsterCow) {
            cliExecute("fax send");
          }
          if (
            (have($item`photocopied monster`) || faxbot(monsterCow)) &&
            get("photocopyMonster") === monsterCow
          ) {
            use($item`photocopied monster`);
          }
        }
      },
      outfit: () => ({
        hat:
          DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` &&
          !DaylightShavings.hasBuff() &&
          have($item`Daylight Shavings Helmet`)
            ? $item`Daylight Shavings Helmet`
            : undefined,
        back: $item`vampyric cloake`,
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: have($skill`Double-Fisted Skull Smashing`)
          ? $item`industrial fire extinguisher`
          : undefined,
        familiar: chooseFamiliar(false),
        modifier: "myst",
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .trySkill($skill`Fire Extinguisher: Polar Vortex`)
          .trySkill($skill`Use the Force`)
          .default()
      ),
      limit: { tries: 5 },
    },
    {
      name: "Bat and Hat",
      ready: () =>
        get("instant_ExperimentalRouting", false) &&
        (DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` ||
          have($item`vampyric cloake`)),
      completed: () =>
        get("instant_ExperimentalRouting", false) ||
        have($effect`Musician's Musician's Moustache`) ||
        have($effect`Bat-Adjacent Form`),
      do: $location`The Dire Warren`,
      outfit: () => ({
        hat:
          DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` &&
          !DaylightShavings.hasBuff() &&
          have($item`Daylight Shavings Helmet`)
            ? $item`Daylight Shavings Helmet`
            : undefined,
        back: $item`vampyric cloake`,
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: have($skill`Double-Fisted Skull Smashing`)
          ? $item`industrial fire extinguisher`
          : undefined,
        familiar: chooseFamiliar(false),
        modifier: "myst",
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .trySkill($skill`Fire Extinguisher: Polar Vortex`)
          .trySkill($skill`Use the Force`)
          .default()
      ),
      limit: { tries: 5 },
    },
    {
      name: "Drink Sacramento Wine",
      completed: () =>
        have($effect`Sacré Mental`) ||
        !have($item`Sacramento wine`) ||
        myInebriety() >= inebrietyLimit() ||
        get("instant_saveSacramentoWine", false),
      do: (): void => {
        if (myInebriety() < inebrietyLimit()) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink($item`Sacramento wine`, 1);
          uneffect($effect`Ode to Booze`);
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Drink Cabernet Sauvignon",
      ready: () => checkValue("August Scepter", Math.min(2.6, CommunityService.BoozeDrop.prediction - 1)),
      completed: () =>
        have($effect`Cabernet Hunter`) ||
        (!have($item`bottle of Cabernet Sauvignon`) &&
          // eslint-disable-next-line libram/verify-constants
          (!have($skill`Aug. 31st: Cabernet Sauvignon Day!`) ||
            get("instant_saveAugustScepter", false))) ||
        myInebriety() + 3 > inebrietyLimit() ||
        get("instant_skipCabernetSauvignon", false),
      do: (): void => {
        if (!have($item`bottle of Cabernet Sauvignon`))
          // eslint-disable-next-line libram/verify-constants
          useSkill($skill`Aug. 31st: Cabernet Sauvignon Day!`);
        if (myInebriety() + 3 <= inebrietyLimit()) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink($item`bottle of Cabernet Sauvignon`);
          uneffect($effect`Ode to Booze`);
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Pumpkin Juice",
      completed: () =>
        have($effect`Juiced and Jacked`) ||
        (!have($item`pumpkin`) && !have($item`pumpkin juice`)) ||
        get("instant_savePumpkins", false),
      do: (): void => {
        if (!have($item`pumpkin juice`)) create($item`pumpkin juice`, 1);
        use($item`pumpkin juice`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Loathing Idol Microphone",
      ready: () => checkValue("2002", 3),
      completed: () =>
        have($effect`Spitting Rhymes`) ||
        !have($item`2002 Mr. Store Catalog`) ||
        get("availableMrStore2002Credits", 0) <= get("instant_saveCatalogCredits", 0) ||
        forbiddenEffects.includes($effect`Spitting Rhymes`),
      do: (): void => {
        if (!have($item`Loathing Idol Microphone`)) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);
        }
        withChoice(1505, 3, () => use($item`Loathing Idol Microphone`));
      },
      limit: { tries: 1 },
    },
    {
      name: "Favorite Bird (Item)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Item Drops") ||
        get("instant_saveFavoriteBird", false),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Buy Oversized Sparkler",
      ready: () => myMeat() >= 1000,
      completed: () => have($item`oversized sparkler`),
      do: () => buy($item`oversized sparkler`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Driving Observantly",
      completed: () => have($effect`Driving Observantly`) || !get("instant_useAsdon", false),
      do: (): void => {
        fuelUp(), drive($effect`Driving Observantly`);
      },
      limit: { tries: 3 },
    },
    {
      name: "Test",
      prepare: (): void => {
        const usefulEffects: Effect[] = [
          $effect`Blessing of the Bird`,
          $effect`Crunching Leaves`,
          $effect`Fat Leon's Phat Loot Lyric`,
          // $effect`Feeling Lost`,
          $effect`Fortunate Resolve`,
          $effect`Heart of Lavender`,
          $effect`I See Everything Thrice!`,
          $effect`Incredibly Well Lit`,
          $effect`items.enh`,
          $effect`Joyful Resolve`,
          $effect`One Very Clear Eye`,
          $effect`Shadow Waters`,
          $effect`Nearly All-Natural`,
          $effect`The Spirit of Taking`,
          $effect`Singer's Faithful Ocelot`,
          $effect`Steely-Eyed Squint`,
          $effect`Uncucumbered`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l ninja costume`)) {
          useFamiliar($familiar`Trick-or-Treating Tot`);
          equip($slot`familiar`, $item`li'l ninja costume`);
        }
        if (have($item`Deck of Every Card`) && get("_deckCardsDrawn") <= 10 &&  Math.min(6.6, Math.max(1, CommunityService.BoozeDrop.actualCost())))
          cliExecute("cheat fortune");
        if (checkValue($item`battery (lantern)`, Math.min(6.6, Math.max(1, CommunityService.BoozeDrop.actualCost())))) {
          if (itemAmount($item`battery (AAA)`) >= 5) create($item`battery (lantern)`, 1);
          use($item`battery (lantern)`, 1);
        }
        if (checkValue($item`pocket wish`, Math.min(13, Math.max(1, CommunityService.BoozeDrop.actualCost()))))
          wishFor($effect`Infernal Thirst`);
      },
      completed: () => CommunityService.BoozeDrop.isDone(),
      do: (): void => {
        const maxTurns = get("instant_boozeTestTurnLimit", 30);
        const testTurns = CommunityService.BoozeDrop.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print(
            "You may also increase the turn limit by typing 'set instant_boozeTestTurnLimit=<new limit>'",
            "red"
          );
        }
        CommunityService.BoozeDrop.run(() => logTestSetup(CommunityService.BoozeDrop), maxTurns);
      },
      outfit: {
        modifier:
          "1 Item Drop, 2 Booze Drop, -equip broken champagne bottle, switch disembodied hand, -switch left-hand man",
      },
      limit: { tries: 1 },
    },
  ],
};
