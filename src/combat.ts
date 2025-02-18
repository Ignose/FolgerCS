import { mpCost, myPrimestat, toInt } from "kolmafia";
import { $item, $monster, $skill, $stat, CommunityService, get, have, StrictMacro } from "libram";

//export const mainStat = myClass().primestat;
export const mainStat = myPrimestat(); //Update to select mainstat based on class derived from Libram

const damageSkill = mainStat === $stat`Muscle` ? $skill`Lunging Thrust-Smack` : $skill`Saucegeyser`;

export default class Macro extends StrictMacro {
  kill(useCinch = false): Macro {
    const macroHead = this.trySkill($skill`Curse of Weaksauce`)
      .trySkill($skill`Micrometeorite`)
      .trySkill($skill`Sing Along`)
      .externalIf(
        get("_cosmicBowlingSkillsUsed") < 1 && CommunityService.CoilWire.isDone(),
        Macro.trySkill($skill`Bowl Sideways`)
      )
      .trySkill($skill`Gulp Latte`)
      .trySkill($skill`Surprisingly Sweet Stab`)
      .trySkill($skill`Surprisingly Sweet Slash`)
      .if_(
        `!mpbelow ${mpCost($skill`Stuffed Mortar Shell`)}`,
        Macro.trySkill($skill`Stuffed Mortar Shell`)
      );

    return (useCinch ? macroHead.trySkill($skill`Cincho: Confetti Extravaganza`) : macroHead)
      .while_(`!mpbelow ${damageSkill} && hasskill ${toInt(damageSkill)}`, Macro.skill(damageSkill))
      .while_(
        `!mpbelow ${mpCost($skill`Saucestorm`)} && hasskill ${toInt($skill`Saucestorm`)}`,
        Macro.skill($skill`Saucestorm`)
      )
      .attack()
      .repeat();
  }

  static kill(): Macro {
    return new Macro().kill();
  }

  banish(): Macro {
    return Macro.trySkill($skill`Feel Hatred`)
      .trySkill($skill`Reflex Hammer`)
      .trySkill($skill`Throw Latte on Opponent`)
      .trySkill($skill`KGB tranquilizer dart`)
      .trySkill($skill`Snokebomb`);
  }

  static banish(): Macro {
    return new Macro().banish();
  }

  itemDrop(): Macro {
    return (
      Macro.if_(
        $monster`sausage goblin`,
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .default(false)
      ),
      Macro.if_(
        $monster`fluffy bunny`,
        Macro.trySkill($skill`Bowl Straight Up`)
          .trySkill($skill`Become a Bat`)
          .trySkill($skill`Feel Hatred`)
          .trySkill($skill`Reflex Hammer`)
          .trySkill($skill`Throw Latte on Opponent`)
          .trySkill($skill`KGB tranquilizer dart`)
          .trySkill($skill`Snokebomb`)
      )
    );
  }

  static itemDrop(): Macro {
    return new Macro().itemDrop();
  }

  default(useCinch = false): Macro {
    return this.kill(useCinch);
  }

  static default(useCinch = false): Macro {
    return new Macro().default(useCinch);
  }
}

export function main(): void {
  Macro.load().submit();
}

export function haveFreeKill(): boolean {
  // TODO: Support for Parka YR
  const haveXRay = have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3;
  const haveShatteringPunch = have($skill`Shattering Punch`) && get("_shatteringPunchUsed") < 3;
  const haveMobHit = have($skill`Gingerbread Mob Hit`) && !get("_gingerbreadMobHitUsed");

  return haveXRay || haveShatteringPunch || haveMobHit;
}

export function haveMotherSlimeBanish(): boolean {
  const haveSnokeBomb = have($skill`Snokebomb`) && get("_snokebombUsed") < 3;
  const haveKGBTranquilizer =
    have($item`Kremlin's Greatest Briefcase`) && get("_kgbTranquilizerDartUses") < 3;

  return haveSnokeBomb || haveKGBTranquilizer;
}

export function haveFreeBanish(): boolean {
  const haveFeelHatred = have($skill`Feel Hatred`) && get("_feelHatredUsed") < 3;
  const haveReflexHammer = have($item`Lil' Doctor™ bag`) && get("_reflexHammerUsed") < 3;
  const haveThrowLatte = have($item`latte lovers member's mug`) && !get("_latteBanishUsed");

  return haveFeelHatred || haveReflexHammer || haveThrowLatte || haveMotherSlimeBanish();
}
