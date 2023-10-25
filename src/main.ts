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
import { $effect, $item, $stat, CommunityService, get, have, set, sinceKolmafiaRevision } from "libram";
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

  const swapMainStatTest = have($item`Deck of every card`) && myPrimestat === $stat`Muscle`;

  const swapSkillTestOrder = CommunityService.SpellDamage.prediction >= 15;

  const nonComSwapOrder = CommunityService.FamiliarWeight.prediction >= 14 && swapSkillTestOrder;
 

  const tasks: Task[] = 
    getTasks([
        RunStartQuest,
        earlyLevelingQuest,
        CoilWireQuest,
        LevelingQuest,
        swapMainStatTest ? MoxieQuest : MuscleQuest,
        swapMainStatTest ? MysticalityQuest : HPQuest,
        swapMainStatTest ? MuscleQuest : MysticalityQuest,
        swapMainStatTest ? HPQuest : MoxieQuest,
        HotResQuest,
        nonComSwapOrder ? FamiliarWeightQuest : NoncombatQuest,
        nonComSwapOrder ? NoncombatQuest : FamiliarWeightQuest,
        swapSkillTestOrder ? BoozeDropQuest : WeaponDamageQuest,
        swapSkillTestOrder ? WeaponDamageQuest : SpellDamageQuest,
        swapSkillTestOrder ? SpellDamageQuest : BoozeDropQuest,
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
