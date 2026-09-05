import type { PluginOption } from "./chain-data"
import { stageCategoryMap } from "./stage-category-map"

// The file format GHSFXCompanion (the JUCE plugin) imports. Deliberately
// name/category based rather than exact scanned-plugin identifiers - the
// plugin fuzzy-matches "candidates" against whatever the user actually has
// installed, since a recipe built here has no idea what's on any given
// machine. See GHSFXCompanion/Source/RecipeImport.h for the matching side.
export interface RecipeCandidate {
  brand: string
  plugin: string
}

export interface RecipeStage {
  name: string
  category: string
  candidates: RecipeCandidate[]
}

export interface ChainRecipe {
  chainBuilderRecipe: 1
  name: string
  stages: RecipeStage[]
}

interface RecipeSourceStage {
  id: string
  name: string
  options: PluginOption[]
}

// Stages with no options (e.g. the vocal chain's "do this in your DAW" desync
// step) aren't a plugin slot - nothing for the JUCE side to load, so they're
// left out of the recipe rather than exported as an empty candidate list.
export function buildRecipe(name: string, stages: RecipeSourceStage[]): ChainRecipe {
  return {
    chainBuilderRecipe: 1,
    name,
    stages: stages
      .filter((stage) => stage.options.length > 0)
      .map((stage) => ({
        name: stage.name,
        category: stageCategoryMap[stage.id] ?? "other",
        candidates: stage.options.map((option) => ({ brand: option.brand, plugin: option.plugin })),
      })),
  }
}

export function downloadRecipe(recipe: ChainRecipe) {
  const fileName = recipe.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${fileName}.ghsrecipe.json`
  link.click()

  URL.revokeObjectURL(url)
}
