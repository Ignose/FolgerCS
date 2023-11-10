import { Quest } from "../engine/task";
import {
  adv1,
  autosell,
  buy,
  cliExecute,
  create,
  drink,
  Effect,
  equip,
  faxbot,
  hermit,
  inebrietyLimit,
  itemAmount,
  myClass,
  myInebriety,
  myMaxhp,
  myMeat,
  print,
  restoreHp,
  restoreMp,
  retrieveItem,
  runChoice,
  sweetSynthesis,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $effect,
  $effects,
  $familiar,
  $item,
  $location,
  $monster,
  $skill,
  $slot,
  clamp,
  CombatLoversLocket,
  CommunityService,
  DaylightShavings,
  get,
  have,
  uneffect,
  withChoice,
} from "libram";
import {
  checkLocketAvailable,
  checkTurnSave,
  checkValue,
  forbiddenEffects,
  fuelUp,
  logTestSetup,
  shouldFeelLost,
  tryAcquiringEffect,
  wishFor,
} from "../lib";
import { chooseFamiliar, sugarItemsAboutToBreak } from "../engine/outfit";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro, { haveFreeBanish } from "../combat";
import { drive } from "libram/dist/resources/2017/AsdonMartin";
import { args } from "../args";

function wishOrSpleen(): boolean {
  if (
    (checkTurnSave("BoozeDrop", $effect`Infernal Thirst`) -
      checkTurnSave("BoozeDrop", $effect`Synthesis: Collection`)) *
      get("valueOfAdventure", 4000) -
      50000 +
      get("valueOfAdventure", 4000) * 2 * get("garbo_embezzlerMultiplier", 2.5) >
    0
  )
    return true;
  return false;
}

