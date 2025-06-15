# agents/morphology.py
import os
from dotenv import load_dotenv
load_dotenv()

import openai
from prompts.templates import MORPHOLOGY_AGENT

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run():
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content": MORPHOLOGY_AGENT}],
        response_format={"type":"json_object"}
    )
    return resp.choices[0].message.content
