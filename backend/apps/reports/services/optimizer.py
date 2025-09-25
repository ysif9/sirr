import os
import random
from datetime import datetime

import dspy
import pandas as pd
from dspy import GEPA, Example, Prediction

from apps.reports.services.analysis_service import ReportAnalyzerModule


def init_dataset() -> tuple[list[Example], list[Example], list[Example]]:
    """Initialize the dataset."""
    dataset = pd.read_csv("../../../ai-analysis-setup/labeled_crime_reports.csv")
    dspy_dataset = [
        dspy.Example({
            "description": row["description"],
            "is_spam": row["is_spam"],
            "confidence": row["confidence"],
            "urgency": row["urgency"],
        }).with_inputs("description")
        for _, row in dataset.iterrows()
    ]
    random.Random(0).shuffle(dspy_dataset)

    n = len(dspy_dataset)
    train_set = dspy_dataset[: int(n * 0.7)]
    val_set = dspy_dataset[int(n * 0.7): int(n * 0.85)]
    test_set = dspy_dataset[int(n * 0.85):]

    return train_set, val_set, test_set


class ModelOptimizer:
    """Handles model optimization and evaluation."""

    def __init__(self) -> None:
        """Initialize the optimizer."""
        self.program = ReportAnalyzerModule()

    def _score_spam(self, example: Example, prediction: Prediction) -> float:
        """score the prediction against the example."""
        return 1.0 if prediction.is_spam == example.is_spam else 0.0

    def _score_urgency(self, example: Example, prediction: Prediction) -> float:
        """Score the prediction against the example."""
        return 1.0 if prediction.urgency == example.urgency else 0.0

    def _metric(self, example: Example, prediction: Prediction, trace=None, pred_name=None, pred_trace=None) -> float:
        """Compute a score based on agreement between prediction and gold standard for spam and urgency."""

        score_urgency = self._score_urgency(example, prediction)
        score_spam = self._score_spam(example, prediction)
        return (score_urgency + score_spam) / 2

    def _feedback_urgency(self, gold_urgency: str, prediction: str) -> tuple[str, float]:
        """
        Generate feedback for the urgency module.
        """
        score = 1.0 if gold_urgency == prediction else 0.0
        if gold_urgency == prediction:
            feedback = f"You correctly classified the urgency of the message as `{gold_urgency}`. This message is indeed of `{gold_urgency}` urgency."
        else:
            feedback = f"You incorrectly classified the urgency of the message as `{prediction}`. The correct urgency is `{gold_urgency}`. Think about how you could have reasoned to get the correct urgency label."
        return feedback, score

    def _feedback_spam(self, gold_example: str, prediction: str) -> tuple[str, float]:
        """Validate the prediction against the example."""
        result = (prediction == gold_example)
        if result:
            feedback = f"You correctly classified the report as {prediction}."
        else:
            feedback = f"You incorrectly classified the report as {prediction}. The correct answer is {gold_example}. Think about how you could have reasoned to get the correct urgency label."
        return feedback, result

    def _metric_with_feedback(self, example: Example, prediction: Prediction, trace=None, pred_name=None,
                              pred_trace=None) -> Prediction:
        """
        Computes a score based on agreement between prediction and gold standard for spam and urgency.
        Optionally provides feedback text for a specific predictor module, using the same comparison logic as the score.
        Returns a dspy.Prediction with score (float) and feedback (str).
        """

        # Compute feedback and scores for all modules
        fb_urgency, score_urgency = self._feedback_urgency(example['urgency'], prediction.urgency)
        fb_spam, score_spam = self._feedback_spam(example['is_spam'], prediction.is_spam)

        # Overall score: average of the three accuracies
        total = (score_urgency + score_spam) / 2

        if pred_name is None:
            return total

        elif pred_name == 'urgency_module.predict':
            feedback = fb_urgency
        elif pred_name == 'spam_module.predict':
            feedback = fb_spam

        return dspy.Prediction(score=total, feedback=feedback)

    def optimize_model(self) -> dspy.Module:
        """Optimize the model using GEPA."""
        train_set, val_set, test_set = init_dataset()

        optimizer = GEPA(
            metric=self._metric_with_feedback,
            auto="medium",
            num_threads=4,
            track_stats=True,
            use_merge=False,
            reflection_lm=dspy.LM(
                model="gemini/gemini-2.5-flash",
                temperature=1.0,
                api_key=os.environ.get("GOOGLE_API_KEY"),
                num_retries=5
            )
        )

        optimized_program = optimizer.compile(
            self.program,
            trainset=train_set,
            valset=val_set,
        )

        path = f"optimized_program_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        optimized_program.save(path)

        return optimized_program

# def dag_to_dot(parent_program_for_candidate, dominator_program_ids, best_program_idx, full_eval_scores):
#     dot_lines = [
#         "digraph G {",
#         "    node [style=filled, shape=circle, fontsize=50];"
#     ]
#     n = len(parent_program_for_candidate)
#     # Set up nodes with colors and scores in labels
#     for idx in range(n):
#         score = full_eval_scores[idx]
#         label = f"{idx}\\n({score:.2f})"
#         if idx == best_program_idx:
#             dot_lines.append(f'    {idx} [label="{label}", fillcolor=cyan, fontcolor=black];')
#         elif idx in dominator_program_ids:
#             dot_lines.append(f'    {idx} [label="{label}", fillcolor=orange, fontcolor=black];')
#         else:
#             dot_lines.append(f'    {idx} [label="{label}"];')
#
#     # Set up edges
#     for child, parents in enumerate(parent_program_for_candidate):
#         for parent in parents:
#             if parent is not None:
#                 dot_lines.append(f'    {parent} -> {child};')
#
#     dot_lines.append("}")
#     return "\n".join(dot_lines)
#
#
# def run_optimized():
#     spam_service = ReportAnalyzerService()
#     optimized_program, evaluate = spam_service.optimized_evaluate()
#
#     for name, pred in optimized_program.named_predictors():
#         print("================================")
#         print(f"Predictor: {name}")
#         print("================================")
#         print("Prompt:")
#         print(pred.signature.instructions)
#         print("*********************************")
#
#     evaluate(optimized_program)
#
#     pareto_front_programs = find_dominator_programs(optimized_program.detailed_results.per_val_instance_best_candidates,
#                                                     optimized_program.detailed_results.val_aggregate_scores)
#
#     print(dag_to_dot(
#         optimized_program.detailed_results.parents,
#         pareto_front_programs,
#         optimized_program.detailed_results.best_idx,
#         optimized_program.detailed_results.val_aggregate_scores
#     ))
#
# def compare():
#     dataset = pd.read_csv("../../../ai-analysis-setup/labeled_crime_reports.csv")
#     full_dataset = [
#         dspy.Example({
#             "description": row["description"],
#             "is_spam": row["is_spam"],
#             "confidence": row["confidence"],
#             "urgency": row["urgency"],
#         }).with_inputs("description")
#         for _, row in dataset.iterrows()
#     ]
#     print("hi")
#     spam_service = ReportAnalyzerService()
#     optimized_program, evaluate = spam_service.optimized_evaluate()
#     normal_spam_service = ReportAnalyzerService()
#     evaluate = dspy.Evaluate(
#         devset=full_dataset,
#         metric=spam_service._metric,
#         num_threads=4,
#         display_table=False,
#         display_progress=True,
#         provide_traceback=True
#     )
#     print("hi2")
#     evaluate(optimized_program)
#     evaluate(normal_spam_service.program)
