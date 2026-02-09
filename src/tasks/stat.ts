import {
  buy,
  cliExecute,
  create,
  Effect,
  itemAmount,
  myPrimestat,
  print,
  Stat,
  use,
  useSkill,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $item,
  $items,
  $skill,
  $stat,
  CommunityService,
  ensureEffect,
  get,
  have,
  uneffect,
  withChoice,
} from "libram";
import { Quest } from "../engine/task";
import {
  checkValue,
  computeHotRes,
  haveLoathingIdol,
  logTestSetup,
  reagentBalancerEffect,
  reagentBalancerItem,
  shrugAT,
  tryAcquiringEffect,
  useLoathingIdol,
} from "../lib";
import { args } from "../args";

function useBalancerForTest(testStat: Stat): void {
  if (testStat === myPrimestat()) {
    return;
  }
  if (!have(reagentBalancerEffect) && !have(reagentBalancerItem)) {
    create(reagentBalancerItem, 1);
  }
  ensureEffect(reagentBalancerEffect);
}

export const HPQuest: Quest = {
  name: "HP",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.HP.isDone(),
      prepare: (): void => {
        $effects`Ur-Kel's Aria of Annoyance, Aloysius' Antiphon of Aptitude, Ode to Booze`.forEach(
          (ef) => uneffect(ef)
        );
        const usefulEffects: Effect[] = [
          $effect`A Few Extra Pounds`,
          $effect`Big`,
          $effect`Mariachi Mood`,
          $effect`Patience of the Tortoise`,
          $effect`Power Ballad of the Arrowsmith`,
          $effect`Quiet Determination`,
          $effect`Reptilian Fortitude`,
          $effect`Saucemastery`,
          $effect`Seal Clubbing Frenzy`,
          $effect`Song of Starch`,
          $effect`Stevedave's Shanty of Superiority`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));
      },
      do: (): void => {
        const maxTurns = args.hplimit;
        const testTurns = CommunityService.HP.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit by checking the relay", "red");
        }
        CommunityService.HP.run(() => logTestSetup(CommunityService.HP), maxTurns);
      },
      outfit: { modifier: "HP, switch disembodied hand, -switch left-hand man" },
      limit: { tries: 1 },
    },
  ],
};

export const MuscleQuest: Quest = {
  name: "Muscle",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.Muscle.isDone(),
      prepare: (): void => {
        useBalancerForTest($stat`Muscle`);
        if (
          !have($effect`Phorcefullness`) &&
          !have($item`philter of phorce`) &&
          $items`scrumptious reagent, lemon`.every((it) => have(it))
        ) {
          create($item`philter of phorce`, 1);
        }
        if (!have(reagentBalancerEffect)) {
          if (!have(reagentBalancerItem)) {
            create(reagentBalancerItem, 1);
          }
          if (itemAmount(reagentBalancerItem) > 1)
            use(reagentBalancerItem, itemAmount(reagentBalancerItem) - 1);
        }
        if (!have($effect`Song of Bravado`)) shrugAT();
        const usefulEffects: Effect[] = [
          $effect`Big`,
          $effect`Disdain of the War Snapper`,
          $effect`Feeling Excited`,
          $effect`Go Get 'Em, Tiger!`,
          $effect`Macaroni Coating`,
          $effect`Quiet Determination`,
          $effect`Power Ballad of the Arrowsmith`,
          $effect`Phorcefullness`,
          $effect`Rage of the Reindeer`,
          $effect`Song of Bravado`,
          $effect`Stevedave's Shanty of Superiority`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (
          CommunityService.Muscle.turnsSavedBy($effect`Purity of Spirit`) >= 7 &&
          have($skill`Summon Clip Art`) &&
          get("tomeSummons") === 0
        ) {
          create($item`cold-filtered water`, 1);
          use($item`cold-filtered water`, 1);
          print("We used a cold-filtered water, which is bad!");
        }

        if (
          CommunityService.Muscle.turnsSavedBy($effect`Hulkien`) >= 5 &&
          have($item`Eight Days a Week Pill Keeper`) &&
          checkValue("Pillkeeper", CommunityService.Muscle.actualCost() - 1)
        )
          tryAcquiringEffect($effect`Hulkien`);
      },
      do: (): void => {
        const maxTurns = args.musclelimit;
        const testTurns = CommunityService.Muscle.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        if (have($effect`Giant Growth`)) cliExecute("set _folgerGiantFirst = true");
        CommunityService.Muscle.run(() => logTestSetup(CommunityService.Muscle), maxTurns);
      },
      outfit: { modifier: "Muscle, switch disembodied hand, -switch left-hand man" },
      post: (): void => {
        uneffect($effect`Power Ballad of the Arrowsmith`);
        if (have($effect`Giant Growth`)) cliExecute("set _folgerGiantFirst = true");
      },
      limit: { tries: 1 },
    },
  ],
};

