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
import {
  compareTestCompletion,
  computeCombatFrequency,
  convertMilliseconds,
  logTestCompletion,
  simpleDateDiff,
} from "./lib";
import { $familiar, $item, $skill, $stat, get, have, set, sinceKolmafiaRevision } from "libram";
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
import { DonateQuest, logResourceUsage } from "./tasks/donate";
import { SpellDamageQuest } from "./tasks/spelldamage";
import { checkRequirements, checkTests } from "./sim";
import { args } from "./args";

const timeProperty = "fullday_elapsedTime";

export function main(command?: string): void {
  sinceKolmafiaRevision(27792);

  Args.fill(args, command);
  if (args.help) {
    Args.showHelp(args);
    return;
  }
  if (args.sim) {
    checkRequirements();
    checkTests();
    return;
  }

  if (args.recap) {
    logResourceUsage();
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

  const swapMainStatTest = have($item`Deck of Every Card`) && myPrimestat === $stat`Muscle`;
  function swapNCandFamTest(): boolean {
    if (
      (computeCombatFrequency(false) <= -100 ||
        (computeCombatFrequency(false) === -95 && have($familiar`God Lobster`))) &&
      have($familiar`Comma Chameleon`) &&
      (have($skill`Summon Clip Art`) || have($item`box of Familiar Jacks`))
    )
      return true;

    return false;
  }

  const tasks: Task[] = getTasks([
    RunStartQuest,
    earlyLevelingQuest,
    CoilWireQuest,
    LevelingQuest,
    swapMainStatTest ? MoxieQuest : MuscleQuest,
    swapMainStatTest ? MysticalityQuest : HPQuest,
    swapMainStatTest ? MuscleQuest : MysticalityQuest,
    swapMainStatTest ? HPQuest : MoxieQuest,
    HotResQuest,
    WeaponDamageQuest,
    SpellDamageQuest,
    swapNCandFamTest() || args.doncfirst ? NoncombatQuest : FamiliarWeightQuest,
    swapNCandFamTest() || args.doncfirst ? FamiliarWeightQuest : NoncombatQuest,
    BoozeDropQuest,
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
