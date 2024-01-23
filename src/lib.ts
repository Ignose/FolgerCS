import {
  autosell,
  availableAmount,
  buy,
  cliExecute,
  create,
  Effect,
  equip,
  equippedItem,
  getCampground,
  getClanName,
  getProperty,
  haveEffect,
  haveEquipped,
  holiday,
  Item,
  itemAmount,
  mallPrice,
  monkeyPaw,
  mpCost,
  myBasestat,
  myBuffedstat,
  myClass,
  myLevel,
  myMaxhp,
  myMeat,
  myMp,
  myPrimestat,
  print,
  restoreMp,
  retrieveItem,
  retrievePrice,
  Skill,
  Stat,
  storageAmount,
  sweetSynthesis,
  toEffect,
  toInt,
  toItem,
  toSkill,
  toStat,
  use,
  useSkill,
  //useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $effect,
  $familiar,
  $item,
  $items,
  $monster,
  $skill,
  $skills,
  $slot,
  $stat,
  canRememberSong,
  CombatLoversLocket,
  CommunityService,
  get,
  getKramcoWandererChance,
  have,
  haveInCampground,
  maxBy,
  RetroCape,
  set,
  SongBoom,
  sumNumbers,
  Witchess,
} from "libram";
import { printModtrace } from "libram/dist/modifier";
import { mainStat } from "./combat";
import { args } from "./args";

export const startingClan = getClanName();

export const bestSIT =
  mallPrice($item`hollow rock`) + mallPrice($item`lump of loyal latite`) >
  mallPrice($item`flapper fly`) + mallPrice($item`filled mosquito`)
    ? 1
    : 2;

export const testModifiers = new Map([
  [CommunityService.HP, ["Maximum HP", "Maximum HP Percent", "Muscle", "Muscle Percent"]],
  [CommunityService.Muscle, ["Muscle", "Muscle Percent"]],
  [CommunityService.Mysticality, ["Mysticality", "Mysticality Percent"]],
  [CommunityService.Moxie, ["Moxie", "Moxie Percent"]],
  [CommunityService.FamiliarWeight, ["Familiar Weight"]],
  [CommunityService.WeaponDamage, ["Weapon Damage", "Weapon Damage Percent"]],
  [CommunityService.SpellDamage, ["Spell Damage", "Spell Damage Percent"]],
  [CommunityService.Noncombat, ["Combat Rate"]],
  [CommunityService.BoozeDrop, ["Item Drop", "Booze Drop"]],
  [CommunityService.HotRes, ["Hot Resistance"]],
  [CommunityService.CoilWire, []],
]);

/*export function checkGithubVersion(): void {
  const gitBranches: { name: string; commit: { sha: string } }[] = JSON.parse(
    visitUrl(`https://github.com/Ignose/InstantSCCS_Ignose`)
  );
  const releaseBranch = gitBranches.find((branchInfo) => branchInfo.name === "release");
  const releaseSHA = releaseBranch?.commit.sha ?? "Not Found";
  const localBranch = gitInfo("Ignose");
  const localSHA = localBranch.commit;
  if (releaseSHA === localSHA) {
    print("InstantSCCS is up to date!", "green");
  } else {
    print(
      `InstantSCCS is out of date - your version was last updated on ${localBranch.last_changed_date}.`,
      "red"
    );
    print("Please run 'git update'!", "red");
    print(`Local Version: ${localSHA}.`);
    print(`Release Version: ${releaseSHA}`);
  }
}*/

const baseBoozes = $items`bottle of rum, boxed wine, bottle of gin, bottle of vodka, bottle of tequila, bottle of whiskey`;

export function sellMiscellaneousItems(): void {
  const items: Item[] = [
    $item`cardboard ore`,
    $item`hot buttered roll`,
    $item`toast`,
    $item`meat paste`,
    $item`meat stack`,
    $item`jar of swamp honey`,
    $item`turtle voicebox`,
    $item`grody jug`,
    $item`gas can`,
    $item`Middle of the Road™ brand whiskey`,
    $item`neverending wallet chain`,
    $item`pentagram bandana`,
    $item`denim jacket`,
    $item`ratty knitted cap`,
    $item`jam band bootleg`,
    $item`Purple Beast energy drink`,
    $item`cosmetic football`,
    $item`shoe ad T-shirt`,
    $item`pump-up high-tops`,
    $item`noticeable pumps`,
    $item`surprisingly capacious handbag`,
    $item`electronics kit`,
    $item`PB&J with the crusts cut off`,
    $item`dorky glasses`,
    $item`ponytail clip`,
    $item`paint palette`,
    $item`fat stacks of cash`,
    $item`bowl of cottage cheese`,
    $item`Arrow (+1)`,
    $item`red red wine`,
    $item`Red X Shield`,
    $item`hot nuggets`,
    $item`red rum`,
    $item`red book`,
    ...baseBoozes,
  ];
  items.forEach((it) => {
    if (itemAmount(it) > 1) autosell(it, itemAmount(it) - 1);
  });
}

export function computeHotRes(sim: boolean): number {
  const cloake = have($item`vampyric cloake`) ? 2 : 0;
  const retro = RetroCape.have() ? 3 : 0;
  const foam =
    have($item`Fourth of May Cosplay Saber`) &&
    have($item`industrial fire extinguisher`) &&
    have($skill`Double-Fisted Skull Smashing`)
      ? 30
      : 0;
  const factory = !args.factoryworker ? 9 : 0;
  const horse = get("horseryAvailable") ? 1 : 0;
  const meteor = have($skill`Meteor Shower`) ? 5 : 0;
  const bird = get("yourFavoriteBirdMods").includes("Hot Resistance") ? 4 : 0;
  const amazing = sim ? 4 : 0;
  const astral = have($skill`Astral Shell`) ? 1 : 0;
  const egged = have($familiar`Rockin' Robin`) && camelFightsLeft() >= 44 ? 3 : 0;
  const sphere = have($skill`Elemental Saucesphere`) ? 2 : 0;
  const peaceful = have($skill`Feel Peaceful`) ? 2 : 0;

  const bond = have($skill`Blood Bond`) ? 5 : 0;
  const empathy = have($skill`Empathy of the Newt`) ? 5 : 0;
  const leash = have($skill`Leash of Linguini`) ? 5 : 0;
  const famWt = sumNumbers([bond, empathy, leash]);
  const parrot =
    have($familiar`Exotic Parrot`) && famWt >= 15 ? 2 : have($familiar`Exotic Parrot`) ? 1 : 0;

  const extingo = have($item`industrial fire extinguisher`) ? 3 : 0;
  const shield = have($skill`Meteor Shower`) ? 3 : 0;
  const parka = have($item`Jurassic Parka`) ? 3 : 0;
  const sweatpants = have($item`designer sweatpants`) ? 1 : 0;
  const paw = have($item`cursed monkey's paw`) ? 2 : 0;
  const crimbo = have($skill`Crimbo Training: Coal Taster`) ? 1 : 0;
  const asbestos = have($skill`Asbestos Heart`) ? 3 : 0;
  const tolerance = have($skill`Tolerance of the Kitchen`) ? 2 : 0;

  const all = sumNumbers([
    cloake,
    retro,
    shield,
    foam,
    factory,
    horse,
    meteor,
    bird,
    amazing,
    astral,
    egged,
    sphere,
    peaceful,
    parrot,
    extingo,
    parka,
    sweatpants,
    paw,
    crimbo,
    asbestos,
    tolerance,
  ]);

  const addWish = all <= 51 ? 9 : 0;

  return Math.max(1, 60 - (all + addWish));
}