export const MysticalityQuest: Quest = {
  name: "Mysticality",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.Mysticality.isDone(),
      prepare: (): void => {
        useBalancerForTest($stat`Mysticality`);
        if (
          !have($effect`Mystically Oiled`) &&
          !have($item`ointment of the occult`) &&
          $items`scrumptious reagent, grapefruit`.every((it) => have(it))
        ) {
          create($item`ointment of the occult`, 1);
        }
        if (!have(reagentBalancerEffect)) {
          if (!have(reagentBalancerItem)) {
            create(reagentBalancerItem, 1);
          }
          if (itemAmount(reagentBalancerItem) > 1)
            use(reagentBalancerItem, itemAmount(reagentBalancerItem) - 1);
        }
        const usefulEffects: Effect[] = [
          $effect`Big`,
          $effect`Disdain of She-Who-Was`,
          $effect`Feeling Excited`,
          $effect`Glittering Eyelashes`,
          $effect`The Magical Mojomuscular Melody`,
          $effect`Pasta Oneness`,
          $effect`Quiet Judgement`,
          $effect`Saucemastery`,
          $effect`Song of Bravado`,
          $effect`Stevedave's Shanty of Superiority`,
          $effect`Mystically Oiled`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (
          CommunityService.Mysticality.actualCost() > 1 &&
          have($skill`Visit your Favorite Bird`) &&
          get("yourFavoriteBirdMods").includes("Mysticality Percent")
        )
          useSkill($skill`Visit your Favorite Bird`);

        if (
          CommunityService.Mysticality.actualCost() >= 7 &&
          have($skill`Summon Clip Art`) &&
          get("tomeSummons") === 0
        ) {
          create($item`cold-filtered water`, 1);
          use($item`cold-filtered water`, 1);
          print("We used a cold-filtered water, which is bad!");
        }

        if (
          CommunityService.Mysticality.actualCost() >= 5 &&
          have($item`Eight Days a Week Pill Keeper`) &&
          checkValue("Pillkeeper", CommunityService.Mysticality.actualCost() - 1)
        )
          tryAcquiringEffect($effect`Hulkien`);
      },
      do: (): void => {
        const maxTurns = args.myslimit;
        const testTurns = CommunityService.Mysticality.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        if (have($effect`Giant Growth`)) cliExecute("set _folgerGiantFirst = true");
        CommunityService.Mysticality.run(
          () => logTestSetup(CommunityService.Mysticality),
          maxTurns
        );
      },
      outfit: { modifier: "Mysticality, switch disembodied hand, -switch left-hand man" },
      post: (): void => {
        uneffect($effect`The Magical Mojomuscular Melody`);
      },
      limit: { tries: 1 },
    },
  ],
};

export const MoxieQuest: Quest = {
  name: "Moxie",
  tasks: [
    {
      name: "Test",
      completed: () => CommunityService.Moxie.isDone(),
      prepare: (): void => {
        useBalancerForTest($stat`Moxie`);
        if (!have(reagentBalancerEffect)) {
          if (!have(reagentBalancerItem)) {
            create(reagentBalancerItem, 1);
          }
          if (itemAmount(reagentBalancerItem) > 1)
            use(reagentBalancerItem, itemAmount(reagentBalancerItem) - 1);
        }
        if (!have($effect`Song of Bravado`)) shrugAT();
        const usefulEffects: Effect[] = [
          // $effect`Amazing`,
          $effect`Big`,
          $effect`Blessing of the Bird`,
          $effect`Blubbered Up`,
          $effect`Butt-Rock Hair`,
          $effect`Disco Fever`,
          $effect`Disco Smirk`,
          $effect`Disco State of Mind`,
          $effect`Feeling Excited`,
          $effect`The Moxious Madrigal`,
          $effect`Penne Fedora`,
          $effect`Pomp & Circumsands`,
          $effect`Quiet Desperation`,
          $effect`Song of Bravado`,
          $effect`Stevedave's Shanty of Superiority`,
          $effect`Unrunnable Face`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (CommunityService.Moxie.actualCost() > 1) {
          if (!haveLoathingIdol()) {
            buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);
          }
          withChoice(1505, 1, () => useLoathingIdol());
        }

        if (
          CommunityService.Moxie.actualCost() > 1 &&
          have($item`pocket maze`) &&
          !have($effect`Amazing`) &&
          computeHotRes(false) <= 1
        )
          use($item`pocket maze`);

        if (CommunityService.Moxie.actualCost() > 1) {
          if (!have($item`Letter from Carrie Bradshaw`)) {
            buy($coinmaster`Mr. Store 2002`, 1, $item`Letter from Carrie Bradshaw`);
          }
          withChoice(1506, 3, () => use($item`Letter from Carrie Bradshaw`));
        }

        if (
          CommunityService.Moxie.actualCost() >= 7 &&
          have($skill`Summon Clip Art`) &&
          get("tomeSummons") === 0
        ) {
          create($item`cold-filtered water`, 1);
          use($item`cold-filtered water`, 1);
          print("We used a cold-filtered water, which is bad!");
        }

        if (
          CommunityService.Moxie.actualCost() >= 5 &&
          have($item`Eight Days a Week Pill Keeper`) &&
          checkValue("Pillkeeper", CommunityService.Moxie.actualCost() - 1)
        )
          tryAcquiringEffect($effect`Hulkien`);
      },
      do: (): void => {
        const maxTurns = args.moxielimit;
        const testTurns = CommunityService.Moxie.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        if (have($effect`Giant Growth`)) cliExecute("set _folgerGiantFirst = true");
        CommunityService.Moxie.run(() => logTestSetup(CommunityService.Moxie), maxTurns);
      },
      outfit: { modifier: "Moxie, switch disembodied hand, -switch left-hand man" },
      limit: { tries: 1 },
    },
  ],
};
