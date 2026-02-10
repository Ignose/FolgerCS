import { CombatResource as BaseCombatResource, OutfitSpec } from "grimoire-kolmafia";
import { Effect, Item, Skill } from "kolmafia";
import { $effect, $item, $items, $monster, $skill, get, have } from "libram";
import { baseOutfit } from "./outfit";
import Macro from "../combat";
import { useCinch } from "../tasks/leveling";

export interface Resource {
  name: string;
  available: () => boolean;
  prepare?: () => void;
  equip?: Item | OutfitSpec;
  effect?: Effect;
  chance?: () => number;
}

export type CombatResource = Resource & BaseCombatResource;

interface FreekillSource extends CombatResource {
  do: Item | Skill;
}

export const freekillSources: FreekillSource[] = [
  {
    name: "Lil' Doctor™ bag",
    available: () => have($item`Lil' Doctor™ bag`) && get("_chestXRayUsed") < 3,
    do: $skill`Chest X-Ray`,
    equip: $item`Lil' Doctor™ bag`,
  },
  {
    name: "Gingerbread Mob Hit",
    available: () => have($skill`Gingerbread Mob Hit`) && !get("_gingerbreadMobHitUsed"),
    do: $skill`Gingerbread Mob Hit`,
  },
  {
    name: "Shattering Punch",
    available: () => have($skill`Shattering Punch`) && get("_shatteringPunchUsed") < 3,
    do: $skill`Shattering Punch`,
  },
  {
    name: "Replica bat-oomerang",
    available: () => have($item`replica bat-oomerang`) && get("_usedReplicaBatoomerang") < 3,
    do: $item`replica bat-oomerang`,
  },
  {
    name: "The Jokester's gun",
    available: () => have($item`The Jokester's gun`) && !get("_firedJokestersGun"),
    do: $skill`Fire the Jokester's Gun`,
    equip: $item`The Jokester's gun`,
  },
  {
    name: "Seal Clubbing Club of Legend",
    available: () => have($item`legendary seal-clubbing club`) && get("_clubEmTimeUsed", 0) < 5,
    do: $skill`Club 'Em Back in Time`,
    equip: $item`legendary seal-clubbing club`,
  },
  {
    name: "Jurassic Parka",
    available: () =>
      have($skill`Torso Awareness`) &&
      have($item`Jurassic Parka`) &&
      !have($effect`Everything Looks Yellow`),
    equip: { equip: $items`Jurassic Parka`, modes: { parka: "dilophosaur" } },
    do: $skill`Spit jurassic acid`,
  },
];

export function freekillsRemaining(): boolean {
  return freekillSources.some((src) => src.available());
}

export function freekillOutfit(): OutfitSpec {
  const base = baseOutfit(true, false, $monster`burnout`);
  const outfit: OutfitSpec = { ...base, equip: [...(base.equip ?? [])] };

  for (const src of freekillSources) {
    if (!src.available() || !src.equip) continue;

    const eq = src.equip;

    if (eq instanceof Item) {
      outfit.equip!.push(eq);
    } else {
      mergeOutfitSpec(outfit, eq);
    }
  }

  return outfit;
}

function mergeOutfitSpec(base: OutfitSpec, add: OutfitSpec) {
  if (add.equip) {
    base.equip = [...(base.equip ?? []), ...add.equip];
  }

  if (add.modes) {
    base.modes = { ...(base.modes ?? {}), ...add.modes };
  }
}

export function freekillMacro(): Macro {
  let m = Macro.if_($monster`sausage goblin`, Macro.default(useCinch()));

  for (const src of freekillSources) {
    if (!src.available()) continue;

    if (src.do instanceof Skill) m = m.trySkill(src.do);
    else m = m.tryItem(src.do);
  }

  return m.abort();
}
