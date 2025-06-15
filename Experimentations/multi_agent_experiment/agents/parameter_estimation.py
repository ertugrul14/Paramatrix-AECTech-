# agents/parameter_estimation.py
import os, json
from dotenv import load_dotenv
load_dotenv()

import openai
from prompts.templates import PARAMETER_AGENT

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run(image_url, recipe_json):
    recipe_str = json.dumps(recipe_json)

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text",      "text": PARAMETER_AGENT},
                {"type": "text",      "text": recipe_str},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }],
        response_format={"type":"json_object"}
    )
    return resp.choices[0].message.content
