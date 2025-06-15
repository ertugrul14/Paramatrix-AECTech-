# agents/recipe.py
import os, json
from dotenv import load_dotenv
load_dotenv()

import openai
from prompts.templates import RECIPE_AGENT

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run(site_json, morph_json):
    # Turn any dict inputs into JSON strings
    site_str  = json.dumps(site_json)
    morph_str = json.dumps(morph_json)

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"user", "content": RECIPE_AGENT},
            {"role":"user", "content": site_str},
            {"role":"user", "content": morph_str}
        ],
        response_format={"type":"json_object"}
    )
    return resp.choices[0].message.content
