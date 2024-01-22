import { CombatStrategy, OutfitSpec } from "grimoire-kolmafia";
import {
  adv1,
  autosell,
  buy,
  changeMcd,
  cliExecute,
  create,
  currentMcd,
  drink,
  equip,
  getCampground,
  getWorkshed,
  haveEquipped,
  hermit,
  Item,
  itemAmount,
  myAdventures,
  myInebriety,
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
  $slot,
  $stat,
  clamp,
  CommunityService,
  get,
  getBanishedMonsters,
  getKramcoWandererChance,
  have,
  haveInCampground,
  Pantogram,
  SongBoom,
} from "libram";
import { Quest } from "../engine/task";
import { bestSIT, getGarden, goVote, statToMaximizerString, tryAcquiringEffect } from "../lib";
import Macro from "../combat";
import { mapMonster } from "libram/dist/resources/2020/Cartography";
import { baseOutfit, chooseFamiliar, unbreakableUmbrella } from "../engine/outfit";
import { args } from "../args";

let capeTuned = false;
const optimalCape =
  myPrimestat() === $stat`Muscle`
    ? "vampire thrill"
    : myPrimestat() === $stat`Mysticality`
    ? "heck thrill"
    : "robot thrill";

const useParkaSpit = have($item`Fourth of May Cosplay Saber`) && have($skill`Feel Envy`);
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
      // eslint-disable-next-line libram/verify-constants
      ready: () => have($item`S.I.T. Course Completion Certificate`),
      completed: () => get("_sitCourseCompleted", false),
      choices: {
        1494: bestSIT,
      },
      do: () =>
        // eslint-disable-next-line libram/verify-constants
        use($item`S.I.T. Course Completion Certificate`),
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
      name: "KGB",
      completed: () =>
        get("_kgbClicksUsed") > 0 || !have($item`Kremlin's Greatest Briefcase`) || args.savekgb,
      do: () => cliExecute("briefcase e ml"),
      limit: { tries: 1 },
    },
    {
      name: "Restore mp",
      completed: () => get("timesRested") >= args.saverests || myMp() >= Math.min(50, myMaxmp()),
      prepare: (): void => {
        if (have($item`Newbiesport™ tent`)) use($item`Newbiesport™ tent`);
      },
      do: (): void => {
        if (myMeat() >= 2000) {
          restoreMp(50);
        }
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
      name: "Borrowed Time",
      prepare: (): void => {
        if (have($item`borrowed time`)) return;
        if (have($skill`Summon Clip Art`) && get("tomeSummons") < 3)
          create($item`borrowed time`, 1);
        else takeStorage($item`borrowed time`, 1);
      },
      completed: () => get("_borrowedTimeUsed") || args.skipbt,
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
      name: "Numberology",
      ready: () => Object.keys(reverseNumberology()).includes("69"),
      completed: () =>
        get("_universeCalculated") >=
        (get("skillLevel144") > 3 ? 3 : get("skillLevel144")) - args.savenumberology,
      do: () => cliExecute("numberology 69"),
      limit: { tries: 3 },
    },
    {
      name: "Get Camel Hat",
      ready: () => args.camelhat,
      completed: () => have($item`dromedary drinking helmet`) || !have($familiar`Melodramedary`),
      do: (): void => {
        if (!have($item`box of Familiar Jacks`)) create($item`box of Familiar Jacks`, 1);

        useFamiliar($familiar`Melodramedary`);
        use($item`box of Familiar Jacks`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Ensure Comma Chameleon Jacks",
      ready: () => have($skill`Summon Clip Art`),
      completed: () =>
        have($item`box of Familiar Jacks`) ||
        !have($familiar`Comma Chameleon`) ||
        have($item`homemade robot gear`),
      do: (): void => {
        create($item`box of Familiar Jacks`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Summon Sugar Sheets",
      completed: () =>
        !have($skill`Summon Sugar Sheets`) || args.savesugar || get("tomeSummons") >= 3,
      do: (): void => {
        const sheetsToMake = 3 - get("tomeSummons");
        restoreMp(2 * sheetsToMake);
        useSkill($skill`Summon Sugar Sheets`, sheetsToMake);
      },
      limit: { tries: 1 },
    },
    {
      name: "Fold Sugar Sheets",
      completed: () => !have($item`sugar sheet`) || args.experimentalsynth,
      do: (): void => {
        const nextMissingSugarItem =
          $items`sugar shorts, sugar chapeau, sugar shank`.find((it) => !have(it)) || $item`none`;
        create(nextMissingSugarItem);
      },
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
        const statString = statToMaximizerString(myPrimestat());
        cliExecute(`mummery ${statString}`);
      },
      outfit: { familiar: chooseFamiliar() },
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
      name: "Autumnaton",
      completed: () =>
        !have($item`autumn-aton`) || have($item`autumn leaf`) || have($effect`Crunching Leaves`),
      do: () => cliExecute("autumnaton send The Sleazy Back Alley"),
      limit: { tries: 1 },
    },
    {
      name: "Set Asdon Workshed",
      ready: () => args.asdon,
      completed: () => getWorkshed() === $item`Asdon Martin keyfob`,
      do: () => use($item`Asdon Martin keyfob`),
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
      name: "Map Novelty Tropical Skeleton",
      prepare: (): void => {
        if (useParkaSpit) {
          cliExecute("parka dilophosaur");
        } else if (!have($item`yellow rocket`) && !have($effect`Everything Looks Yellow`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase yellow rocket!");
          buy($item`yellow rocket`, 1);
        }
        unbreakableUmbrella();
        if (haveEquipped($item`miniature crystal ball`)) equip($slot`familiar`, $item.none);
      },
      completed: () =>
        !have($skill`Map the Monsters`) ||
        get("_monstersMapped") >= 3 ||
        have($item`cherry`) ||
        args.skipbt ||
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
        Macro.if_(
          $monster`novelty tropical skeleton`,
          (useParkaSpit ? Macro.trySkill($skill`Spit jurassic acid`) : new Macro()).tryItem(
            $item`yellow rocket`
          )
        ).abort()
      ),
      outfit: () => ({
        ...baseOutfit(false),
        modifier: `${baseOutfit().modifier}, -equip miniature crystal ball`,
      }),
      post: (): void => {
        if (have($item`MayDay™ supply package`) && !args.savemayday)
          use($item`MayDay™ supply package`, 1);
        if (have($item`space blanket`)) autosell($item`space blanket`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Novelty Tropical Skeleton",
      prepare: (): void => {
        if (useParkaSpit) {
          cliExecute("parka dilophosaur");
        } else if (!have($item`yellow rocket`) && !have($effect`Everything Looks Yellow`)) {
          if (myMeat() < 250) throw new Error("Insufficient Meat to purchase yellow rocket!");
          buy($item`yellow rocket`, 1);
        }
        unbreakableUmbrella();
        if (get("_snokebombUsed") === 0) restoreMp(50);
        if (haveEquipped($item`miniature crystal ball`)) equip($slot`familiar`, $item.none);
      },
      completed: () => args.skipbt || have($item`cherry`),
      do: $location`The Skeleton Store`,
      combat: new CombatStrategy().macro(() =>
        Macro.if_(
          $monster`novelty tropical skeleton`,
          (useParkaSpit ? Macro.trySkill($skill`Spit jurassic acid`) : new Macro()).tryItem(
            $item`yellow rocket`
          )
        )
          .externalIf(
            !Array.from(getBanishedMonsters().keys()).includes($skill`Bowl a Curveball`),
            Macro.trySkill($skill`Bowl a Curveball`)
          )
          .externalIf(
            !Array.from(getBanishedMonsters().keys()).includes($skill`Snokebomb`),
            Macro.trySkill($skill`Snokebomb`)
          )
          .externalIf(
            !Array.from(getBanishedMonsters().keys()).includes($skill`Monkey Slap`),
            Macro.trySkill($skill`Monkey Slap`)
          )
          .abort()
      ),

      outfit: (): OutfitSpec => {
        return {
          shirt: useParkaSpit ? $item`Jurassic Parka` : undefined,
          offhand: $item`unbreakable umbrella`,
          acc3: $item`cursed monkey's paw`,
          familiar: chooseFamiliar(false),
          modifier: `${baseOutfit().modifier}, -equip miniature crystal ball`,
        };
      },
      post: (): void => {
        if (have($item`MayDay™ supply package`) && !args.savemayday)
          use($item`MayDay™ supply package`, 1);
        if (have($item`space blanket`)) autosell($item`space blanket`, 1);
      },
      limit: { tries: 4 },
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
      name: "Get Distilled Fortified Wine",
      ready: () => have($item`11-leaf clover`) || have($effect`Lucky!`),
      completed: () =>
        myInebriety() >= 1 ||
        args.fortifiedwine ||
        (get("_borrowedTimeUsed") && myAdventures() >= 60) ||
        args.skipbt,
      do: (): void => {
        if (!have($effect`Lucky!`)) use($item`11-leaf clover`);
        if (!have($item`distilled fortified wine`)) adv1($location`The Sleazy Back Alley`, -1);
        while (have($item`distilled fortified wine`) && myInebriety() < 1) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink($item`distilled fortified wine`, 1);
        }
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
      completed: () =>
        getKramcoWandererChance() < 1.0 || !have($item`Kramco Sausage-o-Matic™`) || args.skipbt,
      do: $location`Noob Cave`,
      outfit: () => ({
        ...baseOutfit(),
        offhand: $item`Kramco Sausage-o-Matic™`,
      }),
      combat: new CombatStrategy().macro(Macro.default()),
    },
  ],
};
