import { CombatStrategy } from "grimoire-kolmafia";
import {
  cliExecute,
  drink,
  Effect,
  elementalResistance,
  equip,
  haveEquipped,
  inebrietyLimit,
  myAdventures,
  myClass,
  myHp,
  myInebriety,
  myMaxhp,
  myThrall,
  outfit,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $element,
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  $thrall,
  clamp,
  Clan,
  CommunityService,
  get,
  have,
  Witchess,
} from "libram";
import { Quest } from "../engine/task";
import {
  checkTurnSave,
  checkValue,
  forbiddenEffects,
  logTestSetup,
  shrugAT,
  startingClan,
  tryAcquiringEffect,
} from "../lib";
import Macro, { haveFreeBanish, haveMotherSlimeBanish } from "../combat";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { args } from "../args";

let triedDeepDark = false;

export const SpellDamageQuest: Quest = {
  name: "Spell Damage",
  completed: () => CommunityService.SpellDamage.isDone(),
  tasks: [
    {
      name: "Simmer",
      completed: () => have($effect`Simmering`) || !have($skill`Simmer`),
      do: () => useSkill($skill`Simmer`),
      limit: { tries: 1 },
    },
    {
      name: "Elron's Explosive Etude",
      completed: () =>
        !have($skill`Elron's Explosive Etude`) ||
        have($effect`Elron's Explosive Etude`) ||
        myClass() !== $class`Accordion Thief`,
      do: (): void => {
        shrugAT();
        cliExecute("cast 1 Elron's Explosive Etude");
      },
    },
    {
      name: "Cargo Shorts",
      ready: () =>
        checkValue("Cargo", CommunityService.SpellDamage.turnsSavedBy($effect`Sigils of Yeg`)),
      completed: () => get("_cargoPocketEmptied") || !have($item`Cargo Cultist Shorts`),
      do: (): void => {
        visitUrl("inventory.php?action=pocket");
        visitUrl("choice.php?whichchoice=1420&option=1&pocket=177");
      },
      limit: { tries: 1 },
    },
    {
      name: "Stand-Alone Carol Ghost Buff",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        !have($familiar`Ghost of Crimbo Carols`) ||
        (have($skill`Meteor Lore`) && get("camelSpit") < 100) ||
        !haveFreeBanish() ||
        $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`.some(
          (ef) => have(ef)
        ),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(Macro.banish().abort()),
      outfit: {
        offhand: $item`latte lovers member's mug`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Ghost of Crimbo Carols`,
        famequip: $item.none,
      },
      limit: { tries: 1 },
    },
    {
      name: "Inner Elf",
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
        Clan.join(args.motherclan);
      },
      completed: () =>
        !have($familiar`Machine Elf`) ||
        !haveMotherSlimeBanish() ||
        have($effect`Inner Elf`) ||
        args.motherclan.length === 0,
      do: $location`The Slime Tube`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`KGB tranquilizer dart`)
          .trySkill($skill`Snokebomb`)
          .abort()
      ),
      choices: { 326: 1 },
      outfit: {
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Eight Days a Week Pill Keeper`, // survive first hit if it occurs
        familiar: $familiar`Machine Elf`,
        modifier: "HP",
      },
      post: () => Clan.join(startingClan),
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
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Use the Force`)
          .abort()
      ),
      outfit: () => ({
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar:
          get("camelSpit") >= 100
            ? $familiar`Melodramedary`
            : $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`.some(
                (ef) => have(ef)
              )
            ? $familiar`Ghost of Crimbo Carols`
            : chooseFamiliar(false),
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      limit: { tries: 1 },
    },
    {
      name: "Deep Dark Visions",
      completed: () =>
        have($effect`Visions of the Deep Dark Deeps`) ||
        forbiddenEffects.includes($effect`Visions of the Deep Dark Deeps`) ||
        !have($skill`Deep Dark Visions`) ||
        triedDeepDark,
      prepare: () =>
        $effects`Astral Shell, Elemental Saucesphere`.forEach((ef) => tryAcquiringEffect(ef)),
      do: (): void => {
        triedDeepDark = true;
        const resist = 1 - elementalResistance($element`spooky`) / 100;
        const neededHp = Math.max(500, myMaxhp() * 4 * resist);
        if (myMaxhp() < neededHp) return;
        if (myHp() < neededHp) restoreHp(neededHp);
        tryAcquiringEffect($effect`Visions of the Deep Dark Deeps`);
      },
      outfit: { modifier: "HP 500max, Spooky Resistance", familiar: $familiar`Exotic Parrot` },
      limit: { tries: 1 },
    },
    {
      name: "Stick-Knife Trick",
      ready: () =>
        args.stickknifeoutfit !== "" &&
        myClass() === $class`Pastamancer` &&
        have($item`Stick-Knife of Loathing`) &&
        (have($skill`Bind Undead Elbow Macaroni`) || myThrall() === $thrall`Undead Elbow Macaroni`),
      completed: () => haveEquipped($item`Stick-Knife of Loathing`),
      do: (): void => {
        if (myThrall() !== $thrall`Undead Elbow Macaroni`)
          useSkill($skill`Bind Undead Elbow Macaroni`);
        outfit(args.stickknifeoutfit);
      },
      limit: { tries: 1 },
    },
    {
      name: "Test",
      prepare: (): void => {
        if (
          have($item`Ye Wizard's Shack snack voucher`) &&
          !forbiddenEffects.includes($effect`Pisces in the Skyces`)
        )
          retrieveItem($item`tobiko marble soda`);

        shrugAT();

        if (have($familiar`Grim Brother`)) cliExecute("grim damage");

        const usefulEffects: Effect[] = [
          $effect`Arched Eyebrow of the Archmage`,
          $effect`Carol of the Hells`,
          $effect`Cowrruption`,
          $effect`Destructive Resolve`,
          $effect`Imported Strength`,
          $effect`Jackasses' Symphony of Destruction`,
          $effect`Mental A-cue-ity`,
          $effect`Pisces in the Skyces`,
          $effect`Song of Sauce`,
          $effect`Sigils of Yeg`,
          $effect`Spirit of Peppermint`,
          $effect`The Magic of LOV`,
          $effect`Warlock, Warstock, and Warbarrel`,
          $effect`We're All Made of Starfish`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        const wines = $items`Sacramento wine, distilled fortified wine`;
        while (
          CommunityService.SpellDamage.actualCost() > myAdventures() &&
          myInebriety() < inebrietyLimit() &&
          wines.some((booze) => have(booze))
        ) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink(wines.filter((booze) => have(booze))[0], 1);
        }

        if (checkValue($item`battery (AAA)`, checkTurnSave("SpellDamage", $effect`AAA-Charged`)))
          tryAcquiringEffect($effect`AAA-Charged`, true);

        if (!get("_madTeaParty") && !Witchess.have()) {
          if (!have($item`mariachi hat`)) retrieveItem(1, $item`chewing gum on a string`);
          tryAcquiringEffect($effect`Full Bottle in front of Me`);
        }
      },
      completed: () => CommunityService.SpellDamage.isDone(),
      do: (): void => {
        const maxTurns = args.spelldmglimit;
        const testTurns = CommunityService.SpellDamage.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        CommunityService.SpellDamage.run(
          () => logTestSetup(CommunityService.SpellDamage),
          maxTurns
        );
      },
      outfit: { modifier: "spell dmg, switch disembodied hand, -switch left-hand man" },
      post: (): void => {
        if (have($skill`Spirit of Nothing`)) useSkill($skill`Spirit of Nothing`);
        if (have($familiar`Left-Hand Man`)) equip($familiar`Left-Hand Man`, $item.none);
        shrugAT();
      },
      limit: { tries: 1 },
    },
  ],
};
