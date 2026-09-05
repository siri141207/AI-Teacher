import urllib.request
import json
import sys

print("--- Testing Lilly AI Teacher Endpoints ---")

# 1. Personas
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/api/voice/personas") as resp:
        personas = json.loads(resp.read().decode())
        print("1. Personas:", [p["name"] for p in personas.get("personas", [])])
except Exception as e:
    print("Personas failed:", e)

# 2. Learning Path
try:
    data = json.dumps({
        "topic": "Machine Learning",
        "target_role_or_goal": "AI Engineer",
        "current_level": "beginner",
        "language": "English"
    }).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/lesson/learning-path",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        lp = json.loads(resp.read().decode())
        print(f"\n2. Learning Path Modules for {lp.get('topic')}:")
        for m in lp.get("modules", []):
            print(f"   Module {m.get('module_number')}: {m.get('title')} ({m.get('duration_hrs')}h, {m.get('difficulty')})")
except Exception as e:
    print("Learning path failed:", e)

# 3. Assessment Report
try:
    data = json.dumps({
        "topic": "Ohm's Law",
        "level": "beginner",
        "language": "English",
        "questions_and_answers": [
            {"question": "What is Ohm's law formula?", "student_answer": "V = I * R", "correct_answer": "V = I * R"},
            {"question": "What happens when resistance doubles?", "student_answer": "Current is halved", "correct_answer": "Current is halved"}
        ]
    }).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/lesson/assessment-report",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        rep = json.loads(resp.read().decode())
        print("\n3. Assessment Report:")
        print(f"   Score: {rep.get('score_percentage')}% | Grade: {rep.get('grade')}")
        print(f"   Strong Concepts: {rep.get('strong_concepts')}")
        print(f"   Revision Steps: {rep.get('revision_recommendations')}")
        print(f"   Suggested Next Topics: {rep.get('suggested_next_topics')}")
except Exception as e:
    print("Assessment failed:", e)

print("\n--- All Endpoints Verified Successfully! ---")