export function computeWeaponDamage(sim: boolean): number {
  const meteor = have($skill`Meteor Shower`) && have($item`Fourth of May Cosplay Saber`) ? 200 : 0;
  const claws = have($skill`Claws of the Walrus`) ? 7 : 0;
  const wrath = have($skill`Wrath of the Wolverine`) ? 5 : 0;
  const seething =
    myClass() === $class`Seal Clubber` && have($skill`Seething of the Snow Leopard`) ? 10 : 0;
  const jackass = have($skill`Jackasses' Symphony of Destruction`) ? 12 : 0;
  const rage = have($skill`Rage of the Reindeer`) ? 10 : 0;
  const tenacity = have($skill`Tenacity of the Snapper`) ? 8 : 0;
  const belligerence = have($item`Clan VIP Lounge key`) ? 50 : 0;
  const bulls = have($skill`Carol of the Bulls`) ? 100 : 0;
  const snapper = have($skill`Blessing of the War Snapper`) ? 5 : 0;
  const punchy = have($item`SongBoom™ BoomBox`) ? 64 : 0;
  const frenzy = have($skill`Blood Frenzy`) ? 50 : 0;
  const scowl = have($skill`Scowl of the Auk`) ? 10 : 0;
  const bird = get("yourFavoriteBirdMods").includes("Weapon Damage Percent") ? 100 : 0;
  const seeing = !args.redskeleton ? 125 : 0;
  const cowrupt = 200; //Ungulith/seeing red. Can't be skipped.
  const imported = have($skill`Map the Monsters`) && get("ownsSpeakeasy") ? 50 : 0;
  const beach = have($item`Beach Comb`) ? 25 : 0;
  const camel = (get("camelSpit") / 3.33) * camelFightsLeft() >= 100 ? 100 : 0;
  const lov = get("loveTunnelAvailable") ? 50 : 0;
  const vote = myClass() === $class`Pastamancer` && get("voteAlways") ? 200 : 0;
  const carol = have($familiar`Ghost of Crimbo Carols`) ? 100 : 0;
  const elf = have($familiar`Machine Elf`) ? 100 : 0;
  const effects = sumNumbers([
    meteor,
    claws,
    wrath,
    seething,
    jackass,
    rage,
    tenacity,
    belligerence,
    bulls,
    snapper,
    punchy,
    frenzy,
    scowl,
    bird,
    seeing,
    cowrupt,
    imported,
    beach,
    camel,
    lov,
    vote,
    carol,
    elf,
  ]);

  const hat = have($item`Crown of Thrones`) ? 10 : have($item`seal-skull helmet`) ? 1 : 0;
  const shirt = 0;
  // eslint-disable-next-line libram/verify-constants
  const mainhand = have($item`candy cane sword cane`)
    ? 165
    : have($item`SpinMaster™ lathe`)
    ? 115
    : 65;
  // eslint-disable-next-line libram/verify-constants
  const offhand =
    // eslint-disable-next-line libram/verify-constants
    have($item`SpinMaster™ lathe`) && have($item`candy cane sword cane`) ? 115 : 50;

  const brogues = have($item`Bastille Battalion control rig`) ? 50 : 0;
  const glove = have($item`Powerful Glove`) ? 25 : 0;
  const kgb = have($item`Kremlin's Greatest Briefcase`) ? 25 : 0;
  const meteorite =
    sim && have($item`meteorite necklace`) ? 200 : have($item`meteorite necklace`) ? 200 : 0;
  const accessory = sumNumbers([brogues, glove, kgb, meteorite]);

  const familiar =
    have($familiar`Disembodied Hand`) &&
    // eslint-disable-next-line libram/verify-constants
    have($item`candy cane sword cane`) &&
    have($item`Stick-Knife of Loathing`) &&
    have($item`SpinMaster™ lathe`)
      ? 115
      : have($familiar`Disembodied Hand`)
      ? 65
      : have($familiar`Left-Hand Man`)
      ? 50
      : 0;

  const goodWeapons = sim ? 65 : 0;
  const equips = sumNumbers([hat, shirt, mainhand, offhand, accessory, familiar, goodWeapons]);

  const wDmgNumber = sumNumbers([equips, effects]);

  return Math.max(1, Math.floor(60 - wDmgNumber / 25));
}

export function computeSpellDamage(sim: boolean): number {
  const simmer = have($skill`Simmer`) ? 50 : 0; //Simmering adds 100 spelldamage but we're treating it as 50 because it costs a turn.
  const cargo = have($item`Cargo Cultist Shorts`) && computeWeaponDamage(true) >= 1350 ? 4 : 0;
  const carol = have($familiar`Ghost of Crimbo Carols`) ? 100 : 0;
  const meteor = have($skill`Meteor Shower`) && have($item`Fourth of May Cosplay Saber`) ? 200 : 0;
  const elf = have($familiar`Machine Elf`) ? 100 : 0;
  const camel = (get("camelSpit") / 3.33) * camelFightsLeft() >= 100 ? 100 : 0;
  const visions = have($skill`Deep Dark Visions`) ? 50 : 0;
  const eyebrow = have($skill`Arched Eyebrow of the Archmage`) ? 10 : 0;
  const hells = have($skill`Carol of the Hells`) ? 100 : 0;
  const cow = 200; //We can't skip Cowrruption in FolgerCS
  const imported = have($skill`Map the Monsters`) && get("ownsSpeakeasy") ? 50 : 0;
  const jackass = have($skill`Jackasses' Symphony of Destruction`) ? 12 : 0;
  const acueity = have($item`Clan VIP Lounge key`) ? 50 : 0;
  const sauce = have($skill`Song of Sauce`) ? 100 : 0;
  const peppermint = have($skill`Spirit of Peppermint`) ? 10 : 0;
  const lov = get("loveTunnelAvailable") ? 50 : 0;
  const beach = have($item`Beach Comb`) ? 25 : 0;
  const glove = have($item`Powerful Glove`) ? 50 : 0;
  const moonSpoon = have($item`hewn moon-rune spoon`) ? 10 : 0;
  const saucier = have($skill`Master Saucier`) ? 10 : 0;
  const subtle = have($skill`Subtle and Quick to Anger`) ? 10 : 0;
  const calzone = !args.calzone ? 50 : 0;
  const stick = !sim && have($item`Stick-Knife of Loathing`) ? 200 : 0;
  const staff = !sim && have($item`Staff of Simmering Hatred`) ? 200 : 0;
  const candle = !sim && have($item`Abracandalabra`) ? 100 : 0;

  const all = sumNumbers([
    simmer,
    stick,
    cargo,
    carol,
    meteor,
    elf,
    camel,
    staff,
    visions,
    eyebrow,
    hells,
    cow,
    imported,
    jackass,
    acueity,
    sauce,
    peppermint,
    lov,
    beach,
    glove,
    moonSpoon,
    saucier,
    subtle,
    calzone,
    candle,
  ]);

  return Math.max(1, Math.floor(60 - all / 50));
}

