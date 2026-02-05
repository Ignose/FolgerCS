import { Args } from "grimoire-kolmafia";

export const args = Args.create(
  "FolgerCS",
  `Written by Seraphiii, branched from InstantSCCS by Pantocyclus. This is a CS-script with a focus on maximum aftercore profits`,
  {
    version: Args.flag({
      help: "Output script version number and exit.",
      default: false,
      setting: "",
    }),
    confirm: Args.boolean({
      help: "If the user must confirm execution of each task.",
      default: false,
    }),
    sim: Args.flag({ help: "Check if you have the requirements to run this script.", setting: "" }),
    savedresources: Args.flag({
      help: "Check which resources you have current set to be saved.",
      setting: "",
    }),
    recap: Args.flag({ help: "Recap of today's run.", setting: "" }),
    motherclan: Args.string({
      help: `Name of the mother clan for your slime fighting needs`,
      default: "",
    }),
    stickknifeoutfit: Args.string({
      help: `Name of the outfit that contains stick-knife, for stick-knife trick`,
      default: "",
    }),
    synthxp: Args.flag({
      help: `Do not use synth for the Xp% buff`,
      default: true,
    }),
    asdon: Args.flag({
      help: `Should we use Asdon Martin? Incompatible with Skipping Borrowed Time`,
      default: false,
    }),
    astralpils: Args.number({
      help: "How many astral pilsners should we save?",
      default: 0,
    }),
    savepulls: Args.number({
      help: "How many pulls should we save?",
      default: 0,
    }),
    witchess: Args.flag({
      help: `Do not fight witchess monsters nor acquire Puzzle Champ`,
      default: false,
    }),
    redskeleton: Args.flag({
      help: `Do not locket a red skeleton`,
      default: false,
    }),
    ninjamap: Args.flag({
      help: `Do not attempt to grab a li'l ninja costume for your tot`,
      default: false,
    }),
    savesnokebomb: Args.flag({
      help: `Should we save snokebombs for Inner Elf?`,
      default: false,
    }),
    skipbishop: Args.flag({
      help: `Save 3 Witchess fights for the Queen, King and Witch`,
      default: false,
    }),
    skipking: Args.flag({
      help: `Do not fight the Witchess King using the Witchess Set`,
      default: false,
    }),
    skipwitch: Args.flag({
      help: `Do not fight the Witchess Witch using the Witchess Set`,
      default: false,
    }),
    skipqueen: Args.flag({
      help: `Do not fight the Witchess Queen using the Witchess Set`,
      default: false,
    }),
    savepurqoise: Args.flag({
      help: `Do not autosell your porquoise`,
      default: false,
    }),
    savefloundry: Args.flag({
      help: `Do not create a carpe`,
      default: false,
    }),
    savefortune: Args.flag({
      help: `Do not consult Zatara for the stat buff`,
      default: false,
    }),
    savesnack: Args.flag({
      help: `Do not use your snack voucher`,
      default: false,
    }),
    savebarrel: Args.flag({
      help: `Do not get the barrel shrine buff`,
      default: false,
    }),
    saveterminal: Args.flag({
      help: `Do not acquire items.enh and substats.enh`,
      default: false,
    }),
    savecopdollar: Args.flag({
      help: `Do not acquire shoe gum with cop dollars`,
      default: false,
    }),
    savepantogramming: Args.flag({
      help: `Do not use your pantogram`,
      default: false,
    }),
    savemumming: Args.flag({
      help: `Do not use your mumming trunk`,
      default: false,
    }),
    saveglove: Args.flag({
      help: `Do not acquire Triple-Sized and Invisible Avatar`,
      default: false,
    }),
    savemayday: Args.flag({
      help: `Do not use your Mayday survival package`,
      default: false,
    }),
    savepumpkin: Args.flag({
      help: `Do not use harvested pumpkins`,
      default: false,
    }),
    savegarden: Args.flag({
      help: `Do not harvest your garden`,
      default: false,
    }),
    savemoontune: Args.flag({
      help: `Do not tune the moon for familiar weight test`,
      default: false,
    }),
    savecinch: Args.number({
      help: `How much cinch should we save?`,
      default: 0,
    }),
    saverests: Args.number({
      help: `How many rests should we use (not save, use!)?`,
      default: 0,
    }),
    savenumberology: Args.number({
      help: `How many numberology casts should we use (not save, use!)?`,
      default: 0,
    }),
    savelimitedat: Args.flag({
      help: `Should we use limited Accordian Thief songs?`,
      default: false,
    }),
    savegovernment: Args.flag({
      help: `Do not attempt to unlock the beach with meat to grab an anticheese`,
      default: false,
    }),
    savedeck: Args.flag({
      help: `Do not use Giant Growth or any other deck cheats`,
      default: false,
    }),
    saveembers: Args.flag({
      help: `Do not get and use mouthwash/sept-ember`,
      default: false,
    }),
    savecyber: Args.flag({
      help: `Do not use our ten free cyber-fights`,
      default: false,
    }),
    dopulls: Args.flag({
      help: `Automatically use excess pulls for good stuff?`,
      default: true,
    }),
    dopullstest: Args.flag({
      help: `Automatically optimize and use excess pulls for good stuff?`,
      default: false,
    }),
    experimentalsynth: Args.flag({
      help: `Try using Synth for item%? Requires Sugar Shummoning`,
      default: false,
    }),
    doncfirst: Args.flag({
      help: `Should we automatically do the NonCombat test first? Assumes you cap NC without Shady Shades`,
      default: false,
    }),
    explicitlyexcludedefs: Args.string({
      help: `Effects that we should not acquire throughout the run.`,
      default: "",
    }),
    explicitlyexcludedfams: Args.string({
      help: `Familiars that we should not use throughout the run.`,
      default: "",
    }),
    boozelimit: Args.number({
      help: `Set default booze test limit`,
      default: 10,
    }),
    familiarlimit: Args.number({
      help: `Set default booze test limit`,
      default: 42,
    }),
    hotlimit: Args.number({
      help: `Set default booze test limit`,
      default: 10,
    }),
    noncomlimit: Args.number({
      help: `Set default nomcombat test limit`,
      default: 10,
    }),
    spelldmglimit: Args.number({
      help: `Set default spell damage test limit`,
      default: 42,
    }),
    moxielimit: Args.number({
      help: `Set default moxie test limit`,
      default: 1,
    }),
    musclelimit: Args.number({
      help: `Set default muscle test limit`,
      default: 1,
    }),
    myslimit: Args.number({
      help: `Set default mys test limit`,
      default: 1,
    }),
    hplimit: Args.number({
      help: `Set default hp test limit`,
      default: 1,
    }),
    weaponlimit: Args.number({
      help: `Set default weapon damage test limit`,
      default: 10,
    }),
    test: Args.flag({
      help: `Test new features`,
      default: false,
    }),
  }
);