export const BoozeDropQuest: Quest = {
  name: "Booze Drop",
  completed: () => CommunityService.BoozeDrop.isDone(),
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
      name: "Acquire Clover",
      completed: () =>
        have($item`11-leaf clover`) || get("_cloversPurchased") >= 2 || args.savecyclops,
      do: (): void => {
        buy(1, $item`chewing gum on a string`);
        use(1, $item`chewing gum on a string`);
        hermit($item`11-leaf clover`, 1);
      },
      limit: { tries: 50 },
    },
    {
      name: "Get Cyclops Eyedrops",
      completed: () => have($item`cyclops eyedrops`) || have($effect`One Very Clear Eye`),
      do: (): void => {
        if (!have($effect`Lucky!`)) use($item`11-leaf clover`);
        if (!have($item`cyclops eyedrops`)) adv1($location`The Limerick Dungeon`, -1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Acquire Government",
      completed: () =>
        !have($item`government cheese`) || get("lastAnticheeseDay") > 0 || args.savegovernment,
      do: (): void => {
        if (myMeat() >= 15000) retrieveItem($item`Desert Bus pass`);
        if (!have($item`Desert Bus pass`) && !have($item`bitchin' meatcar`)) {
          autosell($item`government cheese`, itemAmount($item`government cheese`));
          return;
        }
        visitUrl("place.php?whichplace=desertbeach&action=db_nukehouse");
        retrieveItem($item`government`);
      },
      limit: { tries: 1 },
    },
    {
      name: "Item Buff if Feeling Lost",
      ready: () => shouldFeelLost(),
      prepare: (): void => {
        restoreHp(clamp(1000, myMaxhp() / 2, myMaxhp()));
        restoreMp(50);
      },
      completed: () =>
        (!have($familiar`Ghost of Crimbo Carols`) &&
          !have($item`cosmic bowling ball`) &&
          !have($item`vampyric cloake`)) ||
        !haveFreeBanish() ||
        $effects`Cosmic Ball in the Air, Do You Crush What I Crush?, Bat-Adjacent Form`.some((ef) =>
          have(ef)
        ),
      do: $location`The Dire Warren`,
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .trySkill($skill`Use the Force`)
          .banish()
          .abort()
      ),
      outfit: {
        offhand: $item`latte lovers member's mug`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Lil' Doctor™ bag`,
        familiar: $familiar`Ghost of Crimbo Carols`,
        famequip: $item.none,
      },
      limit: { tries: 5 },
    },
    {
      name: "Fax Ungulith",
      completed: () =>
        have($item`corrupted marrow`) || have($effect`Cowrruption`) || shouldFeelLost(),
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
        hat:
          DaylightShavings.nextBuff() === $effect`Musician's Musician's Moustache` &&
          !DaylightShavings.hasBuff() &&
          have($item`Daylight Shavings Helmet`)
            ? $item`Daylight Shavings Helmet`
            : undefined,
        back: $item`vampyric cloake`,
        weapon: $item`Fourth of May Cosplay Saber`,
        offhand: have($skill`Double-Fisted Skull Smashing`)
          ? $item`industrial fire extinguisher`
          : undefined,
        familiar: chooseFamiliar(false),
        modifier: "myst",
        avoid: sugarItemsAboutToBreak(),
      }),
      choices: { 1387: 3 },
      combat: new CombatStrategy().macro(
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .trySkill($skill`Fire Extinguisher: Polar Vortex`)
          .trySkill($skill`Use the Force`)
          .default()
      ),
      limit: { tries: 5 },
    },
    {
      name: "Drink Sacramento Wine",
      completed: () =>
        have($effect`Sacré Mental`) ||
        !have($item`Sacramento wine`) ||
        myInebriety() >= inebrietyLimit() ||
        args.sacramentowine,
      do: (): void => {
        if (myInebriety() < inebrietyLimit()) {
          tryAcquiringEffect($effect`Ode to Booze`);
          drink($item`Sacramento wine`, 1);
          uneffect($effect`Ode to Booze`);
        }
      },
      limit: { tries: 1 },
    },
    {
      name: "Pumpkin Juice",
      completed: () =>
        have($effect`Juiced and Jacked`) ||
        (!have($item`pumpkin`) && !have($item`pumpkin juice`)) ||
        args.savepumpkin,
      do: (): void => {
        if (!have($item`pumpkin juice`)) create($item`pumpkin juice`, 1);
        use($item`pumpkin juice`, 1);
      },
      limit: { tries: 1 },
    },
    {
      name: "Loathing Idol Microphone",
      ready: () => checkValue("2002", 3),
      completed: () =>
        have($effect`Spitting Rhymes`) ||
        !have($item`2002 Mr. Store Catalog`) ||
        forbiddenEffects.includes($effect`Spitting Rhymes`),
      do: (): void => {
        if (
          !have($item`Loathing Idol Microphone`) &&
          !have($item`Loathing Idol Microphone (75% charged)`) &&
          !have($item`Loathing Idol Microphone (50% charged)`) &&
          !have($item`Loathing Idol Microphone (25% charged)`)
        ) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);
        }
        withChoice(1505, 3, () =>
          use(
            have($item`Loathing Idol Microphone`)
              ? $item`Loathing Idol Microphone`
              : have($item`Loathing Idol Microphone (75% charged)`)
              ? $item`Loathing Idol Microphone (75% charged)`
              : have($item`Loathing Idol Microphone (50% charged)`)
              ? $item`Loathing Idol Microphone (50% charged)`
              : $item`Loathing Idol Microphone (25% charged)`
          )
        );
      },
      limit: { tries: 1 },
    },
    {
      name: "Red-soled high heels",
      ready: () => checkValue("2002", 3),
      completed: () => have($item`red-soled high heels`) || !have($item`2002 Mr. Store Catalog`),
      do: (): void => {
        if (!have($item`Letter from Carrie Bradshaw`)) {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Letter from Carrie Bradshaw`);
        }
        withChoice(1506, 3, () => use($item`Letter from Carrie Bradshaw`));
      },
      limit: { tries: 1 },
    },
    {
      name: "Favorite Bird (Item)",
      completed: () =>
        !have($skill`Visit your Favorite Bird`) ||
        get("_favoriteBirdVisited") ||
        !get("yourFavoriteBirdMods").includes("Item Drops"),
      do: () => useSkill($skill`Visit your Favorite Bird`),
      limit: { tries: 1 },
    },
    {
      name: "Buy Oversized Sparkler",
      ready: () => myMeat() >= 1000,
      completed: () => have($item`oversized sparkler`),
      do: () => buy($item`oversized sparkler`, 1),
      limit: { tries: 1 },
    },
    {
      name: "Feeling Lost",
      ready: () => shouldFeelLost(),
      completed: () => have($effect`Feeling Lost`),
      do: () => useSkill($skill`Feel Lost`),
      limit: { tries: 1 },
    },
    {
      name: "Driving Observantly",
      ready: () => args.asdon,
      completed: () => have($effect`Driving Observantly`),
      do: (): void => {
        fuelUp(), drive($effect`Driving Observantly`);
      },
      limit: { tries: 3 },
    },
    {
      name: "Test",
      prepare: (): void => {
        const usefulEffects: Effect[] = [
          $effect`Blessing of the Bird`,
          $effect`Crunching Leaves`,
          $effect`Fat Leon's Phat Loot Lyric`,
          // $effect`Feeling Lost`,
          $effect`Fortunate Resolve`,
          $effect`Heart of Lavender`,
          $effect`I See Everything Thrice!`,
          $effect`items.enh`,
          $effect`Joyful Resolve`,
          $effect`Shadow Waters`,
          $effect`Nearly All-Natural`,
          $effect`The Spirit of Taking`,
          $effect`Singer's Faithful Ocelot`,
          $effect`Steely-Eyed Squint`,
          $effect`Uncucumbered`,
          $effect`One Very Clear Eye`,
        ];
        usefulEffects.forEach((ef) => tryAcquiringEffect(ef, true));

        if (have($familiar`Trick-or-Treating Tot`) && have($item`li'l ninja costume`)) {
          useFamiliar($familiar`Trick-or-Treating Tot`);
          equip($slot`familiar`, $item`li'l ninja costume`);
        }

        if (
          !wishOrSpleen() &&
          checkValue("Spleen", checkTurnSave("BoozeDrop", $effect`Synthesis: Collection`)) &&
          ((have($item`sugar shank`) && get("tomeSummons") <= 2) || get("tomeSummons") <= 1) &&
          have($skill`Summon Sugar Sheets`)
        ) {
          if (!have($item`sugar sheet`)) useSkill($skill`Summon Sugar Sheets`, 1);
          if (!have($item`sugar shank`)) create($item`sugar shank`);
          if (!have($item`sugar sheet`)) useSkill($skill`Summon Sugar Sheets`, 1);
          sweetSynthesis($item`sugar shank`, $item`sugar sheet`);
        }

        if (
          checkValue("August Scepter", checkTurnSave("BoozeDrop", $effect`Incredibly Well Lit`)) ||
          (CommunityService.WeaponDamage.isDone() &&
            checkTurnSave("BoozeDrop", $effect`Incredibly Well Lit`) > 1)
        )
          tryAcquiringEffect($effect`Incredibly Well Lit`);

        if (
          checkValue(
            $item`battery (lantern)`,
            checkTurnSave("BoozeDrop", $effect`Lantern-Charged`) +
              (!CommunityService.SpellDamage.isDone()
                ? checkTurnSave("SpellDamage", $effect`Lantern-Charged`)
                : 0)
          )
        ) {
          if (itemAmount($item`battery (AAA)`) >= 5) create($item`battery (lantern)`, 1);
          use($item`battery (lantern)`, 1);
        }

        if (
          have($item`Deck of Every Card`) &&
          get("_deckCardsDrawn") <= 10 &&
          checkValue("Deck Cheat", checkTurnSave("BoozeDrop", $effect`Fortune of the Wheel`))
        )
          cliExecute("cheat fortune");

        if (checkValue($item`pocket wish`, checkTurnSave("BoozeDrop", $effect`Infernal Thirst`)))
          wishFor($effect`Infernal Thirst`);
      },
      completed: () => CommunityService.BoozeDrop.isDone(),
      do: (): void => {
        const maxTurns = args.boozelimit;
        const testTurns = CommunityService.BoozeDrop.actualCost();
        if (testTurns > maxTurns) {
          print(`Expected to take ${testTurns}, which is more than ${maxTurns}.`, "red");
          print("Either there was a bug, or you are under-prepared for this test", "red");
          print("Manually complete the test if you think this is fine.", "red");
          print("You may also increase the turn limit in the relay", "red");
        }
        CommunityService.BoozeDrop.run(() => logTestSetup(CommunityService.BoozeDrop), maxTurns);
      },
      outfit: {
        modifier:
          "1 Item Drop, 2 Booze Drop, -equip broken champagne bottle, switch disembodied hand, -switch left-hand man",
      },
      limit: { tries: 1 },
    },
  ],
};
