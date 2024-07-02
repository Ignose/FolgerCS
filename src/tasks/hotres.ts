import { CombatStrategy } from "grimoire-kolmafia";
import { buy, cliExecute, create, Effect, print, useSkill } from "kolmafia";
import {
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  CombatLoversLocket,
  CommunityService,
  get,
  have,
} from "libram";
import { Quest } from "../engine/task";
import {
  checkTurnSave,
  checkValue,
  computeHotRes,
  logTestSetup,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import Macro from "../combat";
import { args } from "../args";

export const HotResQuest: Quest = {
  name: "Hot Res",
  completed: () => CommunityService.HotRes.isDone(),
  tasks: [
    {
      name: "Grab Foam Suit",
      completed: () =>
        have($effect`Fireproof Foam Suit`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        get("_saberForceUses") >= 5 ||
        !have($item`industrial fire extinguisher`) ||
        !have($skill`Double-Fisted Skull Smashing`),
      do: $location`The Dire Warren`,
      outfit: {
        back: $item`vampyric cloake`,
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: $item`industrial fire extinguisher`,
        familiar: $familiar`Cookbookbat`,
        modifier: "Item Drop",
      },
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Become a Cloud of Mist`)
          .skill($skill`Fire Extinguisher: Foam Yourself`)
          .skill($skill`Use the Force`)
          .abort()
      ),
      limit: { tries: 1 },
    },
    {
      name: "Metal Meteoroid",
      completed: () => !have($item`metal meteoroid`) || have($item`meteorite guard`),
      do: () => create($item`meteorite guard`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Favorite Bird (Hot Res)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Hot Resistance"),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        cliExecute("retrocape vampire hold");
        if (get("parkaMode") !== "pterodactyl") cliExecute("parka pterodactyl");

        const usefulEffects: Effect[] = [
          $effect`Amazing`,
          $effect`Astral Shell`,
          $effect`Egged On`,
          $effect`Elemental Saucesphere`,
          $effect`Feeling Peaceful`,
          // $effect`Hot-Headed`,

          // Famwt Buffs
          $effect`Blood Bond`,
          $effect`Empathy`,
          $effect`Leash of Linguini`,
          $effect`Robot Friends`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
        cliExecute("maximize hot res");
      },
      completed: () => CommunityService.HotRes.isDone(),
      do: (): void => {
        const maxTurns = args.hotlimit;
        const testTurns = CommunityService.HotRes.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        CommunityService.HotRes.run(() => logTestSetup(CommunityService.HotRes), maxTurns);
      },
      outfit: {
        modifier: "hot res",
        familiar: $familiar`Exotic Parrot`,
      },
      limit: { tries: 1 },
    },
  ],
};
