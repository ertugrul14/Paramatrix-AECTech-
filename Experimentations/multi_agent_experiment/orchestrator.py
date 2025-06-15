# orchestrator.py
import os, json, sys
from dotenv import load_dotenv

load_dotenv()

import agents.site_context        as site_ctx
import agents.morphology          as morph
import agents.recipe              as recipe
import agents.parameter_estimation as param_est
import agents.validator           as validator
import agents.codegen             as codegen

def _ensure_dict(x):
    if isinstance(x, str):
        try:    return json.loads(x)
        except: return x
    return x

def run_pipeline(image_source):
    # 1. Site & Context
    site_json = _ensure_dict(site_ctx.run(image_source))

    # 2. Morphology
    morph_json = _ensure_dict(morph.run())

    # 3. Recipe
    recipe_json = _ensure_dict(recipe.run(site_json, morph_json))

    # 4. Parameter Estimation
    params_json = _ensure_dict(param_est.run(image_source, recipe_json))

    # 5. Validation — now non-fatal
    try:
        valid_json = _ensure_dict(validator.run(recipe_json, params_json))
        if not isinstance(valid_json, dict):
            raise Exception(f"Invalid validator output: {type(valid_json)}")
        if not valid_json.get("valid", False):
            # Log but don’t abort
            issues = valid_json.get("issues", [])
            print("⚠️ Validation warnings:", issues)
    except Exception as e:
        print("⚠️ Validation step failed, continuing anyway:", str(e))

    # 6. Code Generation
    js_code = codegen.run(recipe_json, params_json)

    return js_code, json.dumps(params_json, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python orchestrator.py <image_url_or_data_uri>")
        sys.exit(1)
    js, params = run_pipeline(sys.argv[1])

    os.makedirs('static', exist_ok=True)
    with open('static/tower_sketch.js','w') as f: f.write(js)
    with open('static/params.json','w')    as f: f.write(params)
    print("Wrote static/tower_sketch.js and static/params.json")