export function computeFamiliarWeight(sim: boolean): number {
  const moonSpoon = have($item`hewn moon-rune spoon`) && !args.savemoontune ? 10 : 0;
  const deepDish = args.latedeepdish || !args.deepdish ? 15 : 0;
  const newsPaper = have($familiar`Garbage Fire`) ? 10 : 0;
  const meteor = have($skill`Meteor Shower`) && have($item`Fourth of May Cosplay Saber`) ? 20 : 0;
  const belligerence = have($item`Clan VIP Lounge key`) ? 10 : 0;
  const bond = have($skill`Blood Bond`) ? 5 : 0;
  const comb = have($item`Beach Comb`) ? 5 : 0;
  const empathy = have($skill`Empathy of the Newt`) ? 5 : 0;
  const sympathy = have($skill`Amphibian Sympathy`) ? 5 : 0;
  const heart = have($skill`Summon Candy Heart`) ? 5 : 0;
  const leash = have($skill`Leash of Linguini`) ? 5 : 0;
  const puzzle = Witchess.have() ? toInt(getProperty("puzzleChampBonus")) : 0;
  const robot =
    computeCombatFrequency(false) === -100 &&
    have($familiar`Comma Chameleon`) &&
    (have($skill`Summon Clip Art`) || have($item`box of Familiar Jacks`))
      ? 20
      : 0;
  const shorty = camelFightsLeft() >= 44 || camelFightsLeft() < 34 ? 10 : 0;
  const dsh = have($item`Daylight Shavings Helmet`) ? 5 : 0;
  const scrapbook = have($item`familiar scrapbook`) && newsPaper === 0 ? 5 : 0;
  const saber = have($item`Fourth of May Cosplay Saber`) ? 10 : 0;
  const brogues = have($item`Bastille Battalion control rig`) ? 8 : 0;
  const comma = have($familiar`Comma Chameleon`) && have($skill`Summon Clip Art`) ? 100 : 0;
  const familiar = comma === 0 ? 10 : 0;
  const stillsuit = comma === 0 && have($item`tiny stillsuit`) ? 5 : 0;
  const concierge = have($skill`Crimbo Training: Concierge`) ? 1 : 0;
  const SIT = bestSIT === 1 ? 5 : 0;
  const pants =
    !sim && have($item`repaid diaper`)
      ? 15
      : !sim && have($item`Great Wolf's beastly trousers`)
      ? 10
      : 0;

  return Math.max(
    1,
    Math.floor(
      60 -
        sumNumbers([
          moonSpoon,
          sympathy,
          deepDish,
          newsPaper,
          meteor,
          belligerence,
          bond,
          comb,
          empathy,
          heart,
          leash,
          puzzle,
          robot,
          shorty,
          dsh,
          scrapbook,
          saber,
          brogues,
          concierge,
          comma,
          pants,
          familiar,
          stillsuit,
          SIT,
        ]) /
          5
    )
  );
}

export function computeBoozeDrop(): number {
  const loded = have($item`closed-circuit pay phone`) ? 100 : 0;
  const eyedrops = !args.savecyclops ? 100 : 0;
  const bowling = have($item`cosmic bowling ball`) ? 25 : 0;
  const bat = have($item`vampyric cloake`) ? 50 : 0;
  const microphone =
    have($item`2002 Mr. Store Catalog`) && !forbiddenEffects.includes($effect`Spitting Rhymes`)
      ? 50
      : 0;
  const heels = have($item`2002 Mr. Store Catalog`) ? 50 : 0;
  const bird = get("yourFavoriteBirdMods").includes("Item Drops") ? 40 : 0;
  const sparkler = 20;
  const lost = have($skill`Feel Lost`) ? 60 : 0;
  const crunching = 25;
  const phat = have($skill`Fat Leon's Phat Loot Lyric`) ? 20 : 0;
  const grain = 60;
  const taking = have($skill`The Spirit of Taking`) ? 10 : 0;
  const ocelot = have($skill`Singer's Faithful Ocelot`) ? 10 : 0;
  const citizen = have($familiar`Patriotic Eagle`) ? 30 : 0;
  const synthesis = args.experimentalsynth ? 150 : 0;
  const costume = have($familiar`Trick-or-Treating Tot`) ? 150 : 0;
  const tape = have($item`January's Garbage Tote`) ? 15 : 0;
  const bucket = 25;
  const cincho = have($item`Cincho de Mayo`) ? 45 : 0;
  const observe = have($skill`Powers of Observatiogn`) ? 10 : 0;
  const v2020 = have($skill`20/20 Vision`) ? 10 : 0;
  const madloot = have($skill`Mad Looting Skillz`) ? 20 : 0;
  const guzzlin = have($skill`Always Never Not Guzzling`) ? 25 : 0;
  const crimbo = have($skill`Crimbo Training: Bartender`) ? 15 : 0;
  const lighthouse = have($item`august scepter`) ? 50 : 0;

  const all = sumNumbers([
    loded,
    eyedrops,
    bowling,
    bat,
    microphone,
    heels,
    bird,
    sparkler,
    lost,
    crunching,
    phat,
    grain,
    taking,
    ocelot,
    citizen,
    synthesis,
    costume,
    tape,
    bucket,
    cincho,
    observe,
    v2020,
    madloot,
    guzzlin,
    crimbo,
    lighthouse,
  ]);

  const addWish = all - synthesis <= 780 ? 200 : 0;

  return Math.max(1, Math.floor(60 - (all + addWish) / 15));
}

const famJacksValue = have($familiar`Comma Chameleon`) && !have($skill`Summon Clip Art`) ? 21 : 0;
const greatWolfs = Math.min(2, computeWeaponDamage(false) - 1) + 2;
const stickKnife =
  myPrimestat() === $stat`muscle` ? Math.min(5, computeWeaponDamage(false) - 1) + 4 : 0;
const staff = have($skill`Spirit of Rigatoni`) ? 4 : 0;
const tobikoSoda = have($skill`Summon Alice's Army Cards`) ? 0 : 3;
const meteorite = Math.min(8, computeWeaponDamage(false) - 1) + 4;
const slippers = Math.min(4, 1 + ((-1 * computeCombatFrequency(false)) / 5) * 3);
const chlamys = Math.min(3, ((-1 * computeCombatFrequency(false)) / 5) * 3);

