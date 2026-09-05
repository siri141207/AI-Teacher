from dotenv import load_dotenv
load_dotenv()

import os
import time

from google import genai
from google.genai import types


# ============================================================
# GEMINI AI TUTOR - FAST RESPONSE TEST
# ============================================================


# ------------------------------------------------------------
# 1. LOAD API KEY
# ------------------------------------------------------------

api_key = os.getenv("GEMINI_API_KEY")

print("API KEY FOUND:", bool(api_key))

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY was not found. "
        "Please check your .env file."
    )


# ------------------------------------------------------------
# 2. CREATE GEMINI CLIENT
# ------------------------------------------------------------

client = genai.Client(
    api_key=api_key
)


# ------------------------------------------------------------
# 3. FAST RESPONSE CONFIGURATION
# ------------------------------------------------------------

config = types.GenerateContentConfig(

    # Disable model thinking for faster responses
    thinking_config=types.ThinkingConfig(
        thinking_budget=0
    ),

    # Limit response length
    max_output_tokens=300,

    # Keep responses predictable
    temperature=0.2,
)


# ------------------------------------------------------------
# 4. AI TUTOR QUESTION
# ------------------------------------------------------------

question = """
Explain Newton's First Law to a beginner.

Use very simple language.
Give one short example.
Keep the answer concise.
"""


# ------------------------------------------------------------
# 5. START TIMER
# ------------------------------------------------------------

start_time = time.perf_counter()

first_token_time = None
full_response = ""


print()
print("=" * 60)
print("AI TUTOR")
print("=" * 60)
print("Sending request to Gemini...")
print()


# ------------------------------------------------------------
# 6. STREAM RESPONSE
# ------------------------------------------------------------

try:

    stream = client.models.generate_content_stream(

        model="gemini-2.5-flash",

        contents=question,

        config=config
    )


    # --------------------------------------------------------
    # RECEIVE RESPONSE CHUNKS
    # --------------------------------------------------------

    for chunk in stream:

        if not chunk.text:
            continue


        # ----------------------------------------------------
        # FIRST TOKEN / FIRST RESPONSE
        # ----------------------------------------------------

        if first_token_time is None:

            first_token_time = time.perf_counter()

            ttft = (
                first_token_time
                - start_time
            )

            print(
                f"⚡ First response received in: "
                f"{ttft:.2f} seconds"
            )

            print()
            print("Gemini:")
            print()


        # ----------------------------------------------------
        # SHOW TEXT IMMEDIATELY
        # ----------------------------------------------------

        print(
            chunk.text,
            end="",
            flush=True
        )

        full_response += chunk.text


# ------------------------------------------------------------
# 7. HANDLE ERRORS
# ------------------------------------------------------------

except Exception as error:

    print()
    print()
    print("=" * 60)
    print("❌ GEMINI ERROR")
    print("=" * 60)
    print(error)

    raise


# ------------------------------------------------------------
# 8. END TIMER
# ------------------------------------------------------------

end_time = time.perf_counter()

total_time = (
    end_time
    - start_time
)


# ------------------------------------------------------------
# 9. PERFORMANCE RESULTS
# ------------------------------------------------------------

print()
print()
print("=" * 60)
print("PERFORMANCE RESULTS")
print("=" * 60)


if first_token_time is not None:

    ttft = (
        first_token_time
        - start_time
    )

    print(
        f"Time to First Token : "
        f"{ttft:.2f} seconds"
    )

else:

    print(
        "Time to First Token : "
        "No response received"
    )


print(
    f"Total Response Time : "
    f"{total_time:.2f} seconds"
)


print(
    f"Characters Generated : "
    f"{len(full_response)}"
)


# ------------------------------------------------------------
# 10. SPEED CHECK
# ------------------------------------------------------------

print()
print("=" * 60)
print("SPEED CHECK")
print("=" * 60)


if first_token_time is None:

    print("❌ No response received.")

elif ttft <= 5:

    print(
        "🚀 EXCELLENT!"
    )

    print(
        "First response is under 5 seconds."
    )

elif ttft <= 10:

    print(
        "✅ GOOD!"
    )

    print(
        "First response is under 10 seconds."
    )

elif ttft <= 15:

    print(
        "⚠️ SLOW"
    )

    print(
        "First response is between 10-15 seconds."
    )

else:

    print(
        "❌ VERY SLOW"
    )

    print(
        "First response is taking more than 15 seconds."
    )


print("=" * 60)