import os
import random
from typing import Literal

import dspy
import pandas as pd
from dspy import GEPA, Example, Prediction
from dspy.evaluate.evaluate import EvaluationResult

# logging.basicConfig(level=logging.DEBUG)

lm = dspy.LM("ollama_chat/deepseek-r1:8b", api_base="http://localhost:11434", )
dspy.configure(lm=lm)


class SpamDetection(dspy.Signature):
    """Analyze the reports and determine whether each one is spam or legitimate."""
    description: str = dspy.InputField(description="The report body to analyze.")
    is_spam: Literal["spam", "not_spam"] = dspy.OutputField(description="Whether the report is spam.")
    confidence: float = dspy.OutputField(description="The confidence score of the prediction.", le=1.0, ge=0.0)


def init_dataset() -> tuple[list[Example], list[Example], list[Example]]:
    """Initialize the dataset."""
    dataset = pd.read_csv("../../../ai-analysis-setup/labeled_crime_reports_train_sample.csv")
    dspy_dataset = [
        dspy.Example({
            "description": row["description"],
            "is_spam": row["is_spam"],
            "confidence": row["confidence"],
        }).with_inputs("description")
        for _, row in dataset.iterrows()
    ]
    random.Random(0).shuffle(dspy_dataset)

    n = len(dspy_dataset)
    train_set = dspy_dataset[: int(n * 0.7)]
    val_set = dspy_dataset[int(n * 0.7): int(n * 0.85)]
    test_set = dspy_dataset[int(n * 0.85):]

    return train_set, val_set, test_set


class SpamDetectionService:
    """Service for detecting spam in reports."""

    def __init__(self) -> None:
        """Initialize the spam detection service."""
        self.wanted_keys = ["description"]
        self.classify = dspy.Predict(SpamDetection)

    def _remove_unwanted_keys(self, data: dict | list | str) -> dict | list | str:
        """Recursively remove keys not in data."""
        if isinstance(data, dict):
            return {k: self._remove_unwanted_keys(v) for k, v in data.items() if k in self.wanted_keys}
        elif isinstance(data, list):
            return [self._remove_unwanted_keys(v) for v in data]
        else:
            return data

    def _validate_prediction(self, example, prediction):
        """Validate the prediction against the example."""
        return prediction.is_spam == example.is_spam

    def _validate_prediction_with_feedback(self, example, prediction, trace=None, pred_name=None, pred_trace=None):
        """Validate the prediction against the example."""
        result = (prediction.is_spam == example.is_spam)
        if result:
            feedback = f"You correctly classified the report as {prediction.is_spam}."
        else:
            feedback = f"You incorrectly classified the report as {prediction.is_spam}. The correct answer is {example.is_spam}. Think about how you could have reasoned to get the correct urgency label."
        return dspy.Prediction(
            score=result,
            feedback=feedback,
        )


    def detect_spam(self, report_body: str) -> Prediction:
        """Classify the report as spam or not spam."""
        cleaned_report_body = self._remove_unwanted_keys(report_body)
        answer = self.classify(description=cleaned_report_body)
        print(dspy.inspect_history(1))
        return answer

    def unoptimized_evaluate(self) -> EvaluationResult:
        """Evaluate the model on the given dataset."""
        train_set, val_set, test_set = init_dataset()
        evaluate = dspy.Evaluate(
            devset=test_set,
            metric=self._validate_prediction,
            num_threads=2,
            display_table=True,
            display_progress=True
        )
        return evaluate(self.classify)

    def optimized_evaluate(self):
        """Evaluate the model on the given dataset."""
        train_set, val_set, test_set = init_dataset()
        optimizer = GEPA(
            metric=self._validate_prediction_with_feedback,
            auto="light",
            num_threads=2,
            track_stats=True,
            use_merge=False,
            reflection_lm=dspy.LM(model="gemini/gemini-2.5-flash", temperature=1.0, api_key=os.environ.get("GOOGLE_API_KEY"), num_retries=10)
        )
        optimized_program = optimizer.compile(
            self.classify,
            trainset=train_set,
            valset=val_set,
        )
        evaluate = dspy.Evaluate(
            devset=test_set,
            metric=self._validate_prediction,
            num_threads=2,
            display_table=True,
            display_progress=True
        )
        return optimized_program, evaluate


spam_service = SpamDetectionService()
#
# print(spam_service.detect_spam(
#     """Looking for a new way to lose weight ? Try Tea now! With our natural and organic ingredients, you're sure to see results in no time! Our tea is not only delicious but also healthy because it's loaded with superfoods! Don't wait any longer to be the best version of yourself, sip our skinny tea and make your dreams come true!"""))
optimized_program, evaluate = spam_service.optimized_evaluate()


for name, pred in optimized_program.named_predictors():
    print("================================")
    print(f"Predictor: {name}")
    print("================================")
    print("Prompt:")
    print(pred.signature.instructions)
    print("*********************************")


evaluate(optimized_program)
