# agents/site_context.py
import os
from dotenv import load_dotenv
load_dotenv()

import openai
from prompts.templates import SITE_AGENT

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def run(image_url):
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role":"user",
            "content":[
                {"type":"text",      "text": SITE_AGENT},
                {"type":"image_url", "image_url": {"url": image_url}}
            ]
        }],
        response_format={"type":"json_object"}
    )
    return resp.choices[0].message.content
