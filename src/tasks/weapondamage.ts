import { CombatStrategy } from "grimoire-kolmafia";
import {
  buy,
  cliExecute,
  create,
  Effect,
  faxbot,
  haveEquipped,
  myClass,
  myLevel,
  myMaxhp,
  myPrimestat,
  myThrall,
  outfit,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  use,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $stat,
  $thrall,
  clamp,
  Clan,
  CombatLoversLocket,
  CommunityService,
  get,
  have,
  SongBoom,
} from "libram";
import Macro, { haveFreeBanish, haveMotherSlimeBanish } from "../combat";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { Quest } from "../engine/task";
import {
  checkLocketAvailable,
  checkTurnSave,
  checkValue,
  forbiddenEffects,
  logTestSetup,
  shrugAT,
  startingClan,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { args } from "../args";

const canesword = have($item`candy cane sword cane`);
const stickknife = () =>
  have($item`Stick-Knife of Loathing`) &&
  (myPrimestat() === $stat`Muscle` || myClass() === $class`Pastamancer`);

export const WeaponDamageQuest: Quest = {
  name: "Weapon Damage",
  completed: () => CommunityService.WeaponDamage.isDone(),
  tasks: [
    {
      name: "Potion of Potency",
      ready: () => have($item`orange`) && have($item`scrumptious reagent`),
      completed: () =>
        have($item`potion of potency`) ||
        have($effect`Pronounced Potency`) ||
        !have($item`scrumptious reagent`),
      do: () => create($item`potion of potency`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Boombox Punchin'",
      completed: () =>
        SongBoom.song() === "These Fists Were Made for Punchin'" || !have($item`SongBoom™ BoomBox`),
      do: () => SongBoom.setSong("These Fists Were Made for Punchin'"),
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
      name: "Glob of Melted Wax",
      completed: () => !have($item`glob of melted wax`) || have($item`wax hand`),
      do: (): void => {
        create($item`wax hand`, 1);
        visitUrl("main.php");
      },
      limit: { tries: 1 },
    },
    {
      name: "Ungulith Shower",
      completed: () => have($item`corrupted marrow`) || have($effect`Cowrruption`),
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
        weapon: $item`Fourth of May Cosplay Saber`,
        familiar:
          get("camelSpit") >= 100
            ? $familiar`Melodramedary`
            : $effects`Do You Crush What I Crush?, Holiday Yoked, Let It Snow/Boil/Stink/Frighten/Grease, All I Want For Crimbo Is Stuff, Crimbo Wrapping`.some(
                (ef) => !have(ef)
              )
            ? $familiar`Ghost of Crimbo Carols`
            : chooseFamiliar(false),
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Meteor Shower`)
          .trySkill($skill`%fn, spit on me!`)
          .trySkill($skill`Use the Force`)
          .trySkill($skill`Feel Envy`)
          .abort()
      ),
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
        shrugAT();
        const usefulEffects: Effect[] = [
          $effect`Billiards Belligerence`,
          $effect`Bow-Legged Swagger`,
          $effect`Carol of the Bulls`,
          $effect`Cowrruption`,
          $effect`Destructive Resolve`,
          $effect`Disdain of the War Snapper`,
          $effect`Faboooo`,
          $effect`Feeling Punchy`,
          $effect`Frenzied, Bloody`,
          $effect`Imported Strength`,
          $effect`Jackasses' Symphony of Destruction`,
          $effect`Lack of Body-Building`,
          $effect`Pronounced Potency`,
          $effect`Rage of the Reindeer`,
          $effect`Seeing Red`,
          $effect`Scowl of the Auk`,
          $effect`Song of the North`,
          $effect`Tenacity of the Snapper`,
          $effect`The Power of LOV`,
          $effect`Wasabi With You`,
          // $effect`Weapon of Mass Destruction`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (
          get("yourFavoriteBirdMods").includes("Weapon Damage Percent") &&
          checkValue(
            "Favorite Bird",
            Math.min(4, Math.max(0, CommunityService.WeaponDamage.actualCost()))
          )
        )
          useSkill($skill`Visit your Favorite Bird`);

        $effects`Spit Upon, Pyramid Power, Outer Wolf™`.forEach((ef) => {
          if (
            checkValue(
              $item`pocket wish`,
              checkTurnSave("WeaponDamage", ef) + CommunityService.SpellDamage.turnsSavedBy(ef)
            )
          )
            wishFor(ef);
        });

        if (checkValue("Cargo", checkTurnSave("WeaponDamage", $effect`Rictus of Yeg`))) {
          visitUrl("inventory.php?action=pocket");
          visitUrl("choice.php?whichchoice=1420&option=1&pocket=284");
        }

        if (
          args.experimentalsynth &&
          CommunityService.WeaponDamage.actualCost() > 2 &&
          get("tomeSummons") <= 1 &&
          have($skill`Summon Sugar Sheets`)
        ) {
          if (!have($item`sugar sheet`) && !have($item`sugar shank`))
            useSkill($skill`Summon Sugar Sheets`, 1);
          if (!have($item`sugar shank`)) create($item`sugar shank`);
        }

        if (
          have($item`Ye Wizard's Shack snack voucher`) &&
          !forbiddenEffects.includes($effect`Wasabi With You`) &&
          CommunityService.WeaponDamage.turnsSavedBy($effect`Wasabi With You`) > 2
        )
          retrieveItem($item`wasabi marble soda`);

        if (
          CommunityService.WeaponDamage.turnsSavedBy($effect`Weapon of Mass Destruction`) >= 2 &&
          !get("_madTeaParty")
        ) {
          if (!have($item`goofily-plumed helmet`)) buy($item`goofily-plumed helmet`, 1);
          tryAcquiringEffect($effect`Weapon of Mass Destruction`);
        }
      },
      completed: () => CommunityService.WeaponDamage.isDone(),
      do: (): void => {
        const maxTurns = args.weaponlimit;
        const testTurns = CommunityService.WeaponDamage.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        CommunityService.WeaponDamage.run(
          () => logTestSetup(CommunityService.WeaponDamage),
          maxTurns
        );
      },
      outfit: {
        // eslint-disable-next-line libram/verify-constants
        weapon:
          have($item`legendary seal-clubbing club`) && myLevel() >= 17
            ? $item`legendary seal-clubbing club`
            : canesword
            ? $item`candy cane sword cane`
            : undefined,
        offhand: stickknife() ? $item`Stick-Knife of Loathing` : undefined,
        modifier: "weapon dmg, weapon dmg percent, switch disembodied hand, -switch left-hand man",
      },
      post: () => shrugAT(),
      limit: { tries: 1 },
    },
  ],
};
