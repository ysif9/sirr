from typing import Literal

import dspy
from dspy import Prediction

lm = dspy.LM("ollama_chat/deepseek-r1:8b", api_base="http://localhost:11434", )
dspy.configure(lm=lm)


class SpamDetection(dspy.Signature):
    """Analyze the reports and determine whether each one is spam or legitimate."""
    description: str = dspy.InputField(description="The report body to analyze.")
    is_spam: Literal["spam", "not_spam"] = dspy.OutputField(description="Whether the report is spam.")
    confidence: float = dspy.OutputField(description="The confidence score of the prediction.")


class SpamDetectionService:
    """Service for detecting spam in reports."""

    def __init__(self) -> None:
        """Initialize the spam detection service."""
        self.redundant_keys = ["location", "date", "time", "datetime", "upload", "file"]
        self.classify = dspy.Predict(SpamDetection)

    def _remove_redundant_keys(self, data: dict | list | str) -> dict | list | str:
        """Recursively remove keys containing redundant words."""
        if isinstance(data, dict):
            cleaned = {}
            for key, value in data.items():
                if not any(word in key.lower() for word in self.redundant_keys):
                    cleaned[key] = self._remove_redundant_keys(value)
            return cleaned
        elif isinstance(data, list):
            return [self._remove_redundant_keys(item) for item in data]
        else:
            return data

    def detect_spam(self, report_body: str) -> Prediction:
        """Classify the report as spam or not spam."""
        cleaned_report_body = self._remove_redundant_keys(report_body)
        answer = self.classify(description=cleaned_report_body)
        return answer


spam_service = SpamDetectionService()

print(spam_service.detect_spam(
    """Looking for a new way to lose weight ? Try Tea now! With our natural and organic ingredients, you're sure to see results in no time! Our tea is not only delicious but also healthy because it's loaded with superfoods! Don't wait any longer to be the best version of yourself, sip our skinny tea and make your dreams come true!"""))
