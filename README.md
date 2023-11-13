# FolgerCS - Seraphiii

`FolgerCS` is a softcore one-day Community Service script meant for looping in Kingdom of Loathing, and designed to work for mid-shiny accounts (i.e. accounts with more than a full standard set) with extra features for mid-to-high shiny accounts (i.e. accounts with a lot more than a full standard set). The user is expected to have a bunch of softcore-permed skills, and at least many IotMs in order to enable this (one of which is the [Clan VIP Lounge key](https://kol.coldfront.net/thekolwiki/index.php/Clan_VIP_Lounge_key)).

Update: Preferences are now done via the relay. If you previously set preferences for this script, they must be reset.

## Installation

To install the script, use the following command in the KoLMafia CLI.

```text
git checkout https://github.com/Ignose/FolgerCS.git release
```

## Usage

For those who are interested in using `FolgerCS` as is, the following sections detail the prerequisites, choices in Valhalla, and required resources.

### Before Ascending

- Ensure that you have the following items (which will be pulled/used during the run): 1x [one-day ticket to Dinseylandfill](https://kol.coldfront.net/thekolwiki/index.php/One-day_ticket_to_Dinseylandfill), 1x [Calzone of Legend](https://kol.coldfront.net/thekolwiki/index.php/Calzone_of_Legend), 1x [Deep Dish of Legend](https://kol.coldfront.net/thekolwiki/index.php/Deep_Dish_of_Legend), 1x [Pizza of Legend](https://kol.coldfront.net/thekolwiki/index.php/Pizza_of_Legend) and 1x [borrowed time](https://kol.coldfront.net/thekolwiki/index.php/Borrowed_time).
  - If you have [any](https://kol.coldfront.net/thekolwiki/index.php/Neverending_Party_invitation_envelope) [one](https://kol.coldfront.net/thekolwiki/index.php/Airplane_charter:_Spring_Break_Beach) [of](https://kol.coldfront.net/thekolwiki/index.php/Airplane_charter:_Conspiracy_Island) [the](https://kol.coldfront.net/thekolwiki/index.php/Airplane_charter:_Dinseylandfill) [scaler](https://kol.coldfront.net/thekolwiki/index.php/Airplane_charter:_That_70s_Volcano) [zones](https://kol.coldfront.net/thekolwiki/index.php/Airplane_charter:_The_Glaciest) or a [Tome of Clip Art](https://kol.coldfront.net/thekolwiki/index.php/Tome_of_Clip_Art), you may want to have a [non-Euclidean angle](https://kol.coldfront.net/thekolwiki/index.php/Non-Euclidean_angle) available (for more efficient powerleveling).
  - If you have both a scaler zone and a [Tome of Clip Art](https://kol.coldfront.net/thekolwiki/index.php/Tome_of_Clip_Art), you may want to have both a [non-Euclidean angle](https://kol.coldfront.net/thekolwiki/index.php/Non-Euclidean_angle) and an [Abstraction: Category](https://kol.coldfront.net/thekolwiki/index.php/Abstraction:_category) before ascending.
- Have any one of the [factory-irregular skeleton](https://kol.coldfront.net/thekolwiki/index.php/Factory-irregular_skeleton), [remaindered skeleton](https://kol.coldfront.net/thekolwiki/index.php/Remaindered_skeleton) or [swarm of skulls](https://kol.coldfront.net/thekolwiki/index.php/Swarm_of_skulls) banished in your [ice house](https://kol.coldfront.net/thekolwiki/index.php/Ice_house).
- Have a [Witchess King](https://kol.coldfront.net/thekolwiki/index.php/Witchess_King) and [red skeleton](https://kol.coldfront.net/thekolwiki/index.php/Red_skeleton) registered in your [combat lover's locket](https://kol.coldfront.net/thekolwiki/index.php/Combat_lover%27s_locket).
- Have at least 10 ascensions so that you can purchase an [all-purpose flower](https://kol.coldfront.net/thekolwiki/index.php/All-purpose_flower) from [The Gift Shop](https://kol.coldfront.net/thekolwiki/index.php/The_Gift_Shop); this should include at least 5 100% familiar runs so that you have the [astral pet sweater](https://kol.coldfront.net/thekolwiki/index.php/Astral_pet_sweater) unlocked.
- Have the following [cookbookbat](https://kol.coldfront.net/thekolwiki/index.php/Cookbookbat) recipes read: [honey bun of Boris](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_honey_bun_of_Boris), [Pete's wiley whey bar](https://kol.coldfront.net/thekolwiki/index.php/Pete%27s_wiley_whey_bar), [Boris's bread](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_Boris%27s_bread), [roasted vegetable of Jarlsberg](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_roasted_vegetable_of_J.), [Pete's rich ricotta](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_Pete%27s_rich_ricotta), [plain calzone](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_plain_calzone) and [baked veggie ricotta](https://kol.coldfront.net/thekolwiki/index.php/Recipe_of_Before_Yore:_baked_veggie_ricotta).
- You should run `folgercs sim` to check if you some (but not all) of the necessary requirements. <br/>
  - Note that while not a lot of requirements are listed as necessary, you are highly encouraged to have most, if not all, of the highly recommended resources (or have shinies to make up for whichever is lacking). <br/>
  - The script may break if you are lacking any particular non-necessary requirement, but it will also not guarantee you success for a one-day ascension if all you have are only the necessary requirements and nothing else. <br/>
  - It will, however, almost certainly break if any of the requirements marked "Necessary" are missing. <br/>
    ![image](https://user-images.githubusercontent.com/98746573/225634734-8792246c-cea1-4f4a-81c5-315b252500d6.png)

### In Valhalla

The [astral six-pack](https://kol.coldfront.net/thekolwiki/index.php/Astral_six-pack) is the only useful astral consumable. The [pet sweater](https://kol.coldfront.net/thekolwiki/index.php/Astral_pet_sweater) allows us to benefit from the [Disgeist](<https://kol.coldfront.net/thekolwiki/index.php/Disgeist_(familiar)>) in the NC test, and the stat-appropriate Canadia sign gives us +11ML from the [Mind Control Device](https://kol.coldfront.net/thekolwiki/index.php/Mind_control_device).

- [astral six-pack](https://kol.coldfront.net/thekolwiki/index.php/Astral_six-pack) from The Deli Lama
- [astral pet sweater](https://kol.coldfront.net/thekolwiki/index.php/Astral_pet_sweater) from Pet Heaven
- [Softcore](https://kol.coldfront.net/thekolwiki/index.php/Ascension#Normal_Difficulty)

### Required IotMs

IotMs are incredibly expensive, and they tend to increase in price the longer they have existed due to the artificial supply limit. Unfortunately, they are incredibly powerful too, and so we will need to rely on them to enable a 1-day SCCS. There is a hard requirement on the [Clan VIP Lounge key](https://kol.coldfront.net/thekolwiki/index.php/Clan_VIP_Lounge_key), as it is one of the few "IotMs" that are recurring (and thus are not gated by the same artificial supply limit as mentioned above), and it provides access to >= 30 Mr. A's-worth of IotMs. <br />
One of the hardest tasks in CS is levelling, due to the limited resources we have access to to optimise for the stat tests (HP, Mus, Myst, Mox). The below therefore is strictly required, but will be insufficient to complete a run of `FolgerCS`.

| IotM                                                                                                | Use         |
| --------------------------------------------------------------------------------------------------- | ----------- |
| [Clan VIP Lounge key](https://kol.coldfront.net/thekolwiki/index.php/Clan_VIP_Lounge_key)           | many things |
| [model train set](https://kol.coldfront.net/thekolwiki/index.php/Model_train_set)                   | xp          |
| [cosmic bowling ball](https://kol.coldfront.net/thekolwiki/index.php/Cosmic_bowling_ball)           | xp + banish |
| [unbreakable umbrella](https://kol.coldfront.net/thekolwiki/index.php/Unbreakable_umbrella)         | many things |
| [combat lover's locket](https://kol.coldfront.net/thekolwiki/index.php/Combat_lover%27s_locket)     | many things |
| [closed-circuit pay phone](https://kol.coldfront.net/thekolwiki/index.php/Closed-circuit_pay_phone) | many things |

### Alternate Run Plan

For the alternative no borrowed time runplan, several things have been modified. This run plan requires:

- A preconfigured trainset before ascension with coal followed by mainstat.
- At least 4 free kills.
- A minimum of 2 legendary pizzas.

For the Asdon Martin runplan, ensure that a borrowed time is available to use.

For any Muscle class, ensure that Prevent Scurvy and Sobriety has been permed.

For any Moxie class, ensure either a balancer potion or olive is available to pull, as the script will not acquire one in run.

## FAQ

### Does this work in HC?

This script is hardcoded to eat the 3x T4 cookbookbat foods (which are all pulled), and it is highly unlikely that you will be able to generate enough ingredients to cook all of them in HC (without any pulls). However, it can be (and has been) done, although this is strongly discouraged.

### Does this script work for other classes?

Yes, with the following caveats:

- For any non-Sauceror class, ensure that ALL CookBookBat foods are disabled before running.

- For any Muscle class, ensure that Prevent Scurvy and Sobriety has been permed.

- For any Moxie class, ensure either a balancer potion or olive is available to pull, as the script will not acquire one in run.

### What IotMs are currently supported and how are they being used by the script?

FolgerCS supports a very large number of IotMs, but, as a generalist script, may not be able to eke out every last benefit from each IotM. For exact specifics, refer to [this list](https://github.com/Ignose/FolgerCS/blob/main/ITEMS.md).

### I'm pretty shiny - can I get the script to save certain resources?

Run `folgercs savedresources` to see a list of preferences you can set to save specific resources. You may also explicitly exclude acquiring certain buffs by typing `set instant_explicitlyExcludedBuffs=<comma-separated effect IDs>` (and confirming that the correct buffs have been excluded in the savedresources printout). <br/>

Similarly, you may exclude using certain familiars during the leveling phase by typing `set instant_explicitlyExcludedFamiliars=<comma-separated familiar IDs>` (and confirming that the correct familiars have been excluded in the savedresources printout). <br/>

### My settings are such that the script no longer uses all 5 softcore pulls. Can I make the script pull and use some other resources?

There is an experimental pull preference that will automatically pull certain items, if available. If not using this pref, pulls should be done manually. This generally should be equipments (e.g. [Staff of the Roaring Hearth](https://kol.coldfront.net/thekolwiki/index.php/Staff_of_the_Roaring_Hearth), [repaid diaper](https://kol.coldfront.net/thekolwiki/index.php/Repaid_diaper), [meteorite necklace](https://kol.coldfront.net/thekolwiki/index.php/Meteorite_necklace) etc), since they would automatically be equipped by the maximizer for various tasks/tests. You may also consider pulling potions (that you may not have access to at your shininess level) which the script uses (e.g. [wasabi marble soda](https://kol.coldfront.net/thekolwiki/index.php/Wasabi_marble_soda), [tobiko marble soda](https://kol.coldfront.net/thekolwiki/index.php/Tobiko_marble_soda), [Yeg's Motel toothbrush](https://kol.coldfront.net/thekolwiki/index.php/Yeg%27s_Motel_toothbrush) etc).

### I'm looking to improve my CS runs - what IotMs and skills should I go for next?

`folgercs sim` groups various resources by how impactful they are. You may also refer to [this slightly more comprehensive list](https://github.com/Pantocyclus/FolgerCS/blob/main/RECOMMENDATIONS.md) for suggestions.

### I don't have a lot of the recommended skills. Will this script still work for me?

If you are decently shiny, probably. The list of skills is meant to give a rough gauge of what is required to prevent the script from failing in general, which could happen for various reasons, including <br/>

- Running out of HP (cannelloni cocoon) <br/>
- Running out of MP (inner sauce, curse of weaksauce, soul saucery) <br/>
- Running out of turns, either from turngen or high turn-taking tests/leveling tasks (almost everything else) <br/>

The script might still work if you have enough IotMs to make up for the loss in turnsaves from lacking various skills (i.e. the skills are listed to indicate that if you have nothing else, you'll need these in order to be able to complete the run).<br/>

### I can't survive the early fights! What do I do?

If you're scripting your own run, try eating the Deep Dish of Legend early (this is already done in the script above). It gives +100%hp and +300%mus, which should help you survive a few more hits from the monsters. However, this does come at the cost of possibly not carrying this buff over to the NC test to buff your Disgeist, thus losing you 5%NC (increasing your turncount by 3).

### What range of shininess is this script suitable for?

This script supports runs from anywhere between 90-180 turns (assuming no manual pulls; correct as of September 2023). If you are able to cap all the stat tests without using any CBB foods (including the T4 ones) because you have access to a bunch of free fights, stat% and xp% buffs, the script now fully supports running without CBB and can be pretty close to optimal (you might even want to consider setting `instant_skip<calzone|deepDish|pizza>OfLegend` prior to running the script to save all 5 pulls for other manual turncutting pulls [or to run it in HC]).

However, you may also consider using one of these other scripts listed [here](https://loathers.github.io/CS-Scripting-Resources.html) instead to eke out that last bit of efficiency. For example, [this personal script](https://github.com/Pantocyclus/InstantHCCS) is able to achieve a ~1/91 HCCS with fewer resources and organs used as compared to the ~1/93 HCCS (yes, HC) that I get with InstantSCCS (with my preferences already set to largely optimize for profits).

### Is there a way to automate the acquisition of the necessary T4 CBB foods/astral choices in Valhalla?

You may find a few community looping scripts/wrappers that would do so for you, such as [here](https://github.com/Prusias-kol/pLooper). At the present moment these are not natively shipped together with FolgerCS.

### Does the script support switching between a clan for VIP Lounge items and a clan with Mother Slime set up for Inner Elf?

The script assumes you are already in the VIP clan. You will have to `set instant_motherSlimeClan=<clan name>` for FolgerCS to attempt grabbing Inner Elf - this may be the same clan as your VIP clan, or a different one altogether.