export const pullValue = new Map([
  [$item`box of Familiar Jacks`, famJacksValue],
  [$item`Stick-Knife of Loathing`, stickKnife],
  [$item`Staff of Simmering Hatred`, staff],
  [$item`Buddy Bjorn`, 6.8],
  [$item`meteorite necklace`, meteorite],
  [$item`Great Wolf's beastly trousers`, greatWolfs],
  [$item`repaid diaper`, 3],
  [$item`tobiko marble soda`, tobikoSoda],
  [$item`chalk chlamys`, chlamys],
  [$item`Fuzzy Slippers of Hatred`, slippers],
]);

export function checkPull(item: Item): boolean {
  if (
    get("_roninStoragePulls").split(",").length >= 5 ||
    have(item) ||
    get("_roninStoragePulls").split(",").includes(toInt(item).toString()) ||
    storageAmount(item) === 0 ||
    5 - get("_roninStoragePulls").split(",").length <= args.savepulls
  )
    return true;
  return false;
}

export function findMaxPull(): Item | null {
  let maxItem: Item | null = null;
  let maxValue = -1;

  for (const [item, value] of pullValue) {
    if (checkPull(item)) {
      if (value > maxValue) {
        maxValue = value;
        maxItem = item;
      }
    }
  }

  return maxItem;
}

export const forbiddenEffects: Effect[] = [];

if (args.witchess) forbiddenEffects.push($effect`Puzzle Champ`);
if (args.savesnack) forbiddenEffects.push($effect`Wasabi With You`, $effect`Pisces in the Skyces`);
if (args.savebarrel) forbiddenEffects.push($effect`Warlock, Warstock, and Warbarrel`);
if (args.saveterminal) forbiddenEffects.push($effect`items.enh`, $effect`substats.enh`);
if (args.savecopdollar) forbiddenEffects.push($effect`Gummed Shoes`);
if (args.saveglove) forbiddenEffects.push($effect`Triple-Sized`, $effect`Invisible Avatar`);
if (args.savelimitedat) forbiddenEffects.push($effect`Chorale of Companionship`);
const manuallyExcludedBuffs = args.explicitlyexcludedefs
  .split(",")
  .filter((s) => s.length > 0)
  .map((s) => toEffect(s));
if (manuallyExcludedBuffs !== undefined) {
  manuallyExcludedBuffs.forEach((ef) => {
    forbiddenEffects.push(ef);
  });
}

export function fuelUp(): void {
  buy(1, $item`all-purpose flower`);
  use(23, $item`all-purpose flower`);
  buy(availableAmount($item`wad of dough`), $item`soda water`);
  create(availableAmount($item`wad of dough`), $item`loaf of soda bread`);
  cliExecute(`asdonmartin fuel ${availableAmount($item`loaf of soda bread`)} soda bread`);
}

export function simpleDateDiff(t1: string, t2: string): number {
  // Returns difference in milliseconds
  const yearDiff = toInt(t2.slice(0, 4)) - toInt(t1.slice(0, 4));
  const monthDiff = 12 * yearDiff + toInt(t2.slice(4, 6)) - toInt(t1.slice(4, 6));
  const dayDiff =
    monthDiff * Math.max(toInt(t1.slice(6, 8)), toInt(t2.slice(6, 8))) +
    toInt(t2.slice(6, 8)) -
    toInt(t1.slice(6, 8));
  const hourDiff = 24 * dayDiff + toInt(t2.slice(8, 10)) - toInt(t1.slice(8, 10));
  const minDiff = 60 * hourDiff + toInt(t2.slice(10, 12)) - toInt(t1.slice(10, 12));
  const secDiff = 60 * minDiff + toInt(t2.slice(12, 14)) - toInt(t1.slice(12, 14));
  const msDiff = 1000 * secDiff + toInt(t2.slice(14)) - toInt(t1.slice(14));

  return msDiff;
}

// From phccs
export function convertMilliseconds(milliseconds: number): string {
  const seconds = milliseconds / 1000;
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = Math.round((seconds - minutes * 60) * 1000) / 1000;
  const hours = Math.floor(minutes / 60);
  const minutesLeft = Math.round(minutes - hours * 60);
  return (
    (hours !== 0 ? `${hours} hours, ` : "") +
    (minutesLeft !== 0 ? `${minutesLeft} minutes, ` : "") +
    (secondsLeft !== 0 ? `${secondsLeft} seconds` : "")
  );
}

function logRelevantStats(whichTest: CommunityService): void {
  if (
    [CommunityService.Muscle, CommunityService.Mysticality, CommunityService.Moxie].includes(
      whichTest
    )
  ) {
    const testStat = toStat(whichTest.statName);
    const statString = testStat.toString().slice(0, 3);
    print(
      `Base ${statString}: ${myBasestat(testStat)}; Buffed ${statString}: ${myBuffedstat(testStat)}`
    );
  } else if (whichTest === CommunityService.HP) {
    print(`Buffed Mus: ${myBuffedstat($stat`Muscle`)}; HP: ${myMaxhp()};`);
  }
}

export function logTestSetup(whichTest: CommunityService): void {
  const testTurns = whichTest.actualCost();
  printModtrace(testModifiers.get(whichTest) ?? []);
  logRelevantStats(whichTest);
  print(
    `${whichTest.statName} ${
      whichTest !== CommunityService.CoilWire ? "Test" : ""
    } takes ${testTurns} adventure${testTurns === 1 ? "" : "s"} (predicted: ${
      whichTest.prediction
    }).`,
    "blue"
  );
  set(`_CSTest${whichTest.id}`, testTurns + (have($effect`Simmering`) ? 1 : 0));
}

export function tryAcquiringEffect(ef: Effect, tryRegardless = false): void {
  // Try acquiring an effect
  if (have(ef)) return;
  // If we already have the effect, we're done
  else if (forbiddenEffects.includes(ef)) return; // Don't acquire the effect if we are saving it

  if (ef === $effect`Sparkling Consciousness`) {
    // This has no ef.default for some reason
    if (holiday() === "Dependence Day" && !get("_fireworkUsed") && retrieveItem($item`sparkler`, 1))
      use($item`sparkler`, 1);
    return;
  }
  if (!ef.default) return; // No way to acquire?

  if (ef === $effect`Ode to Booze`) restoreMp(60);
  if (tryRegardless || canAcquireEffect(ef)) {
    const efDefault = ef.default;
    if (efDefault.split(" ")[0] === "cargo") return; // Don't acquire effects with cargo (items are usually way more useful)
    const usePowerfulGlove =
      efDefault.includes("CHEAT CODE") &&
      have($item`Powerful Glove`) &&
      !haveEquipped($item`Powerful Glove`);
    const currentAcc = equippedItem($slot`acc3`);
    if (usePowerfulGlove) equip($slot`acc3`, $item`Powerful Glove`);
    cliExecute(efDefault.replace(/cast 1 /g, "cast "));
    if (usePowerfulGlove) equip($slot`acc3`, currentAcc);
  }
}

