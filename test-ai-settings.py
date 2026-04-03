#!/usr/bin/env python3
"""Quick smoke-test: confirms Azure OpenAI settings work by asking a simple question.
HOW TO USE THIS FILE:
pip install openai          # one-time
export AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com/openai/v1/"
export AZURE_OPENAI_DEPLOYMENT_NAME="your-deployment-name"
export AZURE_OPENAI_API_KEY="your-api-key"  # optional if using DefaultAzureCredential
python test-ai-settings.py
"""

import os
import sys

try:
    from openai import OpenAI
except ImportError:
    print("ERROR: openai package not found. Install it with:  pip install openai")
    sys.exit(1)

endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
deployment = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
api_key = os.environ.get("AZURE_OPENAI_API_KEY", "")

if not endpoint:
    print("ERROR: AZURE_OPENAI_ENDPOINT is not set.")
    sys.exit(1)

client = OpenAI(
    base_url=endpoint,
    api_key=api_key
)

print(f"Endpoint:   {endpoint}")
print(f"Deployment: {deployment}")
print(f"Auth:       {'API key' if api_key else 'DefaultAzureCredential'}")
print()
print('Sending: "What\'s the capital of Senegal?"')
print()

response = client.chat.completions.create(
    model=deployment,
    messages=[{"role": "user", "content": "What's the capital of Senegal?"}],
    max_tokens=64,
)

answer = response.choices[0].message.content.strip()
print(f"Response: {answer}")
