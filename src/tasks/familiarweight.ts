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
  toInt,
  use,
  useFamiliar,
  useSkill,
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
  $slot,
  CommunityService,
  get,
  have,
  unequip,
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
import { args } from "../args";

export const FamiliarWeightQuest: Quest = {
  name: "Familiar Weight",
  completed: () => CommunityService.FamiliarWeight.isDone(),
  tasks: [
    {
      name: "Tune Moon to Platypus",
      completed: () =>
        !have($item`hewn moon-rune spoon`) ||
        get("moonTuned") ||
        args.savemoontune ||
        mySign() === "Platypus",
      do: (): void => {
        cliExecute("spoon platypus");
      },
    },
    {
      name: "Late Eat Deep Dish",
      ready: () => args.latedeepdish,
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
        args.savelimitedat,
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
      name: "Fiesta Exit",
      completed: () =>
        have($effect`Party Soundtrack`) ||
        !have($skill`Cincho: Party Soundtrack`) ||
        100 - get("_cinchUsed") < 75,
      do: (): void => {
        equip($slot`acc3`, $item`Cincho de Mayo`);
        useSkill($skill`Cincho: Party Soundtrack`);
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
      name: "Better Empathy",
      ready: () => have($item`April Shower Thoughts shield`),
      completed: () =>
        have($effect`Thoughtful Empathy`),
      do: () => {
        unequip($item`April Shower Thoughts shield`);
        useSkill($skill`Empathy of the Newt`);
        equip($item`April Shower Thoughts shield`);
        useSkill($skill`Empathy of the Newt`);
        unequip($item`April Shower Thoughts shield`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Test",
      completed: () => CommunityService.FamiliarWeight.isDone(),
      prepare: (): void => {
        const usefulEffects: Effect[] = [
          $effect`Billiards Belligerence`,
          $effect`Blood Bond`,
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
          $familiars`Comma Chameleon, Homemade Robot`.every((fam) => have(fam))
        ) {
          if (!have($item`box of Familiar Jacks`)) create($item`box of Familiar Jacks`, 1);
          useFamiliar($familiar`Homemade Robot`);
          use($item`box of Familiar Jacks`, 1);
          useFamiliar($familiar`Comma Chameleon`);
          visitUrl(
            `inv_equip.php?which=2&action=equip&whichitem=${toInt($item`homemade robot gear`)}&pwd`
          );
          visitUrl("charpane.php");
        }

        if (
          !have($familiar`Comma Chameleon`) &&
          have($familiar`Mini-Trainbot`) &&
          checkValue("ClipArt", 2)
        ) {
          useFamiliar($familiar`Mini-Trainbot`);
          use($item`box of Familiar Jacks`, 1);
        }

        if (
          have($item`Eight Days a Week Pill Keeper`) &&
          checkValue("Pillkeeper", Math.min(2, CommunityService.FamiliarWeight.actualCost()))
        )
          tryAcquiringEffect($effect`Fidoxene`);

        cliExecute("maximize familiar weight");

        if (!get("_madTeaParty")) {
          if (!have($item`sombrero-mounted sparkler`)) buy($item`sombrero-mounted sparkler`);
          tryAcquiringEffect($effect`You Can Really Taste the Dormouse`);
        }
      },
      do: (): void => {
        const maxTurns = args.familiarlimit;
        const testTurns = CommunityService.FamiliarWeight.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
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
