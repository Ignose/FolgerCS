import { CombatStrategy } from "grimoire-kolmafia";
import {
  abort,
  autosell,
  buy,
  buyUsingStorage,
  changeMcd,
  cliExecute,
  create,
  currentMcd,
  eat,
  getCampground,
  getClanName,
  getWorkshed,
  hermit,
  Item,
  itemAmount,
  myAdventures,
  myMaxhp,
  myMaxmp,
  myMeat,
  myMp,
  myPrimestat,
  mySign,
  mySoulsauce,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  reverseNumberology,
  runChoice,
  storageAmount,
  takeStorage,
  toInt,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $items,
  $location,
  $monster,
  $skill,
  $stat,
  AprilingBandHelmet,
  clamp,
  Clan,
  CommunityService,
  get,
  getKramcoWandererChance,
  have,
  haveInCampground,
  Pantogram,
  set,
  SongBoom,
  TrainSet,
} from "libram";
import { Quest } from "../engine/task";
import { bestSIT, getGarden, goVote, sellMiscellaneousItems, statToMaximizerString } from "../lib";
import Macro from "../combat";
import { baseOutfit } from "../engine/outfit";
import { args } from "../args";
import { Cycle, setConfiguration, Station } from "libram/dist/resources/2022/TrainSet";

let capeTuned = false;
let duffo = false;
const optimalCape =
  myPrimestat() === $stat`Muscle`
    ? "vampire thrill"
    : myPrimestat() === $stat`Mysticality`
    ? "heck thrill"
    : "robot thrill";

const btorpizza = false;