export function burnLibram(saveMp: number): void {
  if (availableTomes.length === 0) return;
  while (myMp() >= mpCost(chooseLibram()) + saveMp) {
    useSkill(chooseLibram());
  }
}

export function canAcquireEffect(ef: Effect): boolean {
  // This will not attempt to craft items to acquire the effect, which is the behaviour of ef.default
  // You will need to have the item beforehand for this to return true
  return ef.all
    .map((defaultAction) => {
      if (defaultAction.length === 0) return false; // This effect is not acquirable
      const splitString = defaultAction.split(" ");
      const action = splitString[0];
      const target = splitString.slice(2).join(" ");

      switch (action) {
        case "eat": // We have the food
        case "drink": // We have the booze
        case "chew": // We have the spleen item
        case "use": // We have the item
          if (ef === $effect`Sparkling Consciousness` && get("_fireworkUsed")) return false;
          return have(toItem(target));
        case "cast":
          return have(toSkill(target)) && myMp() >= mpCost(toSkill(target)); // We have the skill and can cast it
        case "cargo":
          return false; // Don't acquire effects with cargo (items are usually way more useful)
        case "synthesize":
          return false; // We currently don't support sweet synthesis
        case "barrelprayer":
          return get("barrelShrineUnlocked") && !get("_barrelPrayer");
        case "witchess":
          return Witchess.have() && get("puzzleChampBonus") >= 20 && !get("_witchessBuff");
        case "telescope":
          return get("telescopeUpgrades") > 0 && !get("telescopeLookedHigh");
        case "beach":
          return have($item`Beach Comb`); // need to check if specific beach head has been taken
        case "spacegate":
          return get("spacegateAlways") && !get("_spacegateVaccine");
        case "pillkeeper":
          return have($item`Eight Days a Week Pill Keeper`);
        case "pool":
          return get("_poolGames") < 3;
        case "swim":
          return !get("_olympicSwimmingPool");
        case "shower":
          return !get("_aprilShower");
        case "terminal":
          return (
            get("_sourceTerminalEnhanceUses") <
            1 +
              get("sourceTerminalChips")
                .split(",")
                .filter((s) => s.includes("CRAM")).length
          );
        case "daycare":
          return get("daycareOpen") && !get("_daycareSpa");
        default:
          return true; // Whatever edge cases we have not handled yet, just try to acquire it
      }
    })
    .some((b) => b);
}

// Adapted from goorbo
const gardens = $items`packet of pumpkin seeds, Peppermint Pip Packet, packet of dragon's teeth, packet of beer seeds, packet of winter seeds, packet of thanksgarden seeds, packet of tall grass seeds, packet of mushroom spores, packet of rock seeds`;
export function getGarden(): Item {
  return gardens.find((it) => it.name in getCampground()) || $item.none;
}

export function wishFor(ef: Effect, useGenie = true): void {
  // Tries to wish for an effect, but does not guarantee it
  if (have(ef)) return;
  if (forbiddenEffects.includes(ef)) return;
  // Genie and Monkey Paw both support wishing for effects
  // However, we can always sell Genie Wishes, so we prioritize using the paw
  // TODO: Use mafia's pref to check if we can still use the paw for wishes

  if (have($item`cursed monkey's paw`) && get("_monkeyPawWishesUsed", 0) < 5) {
    if (monkeyPaw(ef)) return;
  }

  if (have($item`pocket wish`) && useGenie) {
    cliExecute(`genie effect ${ef.name}`);
  }
}

export function computeCombatFrequency(sim: boolean): number {
  const vipHat = have($item`Clan VIP Lounge key`) ? -5 : 0;
  const hat = vipHat;

  const protopack = have($item`protonic accelerator pack`) ? -5 : 0;
  const chlamys = have($item`chalk chlamys`) && !sim ? -5 : 0;
  const back = Math.max(protopack, chlamys);

  const parka = have($item`Jurassic Parka`) ? -5 : 0;
  const shirt = parka;

  const umbrella = have($item`unbreakable umbrella`) ? -10 : 0;
  const offhand = umbrella;

  const pantogram =
    have($item`portable pantogram`) && !get("instant_savePantogram", false) ? -5 : 0;
  const pants = pantogram;

  const kgb =
    have($item`Kremlin's Greatest Briefcase`) && !get("instant_saveKGBClicks", false) ? -5 : 0;
  const atlas = have($item`atlas of local maps`) ? -5 : 0;
  const slippers = have($item`Fuzzy Slippers of Hatred`) && !sim ? -5 : 0;
  const accessories = sumNumbers([kgb, atlas, slippers]);

  const rose = -20;
  const smoothMovements = have($skill`Smooth Movement`) ? -5 : 0;
  const sonata = have($skill`The Sonata of Sneakiness`) ? -5 : 0;
  const favoriteBird =
    have($item`Bird-a-Day calendar`) &&
    get("yourFavoriteBirdMods").includes("Combat Frequency") &&
    !get("instant_saveFavoriteBird", false)
      ? toInt(
          get("yourFavoriteBirdMods")
            .split(", ")
            .filter((s) => s.includes("Combat Frequency"))
            .join("")
            .split(": ")[1]
        )
      : 0;
  const shadowWaters = have($item`closed-circuit pay phone`) ? -10 : 0;
  const powerfulGlove = have($item`Powerful Glove`) && !args.saveglove ? -10 : 0;
  const shoeGum = get("hasDetectiveSchool") && !get("instant_saveCopDollars", false) ? -5 : 0;
  const silentRunning = -5;
  const feelingLonely = have($skill`Feel Lonely`) ? -5 : 0;
  const stub = !sim && have($item`trampled ticket stub`) ? -5 : 0;
  const effects = sumNumbers([
    rose,
    smoothMovements,
    sonata,
    favoriteBird,
    shadowWaters,
    powerfulGlove,
    shoeGum,
    silentRunning,
    feelingLonely,
    stub,
  ]);

  const disgeist = have($familiar`Disgeist`) ? -5 : 0;
  const familiar = disgeist;

  const darkHorse = get("horseryAvailable") ? -5 : 0;
  const others = darkHorse;
  const shades = sim ? -20 : 0;

  const total = sumNumbers([
    hat,
    shirt,
    back,
    offhand,
    pants,
    accessories,
    effects,
    familiar,
    others,
    shades,
  ]);

  return total;
}

export function overlevelled(): boolean {
  return myLevel() >= 20;
}
export const targetBaseMyst = get("instant_targetBaseMyst", 190);
export const targetBaseMystGap = get("instant_targetBaseMystGap", 15);

export const synthExpBuff =
  mainStat === $stat`Muscle`
    ? $effect`Synthesis: Movement`
    : mainStat === $stat`Mysticality`
    ? $effect`Synthesis: Learning`
    : $effect`Synthesis: Style`;

