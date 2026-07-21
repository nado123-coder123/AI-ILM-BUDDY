"""
Runs the eval dataset through the live RAG pipeline and reports:
  - whether each answer was grounded in retrieved sources
  - the structural hallucination check (see hallucination_check.py)
  - whether personal-fatwa-shaped questions got a disclaimer

Run as: python -m app.testing.run_eval
Requires real ANTHROPIC_API_KEY / Firebase credentials / an ingested
vector index — this hits the live pipeline, it's not a mock test.
For fast, credential-free checks of the hallucination logic itself, see
tests/test_hallucination_check.py instead.
"""
import json
from datetime import datetime, timezone

from app.services.rag_service import answer_question
from app.testing.eval_dataset import EVAL_QUESTIONS
from app.testing.hallucination_check import check_answer


def run() -> dict:
    results = []
    for case in EVAL_QUESTIONS:
        response = answer_question(case["question"], case["language"], session_id="eval-run")
        check = check_answer(response.answer, response.sources)

        results.append(
            {
                "question": case["question"],
                "category": case["category"],
                "answer": response.answer,
                "source_count": len(response.sources),
                "hallucination_check": check,
                "mentions_scholar_consult": "scholar" in response.answer.lower(),
            }
        )

    summary = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "total_questions": len(results),
        "passed_hallucination_check": sum(1 for r in results if r["hallucination_check"]["passed"]),
        "zero_source_answers": sum(1 for r in results if r["source_count"] == 0),
        "results": results,
    }
    return summary


if __name__ == "__main__":
    report = run()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(
        f"\n{report['passed_hallucination_check']}/{report['total_questions']} "
        f"passed structural hallucination check"
    )