export const RunStartQuest: Quest = {
  name: "Run Start",
  completed: () => CommunityService.CoilWire.isDone(),
  tasks: [
    {
      name: "Council",
      completed: () => get("lastCouncilVisit") > 0,
      do: () => visitUrl("council.php"),
    },
    {
      name: "Apriling Part 1",
      ready: () => AprilingBandHelmet.canChangeSong(),
      completed: () => have($effect`Apriling Band Patrol Beat`),
      do: (): void => {
        AprilingBandHelmet.conduct($effect`Apriling Band Patrol Beat`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Toot",
      prepare: () => visitUrl("tutorial.php?action=toot"),
      completed: () =>
        get("questM05Toot") === "finished" && !have($item`letter from King Ralph XI`),
      do: () => use($item`letter from King Ralph XI`),
      limit: { tries: 1 },
    },
    {
      name: "Get Rake",
      completed: () => have($item`rake`) || !haveInCampground($item`A Guide to Burning Leaves`),
      do: (): void => {
        cliExecute("leaves");
      },
      limit: { tries: 1 },
    },
    {
      name: "Skeleton Store",
      completed: () => get("questM23Meatsmith") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=meatsmith&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Overgrown Lot",
      completed: () => get("questM24Doc") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=doc&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Madness Bakery",
      completed: () => get("questM25Armorer") !== "unstarted",
      do: (): void => {
        visitUrl("shop.php?whichshop=armory&action=talk");
        runChoice(1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Sell Pork Gems",
      completed: () => !have($item`pork elf goodies sack`),
      do: (): void => {
        use($item`pork elf goodies sack`);
        autosell($item`hamethyst`, itemAmount($item`hamethyst`));
        autosell($item`baconstone`, itemAmount($item`baconstone`));
      },
      limit: { tries: 1 },
    },
    {
      name: "SIT Course",

      ready: () => have($item`S.I.T. Course Completion Certificate`),
      completed: () => get("_sitCourseCompleted", false),
      choices: {
        1494: bestSIT,
      },
      do: () => use($item`S.I.T. Course Completion Certificate`),
    },
    {
      name: "Do Pullls",
      completed: () => 5 - get("_roninStoragePulls").split(",").length <= args.savepulls,
      do: () => {
        buyUsingStorage($item`tobiko marble soda`, 1);
        takeStorage($item`Great Wolf's beastly trousers`, 1);
        takeStorage($item`meteorite necklace`, 1);
        takeStorage($item`Stick-Knife of Loathing`, 1);
        takeStorage($item`Staff of Simmering Hatred`, 1);
        takeStorage($item`tobiko marble soda`, 1);
      },
    },
    {
      name: "Tune Cape",
      ready: () => !capeTuned,
      completed: () => capeTuned,
      do: (): void => {
        cliExecute(`retrocape ${optimalCape}`);
        capeTuned = true;
      },
    },
    {
      name: "Get Floundry item",
      completed: () => get("_floundryItemCreated") || args.savefloundry,
      do: (): void => {
        retrieveItem($item`carpe`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Update Replica Store Credits",
      completed: () =>
        !have($item`2002 Mr. Store Catalog`) || get("_2002MrStoreCreditsCollected", true),
      do: () =>
        visitUrl(`inv_use.php?whichitem=${toInt($item`2002 Mr. Store Catalog`)}&which=f0&pwd`),
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
        // eslint-disable-next-line libram/verify-constants
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
      name: "Numberology",
      ready: () => Object.keys(reverseNumberology()).includes("69"),
      completed: () =>
        get("_universeCalculated") >=
        (get("skillLevel144") > 3 ? 3 : get("skillLevel144")) - args.savenumberology,
      do: () => cliExecute("numberology 69"),
      limit: { tries: 3 },
    },
    {
      name: "Chateau Desk",
      completed: () => get("_chateauDeskHarvested") || !get("chateauAvailable"),
      do: (): void => {
        visitUrl("place.php?whichplace=chateau&action=chateau_desk");
        const juiceBarItems: Item[] = [
          $item`clove-flavored lip balm`,
          $item`ectoplasm <i>au jus</i>`,
        ];
        if (get("_loveTunnelUsed") || !get("loveTunnelAvailable"))
          juiceBarItems.push($item`gremlin juice`);
        juiceBarItems.forEach((it) => {
          autosell(it, itemAmount(it));
        });
      },
      limit: { tries: 1 },
    },
    {
      name: "Cowboy Boots",
      completed: () => have($item`your cowboy boots`) || !get("telegraphOfficeAvailable"),
      do: () => visitUrl("place.php?whichplace=town_right&action=townright_ltt"),
      limit: { tries: 1 },
    },
    {
      name: "Detective Badge",
      completed: () =>
        $items`plastic detective badge, bronze detective badge, silver detective badge, gold detective badge`.some(
          (badge) => have(badge)
        ) || !get("hasDetectiveSchool"),
      do: () => visitUrl("place.php?whichplace=town_wrong&action=townwrong_precinct"),
      limit: { tries: 1 },
    },
    {
      name: "Detective School",
      completed: () => get("_detectiveCasesCompleted", 0) >= 3 || !get("hasDetectiveSchool"),
      do: () => cliExecute("Detective Solver"),
      limit: { tries: 3 },
    },
    {
      name: "Pantagramming",
      completed: () =>
        Pantogram.havePants() || !have($item`portable pantogram`) || args.savepantogramming,
      do: (): void => {
        const makeMeat = have($item`porquoise`) ? "Meat Drop: 60" : "Spell Damage Percent: 20";
        Pantogram.makePants(
          "Mysticality",
          "Hot Resistance: 2",
          "Maximum HP: 40",
          "Combat Rate: -5",
          makeMeat
        );
      },
      limit: { tries: 1 },
    },
    {
      name: "Mummery",
      completed: () =>
        get("_mummeryMods").includes(`Experience (${myPrimestat().toString()})`) ||
        !have($item`mumming trunk`) ||
        args.savemumming,
      do: (): void => {
        useFamiliar($familiar`Jill-of-All-Trades`);
        const statString = statToMaximizerString(myPrimestat());
        cliExecute(`mummery ${statString}`);
      },
      limit: { tries: 1 },
    },
    {
      name: "BoomBox",
      completed: () =>
        SongBoom.song() === "These Fists Were Made for Punchin'" || !have($item`SongBoom™ BoomBox`),
      do: () => SongBoom.setSong("These Fists Were Made for Punchin'"),
      limit: { tries: 1 },
    },
    {
      name: "Horsery",
      completed: () => get("_horsery") === "dark horse" || !get("horseryAvailable"),
      do: () => cliExecute("horsery dark"),
      limit: { tries: 1 },
    },
    {
      name: "Vote!",
      completed: () => have($item`"I Voted!" sticker`) || !get("voteAlways"),
      do: (): void => {
        visitUrl("place.php?whichplace=town_right&action=townright_vote");
        goVote();
      },
    },
    {
      name: "Daycare Nap",
      completed: () => get("_daycareNap") || !get("daycareOpen"),
      do: () => cliExecute("daycare item"),
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
      name: "Cosplay Saber",
      completed: () => get("_saberMod") > 0 || !have($item`Fourth of May Cosplay Saber`),
      do: () => cliExecute("saber familiar"),
      limit: { tries: 1 },
    },
    {
      name: "Bird Calendar",
      completed: () => have($skill`Seek out a Bird`) || !have($item`Bird-a-Day calendar`),
      do: () => use($item`Bird-a-Day calendar`),
      limit: { tries: 1 },
    },
    {
      name: "Backup Camera",
      completed: () =>
        !have($item`backup camera`) ||
        (get("backupCameraMode") === "ml" && get("backupCameraReverserEnabled")),
      do: (): void => {
        cliExecute("backupcamera ml");
        if (!get("backupCameraReverserEnabled")) cliExecute("backupcamera reverser");
      },
    },
    {
      name: "Update Garbage Tote",
      completed: () => get("_garbageItemChanged") || !have($item`January's Garbage Tote`),
      do: () => cliExecute("fold broken champagne bottle"),
    },
    {
      name: "Grab Wishes",
      completed: () => !have($item`genie bottle`) || get("_genieWishesUsed") >= 3,
      do: () => cliExecute("genie item pocket"),
      limit: { tries: 3 },
    },
    {
      name: "Harvest Power Plant",
      completed: () =>
        !have($item`potted power plant`) ||
        get("_pottedPowerPlant")
          .split(",")
          .every((s) => s === "0"),
      do: (): void => {
        visitUrl(`inv_use.php?pwd&whichitem=${toInt($item`potted power plant`)}`);
        get("_pottedPowerPlant")
          .split(",")
          .forEach((s, i) => {
            if (s !== "0") visitUrl(`choice.php?pwd&whichchoice=1448&option=1&pp=${i + 1}`);
          });
      },
      limit: { tries: 1 },
    },
    {
      name: "Harvest Garden",
      completed: () =>
        [$item.none, $item`packet of mushroom spores`].includes(getGarden()) ||
        getCampground()[getGarden().name] === 0 ||
        args.savegarden,
      do: () => cliExecute("garden pick"),
      limit: { tries: 1 },
    },
    {
      name: "Looking Glass",
      completed: () => get("_lookingGlass"),
      do: () => visitUrl("clan_viplounge.php?action=lookingglass&whichfloor=2"),
      limit: { tries: 1 },
    },
    {
      name: "Apriling Band Runstart (-com)",
      completed: () => !AprilingBandHelmet.have() || have($effect`Apriling Band Patrol Beat`),
      do: () => AprilingBandHelmet.conduct($effect`Apriling Band Patrol Beat`),
      limit: { tries: 1 },
    },
    {
      name: "Autumnaton",
      completed: () =>
        !have($item`autumn-aton`) || have($item`autumn leaf`) || have($effect`Crunching Leaves`),
      do: () => cliExecute("autumnaton send The Sleazy Back Alley"),
      limit: { tries: 1 },
    },
    {
      name: "Set Workshed",
      completed: () =>
        getWorkshed() === $item`Asdon Martin keyfob (on ring)` ||
        getWorkshed() === $item`model train set`,
      do: (): void => {
        if (args.asdon) {
          use($item`Asdon Martin keyfob (on ring)`);
        } else use($item`model train set`);
      },
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
      name: "Use Mind Control Device",
      completed: () =>
        currentMcd() >= 10 || !["platypus", "opossum", "marmot"].includes(mySign().toLowerCase()), //This one should be easy, let folks use whatever sign!
      do: () => changeMcd(11),
      limit: { tries: 1 },
    },
    {
      name: "Configure Trainset Early",
      ready: () => getWorkshed() === $item`model train set`,
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
      name: "Chewing Gum",
      completed: () => myMeat() <= 600 || get("_cloversPurchased") >= 1,
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
        if (get("_cloversPurchased") < 3) hermit($item`11-leaf clover`, 1);
      },
      acquire: [{ item: $item`toy accordion` }],
      limit: { tries: 50 },
    },
    {
      name: "Unpack Duffel Bag",
      completed: () => duffo,
      do: () => {
        visitUrl("inventory.php?action=skiduffel&pwd");
        duffo = true;
      },
    },
    {
      name: "Borrowed Time",
      prepare: (): void => {
        create($item`borrowed time`, 1);
      },
      completed: () => get("_borrowedTimeUsed"),
      do: (): void => {
        if (storageAmount($item`borrowed time`) === 0 && !have($item`borrowed time`)) {
          print("Uh oh! You do not seem to have a borrowed time in Hagnk's", "red");
          print(
            "Try to purchase one from the mall with your meat from Hagnk's before re-running instantsccs",
            "red"
          );
        }
        use($item`borrowed time`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Clan Photo Booth Free Kill",
      completed: () =>
        (have($item`Sheriff moustache`) &&
          have($item`Sheriff badge`) &&
          have($item`Sheriff pistol`)) ||
        get("_photoBoothEquipment", 0) >= 3,
      do: (): void => {
        if (getClanName() !== "Bonus Adventures from Hell") {
          const clanWL = Clan.getWhitelisted();
          const bafhWL =
            clanWL.find((c) => c.name === getClanName()) !== undefined &&
            clanWL.find((c) => c.name === "Bonus Adventures from Hell") !== undefined;
          if (!bafhWL) return;
        }

        Clan.with("Bonus Adventures from Hell", () => {
          cliExecute("photobooth item moustache");
          cliExecute("photobooth item badge");
          cliExecute("photobooth item pistol");
        });
      },
      limit: { tries: 3 },
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
      name: "Ghost",
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
        ...baseOutfit(true, true, $monster`ice woman`),
        shirt: $item`Jurassic Parka`,
        back: $item`protonic accelerator pack`,
        avoid: $items`Daylight Shavings Helmet`,
      }),
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
        ...baseOutfit(true, true, $monster`sausage goblin`),
        shirt: $item`Jurassic Parka`,
        offhand: $item`Kramco Sausage-o-Matic™`,
        // eslint-disable-next-line libram/verify-constants
        acc3: $item`Möbius ring`, // Prime the ring
        modes: { parka: "spikolodon" },
        avoid: $items`Daylight Shavings Helmet`,
      }),
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Launch spikolodon spikes`).default()
      ),
      post: () => set("_mobiusSeeded", true),
    },
    {
      name: "NEP The Prequel",
      completed: () => get("_questPartyFair") !== "unstarted",
      do: $location`The Neverending Party`,
      choices: { 1322: 2 },
      outfit: () => ({
        ...baseOutfit(true, true),
        shirt: $item`Jurassic Parka`,
        offhand: $item`Kramco Sausage-o-Matic™`,
      }),
      combat: new CombatStrategy().macro(Macro.default()),
    },
    {
      name: "Pizza over Borrowed Time",
      ready: () => btorpizza,
      prepare: (): void => {
        cliExecute(`maximize ${myPrimestat()} experience percent`);
        if (have($item`whet stone`)) use($item`whet stone`);
      },
      completed: () => myAdventures() >= 61,
      do: (): void => {
        if (have($item`Calzone of Legend`)) eat($item`Calzone of Legend`, 1);
        if (have($item`Pizza of Legend`)) eat($item`Pizza of Legend`, 1);
        if (have($item`Deep Dish of Legend`)) eat($item`Deep Dish of Legend`, 1);
      },
      limit: { tries: 1 },
    },
  ],
};
