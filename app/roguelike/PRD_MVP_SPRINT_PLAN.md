# Roguelike Narrative MVP Sprint Plan

## Goal
- Turn current run flow into a narrative run using:
  - PRD-02 Theme Marks
  - PRD-04 Theme Sequence Arc
  - PRD-06 Survivor/Cultist Relationship
  - PRD-08 Omen Presentation Package
  - PRD-09 Boss 2-Phase Narrative Battle

## Scope
- Keep existing combat loop.
- Add narrative state, branching, and clear phase transitions.
- Ship in 4 sprints with feature flags.

## Feature Flags
- `NEXT_PUBLIC_NARRATIVE_MARKS=on|off`
- `NEXT_PUBLIC_NARRATIVE_ARC=on|off`
- `NEXT_PUBLIC_NARRATIVE_RELATION=on|off`
- `NEXT_PUBLIC_NARRATIVE_OMEN=on|off`
- `NEXT_PUBLIC_NARRATIVE_BOSS2=on|off`

## Analytics Event Keys
- `run_start`
- `theme_mark_gain`
- `theme_mark_set_complete`
- `relation_change`
- `arc_route_lock`
- `arc_route_complete`
- `omen_stage_enter`
- `omen_symptom_triggered`
- `boss_phase_transition`
- `boss_phase_clear`
- `run_end`

Payload common fields:
- `run_id`, `floor`, `theme_id`, `turns`, `player_level`, `hp_ratio`

## Sprint 1 (Foundation + PRD-08)
### Work
1. Add narrative run state.
2. Add omen text dictionary per theme.
3. Add omen stage transitions and log templates.
4. Add metrics emitter hook.

### Files
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/model.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-init.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-movement.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-renderer.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/content.ts`

### DoD
- 400/450/480/500 turn omen stages visibly different.
- Same-run omen log repetition rate < 30%.
- No build/lint break.

## Sprint 2 (PRD-02 + PRD-06)
### Work
1. Implement mark gain rules (theme clear/event/boss).
2. Implement mark set recipes and effects.
3. Add relation scores: `survivor`, `cultist`, `betrayal`.
4. Apply relation effects to shop/ambush/support weights.

### Files
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/model.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/events.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-actions.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/dungeon.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/progression.ts`

### Default Values
- Mark gain:
  - theme clear `+1`
  - theme boss kill `+2`
  - special event success `+1`
- Relation delta examples:
  - rescue `survivor +2`
  - plunder `betrayal +2`
  - cult pact `cultist +2`

### DoD
- At least 6 mark sets active.
- At least 10 events modify relation.
- Relation score changes real probabilities.

## Sprint 3 (PRD-04)
### Work
1. Add sequence route matcher using `themeHistory`.
2. Lock route tags mid-run.
3. Add route-specific event weights and ending text.

### Files
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/progression.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/events.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-renderer.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/content.ts`

### Initial Route Set
- `ruins -> deep_sea -> rlyeh` : sunk_prophecy
- `forest -> swamp -> crypt` : rot_covenant
- `machine_factory -> bunker -> cyber_server` : iron_protocol
- `ice -> clocktower -> void_library` : frozen_time
- `lava -> fuel_mine -> iron_fortress` : furnace_oath
- `sunken_temple -> eldritch_depths -> rlyeh` : abyssal_call

### DoD
- 6 routes detectable and logged.
- Route-specific ending text appears on win/lose summary.

## Sprint 4 (PRD-09)
### Work
1. Add boss phase state and transition trigger.
2. Add phase-2 only patterns:
   - summon add
   - arena tile mutation
   - scripted line
3. Couple phase lines with mark/route/relation context.

### Files
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/model.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-combat.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/dungeon.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/game-renderer.ts`
- `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/content.ts`

### Default Trigger
- Phase 2 at boss HP <= 55%
- Optional early trigger if specific mark-set complete.

### DoD
- 3+ bosses have distinct phase-2 behavior.
- Transition log and behavior always match.

## KPI Measurement Plan
- Theme event replay rate:
  - `% users with same theme event family triggered >=2 in separate runs`
- Avg session length:
  - `avg(turns_per_run)`, `avg(minutes_per_run)`
- Route completion:
  - `% runs reaching route_complete`
- Branch diversity:
  - Shannon entropy over relation choice labels
- Omen immersion proxy:
  - turn survival from omen stage 1 to stage 3
- Boss fairness:
  - phase1->phase2 death ratio and clear ratio gap

## Risk / Guardrails
- Over-complex state drift:
  - keep single source state in `GameState`.
- Log spam:
  - per-stage cooldown and duplicate suppression.
- Balance spike:
  - tie all numeric multipliers to presets in `/Users/jinn/WebstormProjects/blog-front/app/roguelike/(domain)/balance-presets.ts`.

