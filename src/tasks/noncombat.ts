import { Quest } from "../engine/task";
import {
  buy,
  cliExecute,
  Effect,
  equip,
  print,
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
  CommunityService,
  get,
  have,
  uneffect,
} from "libram";
import { checkTurnSave, checkValue, fuelUp, logTestSetup, tryAcquiringEffect, wishFor } from "../lib";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro from "../combat";
import { drive } from "libram/dist/resources/2017/AsdonMartin";
import { args } from "../args";

const familiar = have($familiar`Peace Turkey`) ? $familiar`Peace Turkey` : $familiar`Disgeist`;
const cap = familiar === $familiar`Peace Turkey` ? 50 : 75;

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
        fuelUp();
        drive($effect`Driving Stealthily`);
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
      name: "Test",
      completed: () => CommunityService.Noncombat.isDone(),
      prepare: (): void => {
        if (have($item`Jurassic Parka`) && get("parkaMode") !== "pterodactyl")
          cliExecute("parka pterodactyl");
        const usefulEffects: Effect[] = [
          $effect`A Rose by Any Other Material`,
          $effect`Blessing of the Bird`,
          $effect`Feeling Lonely`,
          $effect`Gummed Shoes`,
          $effect`Invisible Avatar`,
          $effect`Silent Running`,
          $effect`Smooth Movements`,
          $effect`The Sonata of Sneakiness`,
          $effect`Feeling Sneaky`,
          $effect`Ultra-Soft Steps`,
          $effect`Hiding From Seekers`,

          // Famwt for Disgeist
          $effect`Blood Bond`,
          $effect`Leash of Linguini`,
          $effect`Empathy`,
          $effect`Puzzle Champ`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (
          CommunityService.Noncombat.actualCost() > 1 &&
          !have($item`porkpie-mounted popper`) &&
          !get("_fireworksShopHatBought")
        )
          buy($item`porkpie-mounted popper`, 1);

        cliExecute(
          `maximize -raw combat rate, 0.04 familiar weight ${cap} max, switch ${familiar}, switch left-hand man, switch disembodied hand, switch peace turkey -tie`
        ); // To avoid maximizer bug, we invoke this once more

        if (
          checkValue($item`shady shades`, checkTurnSave("NonCombat", $effect`Throwing Some Shade`))
        )
          tryAcquiringEffect($effect`Throwing Some Shade`);

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
        familiar: familiar,
        modifier: `-raw combat rate, 0.04 familiar weight ${cap} max, switch ${familiar}, switch left-hand man, switch disembodied hand, -tie`,
      },
      post: (): void => {
        uneffect($effect`The Sonata of Sneakiness`);
      },
      limit: { tries: 1 },
    },
  ],
};
