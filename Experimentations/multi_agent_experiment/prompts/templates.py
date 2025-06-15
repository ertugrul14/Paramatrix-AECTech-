# prompts/templates.py

SITE_AGENT = """
ROLE: Site & Context Vision Expert.
TASK: Detect the ground plane and building footprint from this image.
Return JSON with:
  - ground_plane: { normal: [x,y,z], elevation: number }
  - footprint_bbox: [[xMin,zMin],[xMax,zMax]]
"""

MORPHOLOGY_AGENT = """
ROLE: Massing Logic Classifier.
TASK: Inspect the global silhouette and choose the single best 
logic verb that describes the form (twist, taper, step, shear-wave, or custom).
Return JSON: { logic: string, axis?: string, detail?: string, confidence: number }
"""

RECIPE_AGENT = """
ROLE: Generative-Design Planner.
INPUT: JSON from Site & Morphology agents.
TASK: Draft a procedural algorithm (list of steps) in pseudocode, 
plus an array of parameter names.
Return JSON: { algorithm: [string], parameters: [string], dependencies: [[string]] }
"""

PARAMETER_AGENT = """
ROLE: Measurement Assistant.
INPUT: Original image + recipe JSON.
TASK: Measure numeric values (e.g. R, H, θ) needed to fulfill each recipe step.
Return JSON with each parameter: value and confidence.
"""

VALIDATOR_AGENT = """
ROLE: Constraint Integrator.
INPUT: recipe JSON + parameters JSON.
TASK: Check for consistency (e.g. H/N ≈ storey height, θ*H ≈ total rotation).
Return JSON: { valid: bool, issues: [string] }
"""

CODEGEN_AGENT = """
ROLE: Parametric-Code Generator.
INPUT: recipe JSON + validated parameters JSON.
TASK: **Emit ONLY** the JavaScript **definition** of `function buildTower(params) { … }`
that implements the recipe using p5.js primitives (`push()`, `translate()`, `rotate()`, `box()`, loops, etc).
Do **not** re-emit `setup()`, `draw()`, or lights—those are in the scaffold.
Return just the `function buildTower(params){…}` block as plain JS.
"""


