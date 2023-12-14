import { Quest } from "../engine/task";
import {
  buy,
  cliExecute,
  Effect,
  equip,
  myMaxhp,
  print,
  restoreHp,
  restoreMp,
  runChoice,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $effect,
  $familiar,
  $item,
  $skill,
  $slot,
  clamp,
  CommunityService,
  get,
  have,
  uneffect,
} from "libram";
import {
  checkTurnSave,
  checkValue,
  fuelUp,
  logTestSetup,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro from "../combat";
import { drive } from "libram/dist/resources/2017/AsdonMartin";
import { args } from "../args";
import { baseOutfit, unbreakableUmbrella } from "../engine/outfit";

export const NoncombatQuest: Quest = {
  name: "Noncombat",
  completed: () => CommunityService.Noncombat.isDone(),
  tasks: [
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
      name: "Favorite Bird (NC)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Combat Frequency"),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Driving Stealthily",
      ready: () => args.asdon,
      completed: () => have($effect`Driving Stealthily`),
      do: (): void => {
        fuelUp(), drive($effect`Driving Stealthily`);
      },
      limit: { tries: 3 },
    },
    {
      name: "Invisible Avatar",
      completed: () =>
        have($effect`Invisible Avatar`) || !have($item`Powerful Glove`) || args.saveglove,
      do: (): void => {
        equip($slot`acc3`, $item`Powerful Glove`);
        useSkill($skill`CHEAT CODE: Invisible Avatar`);
      },
      limit: { tries: 1 },
    },
    {
      name: "God Lobster",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        unbreakableUmbrella();
        restoreMp(50);
      },
      completed: () =>
        get("_godLobsterFights") >= 3 ||
        !have($familiar`God Lobster`) ||
        !have($item`God Lobster's Ring`),
      do: () => visitUrl("main.php?fightgodlobster=1"),
      combat: new CombatStrategy().macro(Macro.default(false)),
      choices: { 1310: 1 }, // Get xp on last fight
      outfit: () => ({
        ...baseOutfit(),
        famequip: $item`God Lobster's Ring`,
        familiar: $familiar`God Lobster`,
      }),
      limit: { tries: 3 },
    },
    {
      name: "Buy Porkpie-mounted Popper",
      completed: () =>
        have($item`porkpie-mounted popper`) ||
        CommunityService.BoozeDrop.prediction <= 1 ||
        get("_fireworksShopHatBought", false),
      do: () => buy($item`porkpie-mounted popper`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      completed: () => CommunityService.Noncombat.isDone(),
      prepare: (): void => {
        if (have($item`Jurassic Parka`) && get("parkaMode") !== "pterodactyl")
          cliExecute("parka pterodactyl");
        if (
          get("_kgbClicksUsed") < 22 &&
          have($item`Kremlin's Greatest Briefcase`) &&
          !args.savekgb
        )
          cliExecute("briefcase e -combat");
        const usefulEffects: Effect[] = [
          $effect`A Rose by Any Other Material`,
          $effect`Feeling Lonely`,
          $effect`Gummed Shoes`,
          $effect`Invisible Avatar`,
          $effect`Silent Running`,
          $effect`Smooth Movements`,
          $effect`The Sonata of Sneakiness`,
          $effect`Throwing Some Shade`,

          // Famwt for Disgeist
          $effect`Blood Bond`,
          $effect`Leash of Linguini`,
          $effect`Empathy`,
          $effect`Puzzle Champ`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
        cliExecute(
          "maximize('-combat, 0.04 familiar weight 75 max, switch disgeist, switch left-hand man, switch disembodied hand, -tie', false);"
        ); // To avoid maximizer bug, we invoke this once more

        // If it saves us >= 6 turns, try using a wish
        if (checkValue($item`pocket wish`, checkTurnSave("NonCombat", $effect`Disquiet Riot`)))
          wishFor($effect`Disquiet Riot`);
      },
      do: (): void => {
        const maxTurns = args.noncomlimit;
        const testTurns = CommunityService.Noncombat.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        CommunityService.Noncombat.run(() => logTestSetup(CommunityService.Noncombat), maxTurns);
      },
      outfit: {
        familiar: $familiar`Disgeist`,
        modifier:
          "-combat, 0.04 familiar weight 75 max, switch disgeist, switch left-hand man, switch disembodied hand, -tie, false",
      },
      post: (): void => {
        uneffect($effect`The Sonata of Sneakiness`);
      },
      limit: { tries: 1 },
    },
  ],
};
