import { CombatStrategy } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  create,
  eat,
  Effect,
  equip,
  haveEffect,
  itemAmount,
  myClass,
  mySign,
  print,
  storageAmount,
  takeStorage,
  toInt,
  use,
  useFamiliar,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $familiars,
  $item,
  $location,
  $skill,
  CommunityService,
  get,
  have,
} from "libram";
import { Quest } from "../engine/task";
import { checkValue, logTestSetup, shrugAT, tryAcquiringEffect } from "../lib";
import Macro from "../combat";
import {
  avoidDaylightShavingsHelm,
  chooseFamiliar,
  chooseHeaviestFamiliar,
  sugarItemsAboutToBreak,
} from "../engine/outfit";

export const FamiliarWeightQuest: Quest = {
  name: "Familiar Weight",
  completed: () => CommunityService.FamiliarWeight.isDone(),
  tasks: [
    {
      name: "Tune Moon to Platypus",
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        get("moonTuned") ||
        get("instant_saveMoonTune", false) ||
        mySign() === "Platypus",
      do: (): void => {
        cliExecute("spoon platypus");
      },
    },
    {
      name: "Late Eat Deep Dish",
      ready: () => get("instant_lateDeepDish", false),
      completed: () => get("deepDishOfLegendEaten") || !have($item`Deep Dish of Legend`),
      do: (): void => {
        if (have($item`familiar scrapbook`)) {
          equip($item`familiar scrapbook`);
        }
        eat($item`Deep Dish of Legend`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Chorale of Companionship",
      completed: () =>
        !have($skill`Chorale of Companionship`) ||
        have($effect`Chorale of Companionship`) ||
        myClass() !== $class`Accordion Thief` ||
        get("instant_saveLimitedAT", false),
      do: (): void => {
        shrugAT();
        cliExecute("cast 1 Chorale of Companionship");
      },
    },
    {
      name: "Fold Burning Newspaper",
      completed: () => !have($item`burning newspaper`),
      do: () => cliExecute("create burning paper crane"),
      limit: { tries: 1 },
    },
    {
      name: "Pull Repaid Diaper",
      completed: () =>
        get("_roninStoragePulls").split(",").length >= 5 ||
        5 - get("_roninStoragePulls").split(",").length <= get("instant_savePulls", 0) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`repaid diaper`).toString()) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Great Wolf's beastly trousers`).toString()) ||
        have($item`repaid diaper`) ||
        storageAmount($item`repaid diaper`) === 0 ||
        !get("instant_experimentPulls", true),
      do: (): void => {
        takeStorage($item`repaid diaper`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Pull Great Wolf's beastly trousers",
      completed: () =>
        get("_roninStoragePulls").split(",").length >= 5 ||
        5 - get("_roninStoragePulls").split(",").length <= get("instant_savePulls", 0) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`repaid diaper`).toString()) ||
        get("_roninStoragePulls")
          .split(",")
          .includes(toInt($item`Great Wolf's beastly trousers`).toString()) ||
        have($item`Great Wolf's beastly trousers`) ||
        storageAmount($item`Great Wolf's beastly trousers`) === 0 ||
        !get("instant_experimentPulls", true),
      do: (): void => {
        takeStorage($item`Great Wolf's beastly trousers`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Meteor Shower",
      completed: () =>
        have($effect`Meteor Showered`) ||
        !have($item`Fourth of May Cosplay Saber`) ||
        !have($skill`Meteor Lore`) ||
        get("_saberForceUses") >= 5,
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Meteor Shower`)
          .trySkill($skill`Use the Force`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar: chooseFamiliar(false),
        avoid: [
          ...sugarItemsAboutToBreak(),
          ...(avoidDaylightShavingsHelm() ? [$item`Daylight Shavings Helmet`] : []),
        ],
      }),
      choices: { 1387: 3 },
      limit: { tries: 1 },
    },
    {
      name: "Test",
      completed: () => CommunityService.FamiliarWeight.isDone(),
      prepare: (): void => {
        const usefulEffects: Effect[] = [
          $effect`Billiards Belligerence`,
          $effect`Blood Bond`,
          $effect`Boxing Day Glow`,
          $effect`Do I Know You From Somewhere?`,
          $effect`Empathy`,
          $effect`Heart of Green`,
          $effect`Kindly Resolve`,
          $effect`Leash of Linguini`,
          $effect`Puzzle Champ`,
          $effect`Robot Friends`,
          $effect`Shortly Stacked`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (have($item`love song of icy revenge`))
          use(
            Math.min(
              4 - Math.floor(haveEffect($effect`Cold Hearted`) / 5),
              itemAmount($item`love song of icy revenge`)
            ),
            $item`love song of icy revenge`
          );
        if (
          have($skill`Summon Clip Art`) &&
          ($familiars`Mini-Trainbot, Exotic Parrot`.some((fam) => have(fam)) ||
            $familiars`Comma Chameleon, Homemade Robot`.every((fam) => have(fam)))
        ) {
          if (!have($item`box of Familiar Jacks`)) create($item`box of Familiar Jacks`, 1);
          if ($familiars`Comma Chameleon, Homemade Robot`.every((fam) => have(fam))) {
            useFamiliar($familiar`Homemade Robot`);
            use($item`box of Familiar Jacks`, 1);
            useFamiliar($familiar`Comma Chameleon`);
            visitUrl(
              `inv_equip.php?which=2&action=equip&whichitem=${toInt(
                $item`homemade robot gear`
              )}&pwd`
            );
            visitUrl("charpane.php");
          } else {
            if (have($familiar`Mini-Trainbot`)) useFamiliar($familiar`Mini-Trainbot`);
            else useFamiliar($familiar`Exotic Parrot`);
            use($item`box of Familiar Jacks`, 1);
          }
          if (
            have($item`Eight Days a Week Pill Keeper`) &&
            checkValue("Pillkeeper", Math.min(3, CommunityService.FamiliarWeight.actualCost()))
          )
            tryAcquiringEffect($effect`Fidoxene`);

          cliExecute("maximize familiar weight");

          if (!get("_madTeaParty")) {
            if (!have($item`sombrero-mounted sparkler`)) buy($item`sombrero-mounted sparkler`);
            tryAcquiringEffect($effect`You Can Really Taste the Dormouse`);
          }
        }
      },
      do: (): void => {
        const maxTurns = get("instant_famTestTurnLimit", 50);
        const testTurns = CommunityService.FamiliarWeight.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print(
            "You may also increase the turn limit by typing 'set instant_famTestTurnLimit=<new limit>'",
            "red"
          );
        }
        CommunityService.FamiliarWeight.run(
          () => logTestSetup(CommunityService.FamiliarWeight),
          maxTurns
        );
      },
      outfit: () => ({ modifier: "familiar weight", familiar: chooseHeaviestFamiliar() }),
      limit: { tries: 1 },
    },
  ],
};