export const complexCandies = $items``.filter((candy) => candy.candyType === "complex");
const peppermintCandiesCosts = new Map<Item, number>([
  [$item`peppermint sprout`, 1],
  [$item`peppermint twist`, 1],
  [$item`peppermint patty`, 2],
  [$item`peppermint crook`, 3],
  [$item`cane-mail pants`, 10],
  [$item`peppermint rhino baby`, 11],
  [$item`cane-mail shirt`, 15],
]);
const nonPeppermintCandies = complexCandies.filter(
  (candy) => !Array.from(peppermintCandiesCosts.keys()).includes(candy)
);

function haveCandies(a: Item, b: Item): boolean {
  const candiesRequired = new Map<Item, number>();
  [a, b].forEach((candy) => {
    const currentAmount = candiesRequired.get(candy) ?? 0;
    if (nonPeppermintCandies.includes(candy)) candiesRequired.set(candy, currentAmount + 1);
    else
      candiesRequired.set(
        $item`peppermint sprout`,
        currentAmount + (peppermintCandiesCosts.get(candy) ?? Infinity)
      );
  });

  candiesRequired.forEach((amount, candy) => {
    candiesRequired.set(candy, itemAmount(candy) >= amount ? 1 : 0);
  });

  return Array.from(candiesRequired.values()).every((val) => val === 1);
}

const rem = mainStat === $stat`Muscle` ? 2 : mainStat === $stat`Mysticality` ? 3 : 4;
const complexCandyPairs = complexCandies
  .map((a, i) => complexCandies.slice(i).map((b) => [a, b]))
  .reduce((acc, val) => acc.concat(val), [])
  .filter(([a, b]) => (toInt(a) + toInt(b)) % 5 === rem);

export function getValidComplexCandyPairs(): Item[][] {
  return complexCandyPairs.filter(([a, b]) => haveCandies(a, b));
}

export function getSynthExpBuff(): void {
  const filteredComplexCandyPairs = getValidComplexCandyPairs();
  if (filteredComplexCandyPairs.length === 0) return;

  const bestPair = filteredComplexCandyPairs.reduce((left, right) =>
    left.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val) <
    right.map((it) => retrievePrice(it)).reduce((acc, val) => acc + val)
      ? left
      : right
  );
  if (bestPair[0] === bestPair[1]) retrieveItem(bestPair[0], 2);
  else bestPair.forEach((it) => retrieveItem(it));
  sweetSynthesis(bestPair[0], bestPair[1]);
}

const allTomes = $skills`Summon Resolutions, Summon Love Song, Summon Candy Heart, Summon Taffy, Summon BRICKOs, Summon Party Favor, Summon Dice`;
const availableTomes = allTomes.filter((tome) => have(tome));
export function chooseLibram(): Skill {
  const needLoveSong =
    have($skill`Summon Love Song`) &&
    itemAmount($item`love song of icy revenge`) +
      Math.floor(haveEffect($effect`Cold Hearted`) / 5) <
      4;
  const needCandyHeart =
    have($skill`Summon Candy Heart`) &&
    ((!have($item`green candy heart`) && !have($effect`Heart of Green`)) ||
      (!have($item`lavender candy heart`) && !have($effect`Heart of Lavender`)));

  if (
    have($skill`Summon Resolutions`) &&
    ((!have($item`resolution: be happier`) && !have($effect`Joyful Resolve`)) ||
      (!have($item`resolution: be feistier`) && !have($effect`Destructive Resolve`)))
  ) {
    return $skill`Summon Resolutions`;
  } else if (needCandyHeart) {
    return $skill`Summon Candy Heart`;
  } else if (needLoveSong) {
    return $skill`Summon Love Song`;
  } else if (
    have($skill`Summon Resolutions`) &&
    !have($item`resolution: be kinder`) &&
    !have($effect`Kindly Resolve`)
  ) {
    return $skill`Summon Resolutions`;
  }
  return availableTomes[0];
}

/*export function burnLibram(saveMp: number): void {
  if (availableTomes.length === 0) return;
  while (myMp() >= mpCost(chooseLibram()) + saveMp) {
    useSkill(chooseLibram());
  }
}*/

export function camelFightsLeft(): number {
  // Only consider those free fights where we can use the camel
  const shadowRift = have($item`closed-circuit pay phone`)
    ? have($effect`Shadow Affinity`)
      ? haveEffect($effect`Shadow Affinity`)
      : get("_shadowAffinityToday")
      ? 11
      : 0
    : 0;
  const snojo = get("snojoAvailable") ? 10 - get("_snojoFreeFights") : 0;
  const NEP = get("neverendingPartyAlways") ? 10 - get("_neverendingPartyFreeTurns") : 0;
  const witchess = Witchess.have() ? 5 - get("_witchessFights") : 0;
  const DMT = have($familiar`Machine Elf`) ? 5 - get("_machineTunnelsAdv") : 0;
  const LOV = get("loveTunnelAvailable") && !get("_loveTunnelToday") ? 3 : 0;
  const olivers = get("ownsSpeakeasy") ? 3 - get("_speakeasyFreeFights", 0) : 0;
  const tentacle = get("_eldritchTentacleFought") ? 1 : 0;
  const sausageGoblin = getKramcoWandererChance() >= 1.0 ? 1 : 0;
  const XRay = have($item`Lil' Doctor™ bag`) ? 3 - get("_chestXRayUsed") : 0;
  const shatteringPunch = have($skill`Shattering Punch`) ? 3 - get("_shatteringPunchUsed") : 0;
  const mobHit = have($skill`Gingerbread Mob Hit`) && !get("_gingerbreadMobHitUsed") ? 1 : 0;
  const locketedWitchess =
    !Witchess.have() &&
    CombatLoversLocket.availableLocketMonsters().includes($monster`Witchess King`) &&
    !CombatLoversLocket.monstersReminisced().includes($monster`Witchess King`) &&
    !args.witchessking
      ? 1
      : 0;
  const backups =
    Witchess.have() || have($item`Kramco Sausage-o-Matic™`)
      ? Math.max(11 - args.savebackups - get("_backUpUses"), 0)
      : 0; // No guarantee that we hit a tentacle, so we ignore that here
  // Currently does not consider gregs (require free banish + free fight source)

  // Include guaranteed non-free fights
  const noveltySkeleton = have($item`cherry`) || CommunityService.CoilWire.isDone() ? 0 : 1;
  // Red skeleton is not guaranteed since we can't guarantee we run out of yellow ray by then

  const leafyBoys = haveInCampground($item`A Guide to Burning Leaves`)
    ? 5 - toInt(get("_leafMonstersFought", 0))
    : 0;

  return sumNumbers([
    shadowRift,
    snojo,
    NEP,
    witchess,
    DMT,
    LOV,
    olivers,
    tentacle,
    sausageGoblin,
    XRay,
    shatteringPunch,
    mobHit,
    locketedWitchess,
    backups,
    noveltySkeleton,
    leafyBoys,
  ]);
}

