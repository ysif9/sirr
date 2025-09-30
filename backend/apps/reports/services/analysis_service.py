"""
This module contains the ReportAnalyzerService class, which is responsible for analyzing reports.
"""
import logging
import os
from typing import Literal

import dspy
import yaml
from dspy import Prediction

logger = logging.getLogger(__name__)

lm = dspy.LM("ollama_chat/gemma3:4b", api_base="http://ollama:11434")
dspy.configure(lm=lm)

class SpamDetection(dspy.Signature):
    """Read the provided Report and determine whether each one is spam or legitimate."""
    description: str = dspy.InputField(description="The report body to analyze.")
    is_spam: Literal["spam", "not_spam"] = dspy.OutputField(description="Whether the report is spam.")
    confidence: float = dspy.OutputField(description="The confidence score of the prediction.", le=1.0, ge=0.0)


class UrgencyDetection(dspy.Signature):
    """Read the provided Report and determine the urgency."""
    description: str = dspy.InputField(description="The report body to analyze.")
    urgency: Literal['low', 'medium', 'high', 'critical'] = dspy.OutputField(
        description="The urgency of the report for criminal investigation.")


class ReportAnalyzerModule(dspy.Module):
    """Analyze the report and return the urgency and spam prediction."""

    def __init__(self) -> None:
        """Initialize the report analyzer."""
        super().__init__()
        self.spam_module = dspy.ChainOfThought(SpamDetection)
        self.urgency_module = dspy.ChainOfThought(UrgencyDetection)

    def forward(self, description: str):
        """Analyze the report and return the urgency and spam prediction."""
        urgency = self.urgency_module(description=description)
        spam = self.spam_module(description=description)

        return dspy.Prediction(
            urgency=urgency.urgency,
            urgency_reasoning=urgency.reasoning,
            is_spam=spam.is_spam,
            spam_reasoning=spam.reasoning,
            confidence=spam.confidence,
        )


class ReportAnalyzerService:
    """Service for detecting spam in reports."""

    _instance = None

    def __new__(cls, *args: object, **kwargs: object) -> "ReportAnalyzerService":
        """Ensure only one instance of the service exists."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize the spam detection service."""
        if not hasattr(self, "_initialized"):
            self._redundant_keys = ["upload"]
            self.program = ReportAnalyzerModule()
            self._load_optimized_model()
            self._initialized = True


    def _load_optimized_model(self) -> None:
        """Load the optimized model if available."""
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, "optimized_program.json")

        if os.path.exists(model_path):
            try:
                self.program.load(model_path)
                logger.info(f"Loaded optimized model from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load optimized model: {e}. Using base model.")
        else:
            logger.info("No optimized model found. Using base model.")

    def _remove_redundant_keys(self, data: dict | list | str) -> dict | list | str:
        """Recursively remove keys containing redundant words."""
        if isinstance(data, dict):
            cleaned = {}
            for key, value in data.items():
                if not any(word in key.lower() for word in self._redundant_keys):
                    cleaned[key] = self._remove_redundant_keys(value)
            return cleaned
        elif isinstance(data, list):
            return [self._remove_redundant_keys(item) for item in data]
        else:
            return data

    def analyze_report(self, report_body: dict | list | str) -> Prediction:
        """
        Analyze a report for spam detection and urgency classification.

        Args:
            report_body: The text content of the report to analyze

        Returns:
            Prediction containing is_spam, confidence, reasoning and urgency
        """
        try:
            logger.info(f"Analyzing report: {report_body}")
            cleaned_report_body = self._remove_redundant_keys(report_body)
            yaml_body = yaml.dump(cleaned_report_body)
            logger.info(f"Cleaned report: {yaml_body}")
            prog = self.program(description=yaml_body)
            logger.debug(dspy.inspect_history(2))
            return prog
        except Exception as e:
            logger.error(f"Failed to analyze report: {e}")
            return Prediction(
                is_spam="not_spam",
                confidence=0.0,
                urgency="low",
                urgency_reasoning="",
                spam_reasoning="",
            )
