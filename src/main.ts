import {
  cliExecute,
  myAdventures,
  myAscensions,
  myPrimestat,
  nowToString,
  print,
  setAutoAttack,
  turnsPlayed,
  userConfirm,
  visitUrl,
} from "kolmafia";
import { compareTestCompletion, computeCombatFrequency, convertMilliseconds, logTestCompletion, mainStatStr, simpleDateDiff } from "./lib";
import { $effect, $stat, CommunityService, get, have, set, sinceKolmafiaRevision } from "libram";
import { Engine } from "./engine/engine";
import { Args, getTasks } from "grimoire-kolmafia";
import { Task } from "./engine/task";
import { HPQuest, MoxieQuest, MuscleQuest, MysticalityQuest } from "./tasks/stat";
import { earlyLevelingQuest } from "./tasks/earlyleveling";
import { LevelingQuest } from "./tasks/leveling";
import { CoilWireQuest } from "./tasks/coilwire";
import { RunStartQuest } from "./tasks/runstart";
import { FamiliarWeightQuest } from "./tasks/familiarweight";
import { NoncombatQuest } from "./tasks/noncombat";
import { BoozeDropQuest } from "./tasks/boozedrop";
import { HotResQuest } from "./tasks/hotres";
import { WeaponDamageQuest } from "./tasks/weapondamage";
import { DonateQuest } from "./tasks/donate";
import { SpellDamageQuest } from "./tasks/spelldamage";
import { checkRequirements } from "./sim";
import { checkResources } from "./resources";

const timeProperty = "fullday_elapsedTime";

export const args = Args.create("FolgerCS", "An automated low to mid-shiny SCCS script.", {
  confirm: Args.boolean({
    help: "If the user must confirm execution of each task.",
    default: false,
  }),
  sim: Args.flag({ help: "Check if you have the requirements to run this script.", setting: "" }),
  savedresources: Args.flag({
    help: "Check which resources you have current set to be saved.",
    setting: "",
  }),
});

export function main(command?: string): void {
  sinceKolmafiaRevision(27637);

  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.sim) {
    checkRequirements();
    return;
  }
  if (args.savedresources) {
    checkResources();
    return;
  }

  if (runComplete()) {
    print("Community Service complete!", "purple");
    return;
  }

  const setTimeNow = get(timeProperty, -1) === -1;
  if (setTimeNow) set(timeProperty, nowToString("yyyyMMddhhmmssSSS"));

  // Some checks to align mafia prefs
  visitUrl("museum.php?action=icehouse");
  visitUrl("main.php");
  cliExecute("refresh all");

  const swapFamAndNCTests = computeCombatFrequency() <= -95;

  const swapMainStatTest = have($effect`Giant Growth`) || get("_folgerGiantFirst", false);
  const statTestOrderChecker = 
  myPrimestat === $stat`Muscle` 
  ? [swapMainStatTest ? MoxieQuest : MuscleQuest, MysticalityQuest, swapMainStatTest ? MuscleQuest : MoxieQuest, HPQuest]
  : myPrimestat === $stat`Mysticality` 
  ? [swapMainStatTest ? [MuscleQuest, HPQuest] : MysticalityQuest, MoxieQuest, swapMainStatTest ? MysticalityQuest : [MuscleQuest, HPQuest]]
  : myPrimestat === $stat`Moxie`
  ? [swapMainStatTest ? MysticalityQuest : MoxieQuest, MuscleQuest, HPQuest, swapMainStatTest ? MoxieQuest: MysticalityQuest ]
  : [];
  const statTestOrder: Task[] = statTestOrderChecker;

  const skillTestOrderChecker =
  CommunityService.SpellDamage.prediction >= 30 ? [BoozeDropQuest, WeaponDamageQuest, SpellDamageQuest] : [WeaponDamageQuest, SpellDamageQuest, BoozeDropQuest];

  const skillTestOrder: Task[] = skillTestOrderChecker;

  const tasks: Task[] = 
    getTasks([
        RunStartQuest,
        earlyLevelingQuest,
        CoilWireQuest,
        LevelingQuest,
        ...statTestOrder,
        NoncombatQuest,
        HotResQuest,
        FamiliarWeightQuest,
        ...skillTestOrder,
        DonateQuest,
      ]);
  const engine = new Engine(tasks);
  try {
    setAutoAttack(0);

    while (!runComplete()) {
      const task = engine.getNextTask();
      if (task === undefined) throw "Unable to find available task, but the run is not complete";
      if (args.confirm && !userConfirm(`Executing task ${task.name}, should we continue?`)) {
        throw `User rejected execution of task ${task.name}`;
      }
      if (task.ready !== undefined && !task.ready()) throw `Task ${task.name} is not ready`;
      engine.execute(task);
    }
    
    logTestCompletion();
    compareTestCompletion();
    print("Community Service complete!", "purple");
    print(`Adventures used: ${turnsPlayed()}`, "purple");
    print(`Adventures remaining: ${myAdventures()}`, "purple");
    print(
      `Time: ${convertMilliseconds(
        simpleDateDiff(
          get(timeProperty, nowToString("yyyyMMddhhmmssSSS")),
          nowToString("yyyyMMddhhmmssSSS")
        )
      )} since first run today started`,
      "purple"
    );
    set(timeProperty, -1);
  } finally {
    engine.destruct();
  }
}

function runComplete(): boolean {
  return get("kingLiberated") && get("lastEmptiedStorage") === myAscensions();
}
