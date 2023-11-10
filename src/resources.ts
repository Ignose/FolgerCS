/*import { Effect, Familiar, print, printHtml, toEffect, toInt, totalFreeRests } from "kolmafia";
import { $effect, $effects, get, set } from "libram";

class Resource {
  pref: string;
  help: string | ((s?: string | number) => string);
  effects: Effect[];
  default_value: number;

  constructor(
    pref: string,
    help: string | ((s?: string | number) => string),
    effects?: Effect[],
    default_value?: number
  ) {
    this.pref = pref;
    this.help = help;
    const prefIsNumber = !isNaN(Number(get(pref, ""))) && get(pref, "").length > 0;
    this.effects = (!prefIsNumber ? get(pref, false) : true) && effects ? effects : [];
    this.default_value = default_value === undefined ? 1 : default_value;
    if (default_value !== undefined && !prefIsNumber) set(pref, default_value);
  }
}

const consumptionResources: Resource[] = [
  new Resource(
    "instant_skipDistilledFortifiedWine",
    "Do not grab the DFW lucky adventure (if you have numberology or are using skip-BT route)"
  ),
  new Resource(
    "instant_saveAstralPilsners",
    (n) => `Save ${n}/6 astral pilsners (set a number)`,
    [],
    get("instant_saveAstralPilsners", false) ? 6 : 0
  ),
  new Resource("instant_savePerfectFreeze", "Do not craft and drink a perfect drink"),
  new Resource("instant_saveBeesKnees", "Do not buy and drink Bee's Knees"),
  new Resource("instant_saveSacramentoWine", "Do not drink a Sacramento Wine for the item test"),
  new Resource("instant_skipSynthExp", "Do not use synth for the Xp% buff"),
  new Resource(
    "instant_saveBodySpradium",
    "Do not chew the body spradium if we have it",
    $effects`Boxing Day Glow`
  ),
  new Resource(
    "instant_skipCabernetSauvignon",
    "Do not summon and drink a bottle of Cabernet Sauvignon",
    $effects`Cabernet Hunter`
  ),
  new Resource("instant_skipDeepDishOfLegend", "Skip Deep Dish of legend."),
  new Resource("instant_skipCalzoneOfLegend", "Skip Calzone of legend."),
  new Resource("instant_skipPizzaOfLegend", "Skip Pizza of legend."),
  new Resource(
    "instant_useAsdon",
    "Skip trainset and use Asdon; incompatible with saving borrowed time."
  ),
  new Resource(
    "instant_savePulls",
    (n) => `Save ${n}/5 pulls (set a number)`,
    [],
    get("instant_savePulls", false) ? 5 : 0
  ),
];

const encounterResources: Resource[] = [
  new Resource(
    "instant_saveWitchess",
    "Do not fight witchess monsters nor acquire Puzzle Champ",
    $effects`Puzzle Champ`
  ),
  new Resource(
    "instant_saveBackups",
    (n) => `Save ${n}/11 backups (set a number)`,
    [],
    get("instant_saveBackups", false) ? 11 : 0
  ),
  new Resource("instant_saveLocketRedSkeleton", "Do not reminisce a Red Skeleton"),
  new Resource("instant_saveLocketWitchessKing", "Do not reminisce a Witchess King"),
  new Resource("instant_saveLocketFactoryWorker", "Do not reminisce a Factory Worker (female)"),
  new Resource(
    "instant_skipMappingNinja",
    "Do not attempt to grab a li'l ninja costume for your tot"
  ),
  new Resource(
    "instant_saveSBForInnerElf",
    (n) => `Save ${n}/3 Snokebombs for Inner Elf`,
    [],
    get("instant_saveSBForInnerElf", false) ? 2 : 0
  ),
  new Resource(
    "instant_skipBishopsForRoyalty",
    "Save 3 Witchess fights for the Queen, King and Witch"
  ),
];

const farmingResources: Resource[] = [
  new Resource("instant_savePorquoise", "Do not autosell your porquoise"),
  new Resource("instant_saveFloundry", "Do not create a carpe"),
  new Resource("instant_saveFortuneTeller", "Do not consult Zatara for the myst buff"),
  new Resource(
    "instant_saveSnackVoucher",
    "Do not use your snack voucher",
    $effects`Wasabi With You, Pisces in the Skyces`
  ),
  new Resource("instant_saveBarrelShrine", "Do not get the barrel shrine buff", [
    $effect`Warlock, Warstock, and Warbarrel`,
  ]),
  new Resource(
    "instant_saveTerminal",
    "Do not acquire items.enh and substats.enh",
    $effects`items.enh, substats.enh`
  ),
  new Resource(
    "instant_saveCopDollars",
    "Do not acquire shoe gum with cop dollars",
    $effects`Gummed Shoes`
  ),
  new Resource("instant_saveKGBClicks", "Do not use any KGB clicks"),
  new Resource("instant_savePantogram", "Do not use your pantogram"),
  new Resource("instant_saveMummingTrunk", "Do not use your mumming trunk"),
  new Resource(
    "instant_savePowerfulGlove",
    "Do not acquire Triple-Sized and Invisible Avatar",
    $effects`Triple-Sized, Invisible Avatar`
  ),
  new Resource("instant_saveMayday", "Do not use your Mayday survival package"),
  new Resource("instant_savePumpkins", "Do not use harvested pumpkins"),
  new Resource("instant_saveSugar", "Do not spend tome uses on sugar shorts/chapeau/shank"),
  new Resource("instant_saveGarden", "Do not harvest your garden"),
  new Resource("instant_saveMoonTune", "Do not tune the moon for familiar weight test"),
  new Resource(
    "instant_saveCinch",
    (n) => `Save ${n}/100 Cinch; set to 100 to avoid using any!`,
    [],
    get("instant_saveCinch", false) ? 100 : 0
  ),
  new Resource(
    "instant_saveFreeRests",
    (n) => `Save ${n}/${totalFreeRests()} free rests (set a number)`,
    [],
    get("instant_saveFreeRests", false) ? totalFreeRests() : 0
  ),
  new Resource(
    "instant_saveCatalogCredits",
    (n) => `Save ${n}/3 Mr. Store Catalog Credits (set a number)`,
    [],
    get("instant_saveCatalogCredits", false) ? 3 : 0
  ),
  new Resource("instant_skipMeatButler", "Do not grab the meat butler from the Mr. Store Catalog"),
  new Resource(
    "instant_saveNumberology",
    (n) => `Save ${n}/${get("skillLevel144") > 3 ? 3 : get("skillLevel144")} Numberology casts`,
    [],
    get("instant_saveNumberology", false) ? 3 : 0
  ),
  new Resource(
    "instant_saveAugustScepter",
    "Do not use Offhand Remarkable",
    $effects`Offhand Remarkable`
  ),
  new Resource(
    "instant_saveMonsterHabitats",
    (n) => `Save ${n}/3 Recall Facts: Monster Habitats! casts`,
    [],
    get("instant_saveMonsterHabitats", false) ? 3 : 0
  ),
  new Resource(
    "instant_saveLimitedAT",
    "Do not use Chorale of Companionship charges",
    $effects`Chorale of Companionship`
  ),
];

const otherResources: Resource[] = [
  new Resource(
    "instant_skipGovernment",
    "Do not attempt to unlock the beach with meat to grab an anticheese"
  ),
  new Resource(
    "instant_experimentPulls",
    "Automatically use pulls for Stick Knife, Soda, Diaper and/or Trousers? Default: Yes"
  ),
  new Resource(
    "instant_camelExperiment",
    "Automatically use a Box of Familiar Jacks to accrue Camel Spit?"
  ),
  new Resource(
    "instant_skipBorrowedTime",
    "Do not use borrowed time. Level to 5 using trainset, and eat pizzas to get coil adventures. Make sure you know what you're doing before using this."
  ),
];

const allResources = [
  ...consumptionResources,
  ...encounterResources,
  ...farmingResources,
  ...otherResources,
];

const automaticallyExcludedBuffs = Array.from(
  allResources.map((resource) => resource.effects).filter((efs) => efs.length > 0)
).reduce((acc, val) => acc.concat(val), []);
const manuallyExcludedBuffs = get("instant_explicitlyExcludedBuffs", "")
  .split(",")
  .filter((s) => s.length > 0)
  .map((s) => toEffect(s));
export const forbiddenEffects = [
  ...automaticallyExcludedBuffs,
  ...manuallyExcludedBuffs.filter((ef) => !automaticallyExcludedBuffs.includes(ef)),
];

function printResources(resources: Resource[]) {
  resources
    .sort((a, b) => (a.pref < b.pref ? -1 : 1))
    .forEach((resource) => {
      const prefValue = get(resource.pref, "");
      const prefOn =
        get(resource.pref, false) ||
        (!isNaN(Number(get(resource.pref, ""))) && Number(get(resource.pref, "")) > 0);
      const symbol = prefOn ? "✓" : "X";
      const color = prefOn ? "black" : "#888888";
      print(
        `${symbol} ${resource.pref} - ${
          typeof resource.help === "string" ? resource.help : resource.help(prefValue)
        }`,
        color
      );
    });
  print();
}

export function checkResources(): void {
  printHtml(
    "Legend (prefname - helptext): <font color='black'>✓ Saved Resource</font> / <font color='#888888'>X Usable Resource"
  );
  print("--- Resources pertaining to consumption / organs ---", "blue");
  printResources(consumptionResources);
  print("--- Resources pertaining to combat / turn-taking encounters ---", "blue");
  printResources(encounterResources);
  print("--- Resources pertaining to aftercore farming profits ---", "blue");
  printResources(farmingResources);
  print("--- Other resources ---", "blue");
  printResources(otherResources);

  print("The following are all the buffs we will not acquire in run:");
  forbiddenEffects.forEach((ef) => print(`- ${ef.name}`));
  print("The following are all the familliars we will not use during leveling:");
  const excludedFamiliars = get("instant_explicitlyExcludedFamiliars")
    .split(",")
    .map((i) => toInt(i));
  Familiar.all()
    .filter((fam) => excludedFamiliars.includes(toInt(fam)))
    .forEach((fam) => print(`- ${fam}`));
  print();
  print("Type 'set <prefname>=<true/false(/or number)>' in the CLI to set your preferences");
  print(
    "Type 'set instant_explicitlyExcludedBuffs=<effect_id1>,...,<effect_idn>' to exclude getting specific effects"
  );
  print("(e.g. 'set instant_explicitlyExcludedBuffs=2106' to exclude substats.enh (id = 2106)");
  print("without excluding acquiring items.enh from the Source Terminal)");
  print(
    "Type 'set instant_explicitlyExcludedFamiliars=<fam_id1>,...,<fam_idn>' to exclude using specific familiars during leveling"
  );
  print("Type 'ash remove_property(\"<prefname>\")' to delete a preference");
}*/
