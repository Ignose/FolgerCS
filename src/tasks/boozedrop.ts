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
  hermit,
  inebrietyLimit,
  itemAmount,
  myInebriety,
  myMeat,
  print,
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
  $familiar,
  $item,
  $items,
  $location,
  $skill,
  $slot,
  AprilingBandHelmet,
  CommunityService,
  get,
  getKramcoWandererChance,
  have,
  MayamCalendar,
  uneffect,
  unequip,
  withChoice,
} from "libram";
import {
  checkTurnSave,
  checkValue,
  forbiddenEffects,
  logTestSetup,
  tryAcquiringEffect,
  useLoathingIdol,
  wishFor,
} from "../lib";
import { CombatStrategy } from "grimoire-kolmafia";
import Macro from "../combat";
import { drive } from "libram/dist/resources/2017/AsdonMartin";
import { args } from "../args";

function wishOrSpleen(): boolean {
  const actual = CommunityService.BoozeDrop.actualCost();
  const benefit = actual > 10 ? Math.min(actual - 10, 4) : 0;
  const boombox = have($item`SongBoom™ BoomBox`) ? 25 : 0;
  const spleen = Math.max(3 * (250 + boombox) * 30, get("valueOfAdventure") * 2.5);
  const wish = get("prAlways") ? (500 + boombox) * 2 * 30 : 275 * 2 * 30 - (benefit * get("valueOfAdventure"));
  return wish > spleen;
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
      name: "Apriling Band Booze",
      completed: () => !AprilingBandHelmet.have() || have($effect`Apriling Band Celebration Bop`),
      do: () => AprilingBandHelmet.conduct($effect`Apriling Band Celebration Bop`),
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
      completed: () =>
        have($item`cyclops eyedrops`) || have($effect`One Very Clear Eye`) || args.savecyclops,
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
      name: "Item Buff",
      completed: () =>
        !have($item`cosmic bowling ball`) ||
        have($effect`Cosmic Ball in the Air`) ||
        have($effect`Bat-Adjacent Form`),
      do: $location`The Neverending Party`,
      combat: new CombatStrategy().macro(Macro.itemDrop()),
      outfit: {
        back: $item`vampyric cloake`,
        offhand:
          getKramcoWandererChance() >= 1.0
            ? $item`Kramco Sausage-o-Matic™`
            : $item`latte lovers member's mug`,
        acc1: $item`Kremlin's Greatest Briefcase`,
        acc2: $item`Lil' Doctor™ bag`,
        acc3: $item`spring shoes`,
        familiar: $familiar`Pair of Stomping Boots`,
      },
      post: () => useFamiliar($familiar`Left-Hand Man`),
      limit: { tries: 1 },
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
      ready: () =>
        checkValue($item`pumpkin`, checkTurnSave("BoozeDrop", $effect`Juiced and Jacked`)),
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
        forbiddenEffects.includes($effect`Spitting Rhymes`) ||
        get("availableMrStore2002Credits") === 0,
      do: (): void => {
          buy($coinmaster`Mr. Store 2002`, 1, $item`Loathing Idol Microphone`);
        withChoice(1505, 3, () => useLoathingIdol());
      },
      limit: { tries: 1 },
    },
    {
      name: "Red-soled high heels",
      ready: () => checkValue("2002", 3),
      completed: () => have($item`red-soled high heels`) || !have($item`2002 Mr. Store Catalog`) ||
      get("availableMrStore2002Credits") === 0,
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
      completed: () => have($effect`Feeling Lost`) || !have($skill`Feel Lost`),
      do: () => useSkill($skill`Feel Lost`),
      limit: { tries: 1 },
    },
    {
      name: "Contemplate Sauce",
      prepare: () => equip($item`April Shower Thoughts shield`),
      completed: () => have($effect`Lubricating Sauce`),
      do: () => useSkill($skill`Sauce Contemplation`),
      post: () => unequip($item`April Shower Thoughts shield`),
      limit: { tries: 1 },
    },
    {
      name: "Driving Observantly",
      ready: () => args.asdon,
      completed: () => have($effect`Driving Observantly`),
      do: (): void => {
        drive($effect`Driving Observantly`);
      },
      limit: { tries: 3 },
    },
    {
      name: "Mayam",
      ready: () => MayamCalendar.have(),
      completed: () => have($effect`Big Eyes`),
      do: (): void => {
        MayamCalendar.submit("eye meat eyepatch yam4");
      },
      limit: { tries: 1 },
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

        if (CommunityService.BoozeDrop.actualCost() > 1)
          tryAcquiringEffect($effect`Incredibly Well Lit`);

        if (
          checkValue($item`battery (lantern)`, checkTurnSave("BoozeDrop", $effect`Lantern-Charged`))
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

          if (CommunityService.BoozeDrop.actualCost() > 1) {
            if (
              wishOrSpleen() &&
              ((have($item`sugar shank`) && get("tomeSummons") <= 2) || get("tomeSummons") <= 1) &&
              have($skill`Summon Sugar Sheets`)
            ) {
              if (!have($item`sugar sheet`)) useSkill($skill`Summon Sugar Sheets`, 1);
              if (!have($item`sugar shank`)) create($item`sugar shank`);
              if (!have($item`sugar sheet`)) useSkill($skill`Summon Sugar Sheets`, 1);
              sweetSynthesis($item`sugar shank`, $item`sugar sheet`);
            }
          }

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
        avoid: $items`surprisingly capacious handbag`,
        modifier:
          "1 Item Drop, 2 Booze Drop, -equip broken champagne bottle, switch disembodied hand, switch left-hand man",
      },
      limit: { tries: 1 },
    },
  ],
};