export function refillLatte(): void {
  if (
    !have($item`latte lovers member's mug`) ||
    !get("_latteDrinkUsed") ||
    get("_latteRefillsUsed") >= 3
  )
    return;

  const lastIngredient = get("latteUnlocks").includes("carrot") ? "carrot" : "pumpkin";
  if (get("_latteRefillsUsed") < 3) cliExecute(`latte refill cinnamon vanilla ${lastIngredient}`);
}

export function statToMaximizerString(stat: Stat): string {
  return stat === $stat`Muscle` ? "mus" : stat === $stat`Mysticality` ? "myst" : "mox";
}

export function shrugAT(): void {
  if (canRememberSong(1)) return;
  else {
    cliExecute("shrug Stevedave's Shanty of Superiority");
    cliExecute("shrug Carol of the Thrills");
    cliExecute("shrug Stevedave's Shanty of Superiority");
    cliExecute("shrug Ur-Kel's Aria of Annoyance");
    cliExecute("shrug Aloysius' Antiphon of Aptitude");
    cliExecute("shrug Song of the North");
    cliExecute("shrug Song of Bravado");
    return;
  }
}

//Define how to determine mainstat and define certain effects, incredients, and reagant needs based on mainstat
export const mainStatStr = myPrimestat().toString();

export const reagentBalancerEffect: Effect = {
  Muscle: $effect`Stabilizing Oiliness`,
  Mysticality: $effect`Expert Oiliness`,
  Moxie: $effect`Slippery Oiliness`,
}[mainStatStr];

export const reagentBalancerItem: Item = {
  Muscle: $item`oil of stability`,
  Mysticality: $item`oil of expertise`,
  Moxie: $item`oil of slipperiness`,
}[mainStatStr];

export const reagentBalancerIngredient: Item = {
  Muscle: $item`lime`,
  Mysticality: $item`cherry`,
  Moxie: $item`jumbo olive`,
}[mainStatStr];

export const reagentBoosterEffect: Effect = {
  Muscle: $effect`Phorcefullness`,
  Mysticality: $effect`Mystically Oiled`,
  Moxie: $effect`Superhuman Sarcasm`,
}[mainStatStr];

export const reagentBoosterItem: Item = {
  Muscle: $item`philter of phorce`,
  Mysticality: $item`ointment of the occult`,
  Moxie: $item`serum of sarcasm`,
}[mainStatStr];

export const reagentBoosterIngredient: Item = {
  Muscle: $item`lemon`,
  Mysticality: $item`grapefruit`,
  Moxie: $item`olive`,
}[mainStatStr];

export const snapperXpItem: Item = {
  Muscle: $item`vial of humanoid growth hormone`,
  Mysticality: $item`non-Euclidean angle`,
  Moxie: $item`Shantix™`,
}[mainStatStr];

export const abstractionXpItem: Item = {
  Muscle: $item`abstraction: purpose`,
  Mysticality: $item`abstraction: category`,
  Moxie: $item`abstraction: perception`,
}[mainStatStr];

export const abstractionXpEffect: Effect = {
  Muscle: $effect`Purpose`,
  Mysticality: $effect`Category`,
  Moxie: $effect`Perception`,
}[mainStatStr];

export const generalStoreXpEffect: Effect = {
  Muscle: $effect`Go Get 'Em, Tiger!`,
  Mysticality: $effect`Glittering Eyelashes`,
  Moxie: $effect`Butt-Rock Hair`,
}[mainStatStr];

export function checkLocketAvailable(): number {
  const locketAvailable =
    (args.redskeleton ? 1 : 0) + (args.witchessking ? 1 : 0) + (args.factoryworker ? 1 : 0);

  return locketAvailable;
}

type Thing = Item | Effect | string;

export function checkValue(thing: Thing, turns: number): boolean {
  if (get("valueOfAdventure") * turns > checkPrice(thing)) return true;
  return false;
}

function checkPrice(thing: Thing): number {
  if (thing instanceof Item) return mallPrice(thing);
  if (typeof thing === "string")
    switch (thing) {
      case "Locket":
        return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5);
      case "Deck Cheat":
        return 10000;
      case "Fax":
        return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5);
      case "2002":
        return mallPrice($item`Spooky VHS Tape`);
      case "Favorite Bird":
        return 20000;
      case "August Scepter":
        return Math.max(mallPrice($item`waffle`) * 3, 30000);
      case "Pillkeeper":
        if (get("_freePillKeeperUsed", false))
          return get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5); //Lucky
        else
          return (
            7.5 * get("valueOfAdventure", 4000) +
            get("valueOfAdventure", 4000) * get("garbo_embezzlerMultiplier", 2.5)
          );
      case "Cargo":
        return 15000;
      case "ClipArt":
        return mallPrice($item`box of Familiar Jacks`);
      case "Spleen":
        return have($item`miniature crystal ball`)
          ? get("valueOfAdventure", 4000) * 2 * get("garbo_embezzlerMultiplier", 2.5)
          : get("valueOfAdventure", 4000) * 1.5 * get("garbo_embezzlerMultiplier", 2.5);
      default:
        return 0;
    }
  return 0;
}

export function checkTurnSave(test: string, ef: Effect): number {
  switch (test) {
    case "BoozeDrop":
      return Math.min(
        CommunityService.BoozeDrop.turnsSavedBy(ef),
        CommunityService.BoozeDrop.actualCost()
      );
    case "HotRes":
      return Math.min(
        CommunityService.HotRes.turnsSavedBy(ef),
        CommunityService.HotRes.actualCost()
      );
    case "FamiliarWeight":
      return Math.min(
        CommunityService.FamiliarWeight.turnsSavedBy(ef),
        CommunityService.FamiliarWeight.actualCost()
      );
    case "NonCombat":
      return Math.min(
        CommunityService.Noncombat.turnsSavedBy(ef),
        CommunityService.Noncombat.actualCost()
      );
    case "SpellDamage":
      return Math.min(
        CommunityService.SpellDamage.turnsSavedBy(ef),
        CommunityService.SpellDamage.actualCost()
      );
    case "WeaponDamage":
      return Math.min(
        CommunityService.WeaponDamage.turnsSavedBy(ef),
        CommunityService.WeaponDamage.actualCost()
      );
    default:
      return 0;
  }
}

