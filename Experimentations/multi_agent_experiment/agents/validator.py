# agents/validator.py
import os, json
from dotenv import load_dotenv
load_dotenv()

import openai
from prompts.templates import VALIDATOR_AGENT

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run(recipe_json, params_json):
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"user","content": VALIDATOR_AGENT},
            {"role":"user","content": json.dumps(recipe_json)},
            {"role":"user","content": json.dumps(params_json)}
        ],
        response_format={"type":"json_object"}
    )
    return resp.choices[0].message.content