export function logTestCompletion(): void {
  cliExecute(`set folgerHPYesterday = ${get("folgerHPToday", 1)}`);
  cliExecute(`set folgerHPToday = ${get("_CSTest1")}`);
  cliExecute(`set folgerMusYesterday = ${get("folgerMusToday", 1)}`);
  cliExecute(`set folgerMusToday= ${get("_CSTest2")}`);
  cliExecute(`set folgerMysYesterday = ${get("folgerMysToday", 1)}`);
  cliExecute(`set folgerMysToday= ${get("_CSTest3")}`);
  cliExecute(`set folgerMoxYesterday = ${get("folgerMoxToday", 1)}`);
  cliExecute(`set folgerMoxToday= ${get("_CSTest4")}`);
  cliExecute(`set folgerFWYesterday = ${get("folgerFWToday", 1)}`);
  cliExecute(`set folgerFWToday= ${get("_CSTest5")}`);
  cliExecute(`set folgerWDYesterday = ${get("folgerWDToday", 1)}`);
  cliExecute(`set folgerWDToday= ${get("_CSTest6")}`);
  cliExecute(`set folgerSDYesterday = ${get("folgerSDToday", 1)}`);
  cliExecute(`set folgerSDToday= ${get("_CSTest7")}`);
  cliExecute(`set folgerNCYesterday = ${get("folgerNCToday", 1)}`);
  cliExecute(`set folgerNCToday= ${get("_CSTest8")}`);
  cliExecute(`set folgerBDYesterday = ${get("folgerBDToday", 1)}`);
  cliExecute(`set folgerBDToday= ${get("_CSTest9")}`);
  cliExecute(`set folgerHRYesterday = ${get("folgerHRToday", 1)}`);
  cliExecute(`set folgerHRToday= ${get("_CSTest10")}`);
}

export function compareTestCompletion(): void {
  const HP = get("folgerHPToday", 0) - get("folgerHPYesterday", 0);
  const Mus = get("folgerMusToday", 0) - get("folgerMusYesterday", 0);
  const Mys = get("folgerMysToday", 0) - get("folgerMysYesterday", 0);
  const Mox = get("folgerMoxToday", 0) - get("folgerMoxYesterday", 0);
  const FW = get("folgerFWToday", 0) - get("folgerFWYesterday", 0);
  const WD = get("folgerWDToday", 0) - get("folgerWDYesterday", 0);
  const SD = get("folgerSDToday", 0) - get("folgerSDYesterday", 0);
  const NC = get("folgerNCToday", 0) - get("folgerNCYesterday", 0);
  const BD = get("folgerBDToday", 0) - get("folgerBDYesterday", 0);
  const HR = get("folgerHRToday", 0) - get("folgerHRYesterday", 0);
  print(`Took ${HP} turns on HP test compared to yesterday!`);
  print(`Took ${Mus} turns on Muscle test compared to yesterday!`);
  print(`Took ${Mys} turns on Mysticality test compared to yesterday!`);
  print(`Took ${Mox} turns on Moxie test compared to yesterday!`);
  print(`Took ${FW} turns on Familiar Weight test compared to yesterday!`);
  print(`Took ${WD} turns on Weapon Damage test compared to yesterday!`);
  print(`Took ${SD} turns on Spell Damage test compared to yesterday!`);
  print(`Took ${NC} turns on NonCombat test compared to yesterday!`);
  print(`Took ${BD} turns on Booze Drop test compared to yesterday!`);
  print(`Took ${HR} turns on Hot Res test compared to yesterday!`);
}

export function boomBoxProfit(): void {
  if (have($item`Punching Potion`) && SongBoom.song() !== "Total Eclipse of Your Meat")
    SongBoom.setSong("Total Eclipse of Your Meat");
}

export function goVote(): void {
  const initPriority: Map<string, number> = new Map([
    ["Weapon Damage Percent: +100", 5],
    ["Item Drop: +15", 4],
    ["Booze Drop: +30", 4],
    ["Monster Level: +10", 3],
    [`${mainStat} Percent: +25`, 3],
    ["Adventures: +1", 3],
    ["Spell Damage Percent: +20", 3],
    ["Experience (familiar): +2", 2],
    [`Experience (${mainStat}): +4`, 2],
    ["Hot Resistance: +3", 2],
    ["Meat Drop: +30", 1],
    [`Experience: +3`, 1],
    ["Meat Drop: -30", -2],
    ["Item Drop: -15", -4],
    ["Familiar Experience: -2", -4],
    [`Experience: -3`, -4],
    [`Maximum HP Percent: -50`, -4],
    ["Weapon Damage Percent: -50", -6],
    ["Spell Damage Percent: -50", -6],
    ["Adventures: -2", -6],
  ]);

  const voteLocalPriorityArr = [1, 2, 3, 4].map((index) => ({
    urlString: index - 1,
    value:
      initPriority.get(get(`_voteLocal${index}`)) ??
      (get(`_voteLocal${index}`).includes("-") ? -1 : 1),
  }));

  const init = maxBy(voteLocalPriorityArr, "value").urlString;

  const voterValueTable = [
    {
      monster: $monster`terrible mutant`,
      value: 3,
    },
    {
      monster: $monster`angry ghost`,
      value: 2,
    },
    {
      monster: $monster`government bureaucrat`,
      value: 2,
    },
    {
      monster: $monster`annoyed snake`,
      value: 1,
    },
    {
      monster: $monster`slime blob`,
      value: 1,
    },
  ];

  const votingMonsterPriority = voterValueTable
    .sort((a, b) => b.value - a.value)
    .map((element) => element.monster.name);

  const monsterVote =
    votingMonsterPriority.indexOf(get("_voteMonster1")) <
    votingMonsterPriority.indexOf(get("_voteMonster2"))
      ? 1
      : 2;

  visitUrl(`choice.php?option=1&whichchoice=1331&g=${monsterVote}&local[]=${init}&local[]=${init}`);
}

export function useLoathingIdol(): void {
  use(
    have($item`Loathing Idol Microphone`)
      ? $item`Loathing Idol Microphone`
      : have($item`Loathing Idol Microphone (75% charged)`)
      ? $item`Loathing Idol Microphone (75% charged)`
      : have($item`Loathing Idol Microphone (50% charged)`)
      ? $item`Loathing Idol Microphone (50% charged)`
      : $item`Loathing Idol Microphone (25% charged)`
  );
}

export const haveLoathingIdol =
  have($item`Loathing Idol Microphone`) ||
  have($item`Loathing Idol Microphone (75% charged)`) ||
  have($item`Loathing Idol Microphone (50% charged)`) ||
  have($item`Loathing Idol Microphone (25% charged)`);

export function useOffhandRemarkable(): boolean {
  if (!have($item`august scepter`)) return false;

  const nonCom =
    computeCombatFrequency(false) <= -90 && computeCombatFrequency(false) > -100 ? 4 : 0;
  const sDmg = have($item`Abracandalabra`) ? 2 : 0;
  const famWt =
    have($item`sugar shield`) || have($item`burning newspaper`) || have($item`burning paper crane`)
      ? 2
      : have($item`familiar scrapbook`)
      ? 1
      : 0;
  const statTests = 4;
  const hotTest = computeHotRes(false);
  const wDmgTest = computeWeaponDamage(false);
  const sDmgTest = computeSpellDamage(false);
  const nonComTest = Math.max(1, Math.floor((100 + computeCombatFrequency(false) - 20) / 5));
  const wishValue = 50000;

  if (
    statTests + hotTest + wDmgTest + sDmgTest + nonComTest < 30 &&
    (nonCom + sDmg + famWt) * get("valueOfAdventure") > wishValue
  )
    return true;
  else return false;
}

export function checkPurqoise(meat: number): boolean {
  if (myMeat() > meat) return false;
  return true;
}
