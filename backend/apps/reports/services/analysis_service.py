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

    def __init__(self, model_path: str = "optimized_program.json") -> None:
        """Initialize the spam detection service."""
        # self._setup_model()
        self.wanted_keys = ["description", "reason_for_check"]
        self.program = ReportAnalyzerModule()
        self._load_optimized_model(model_path)


    def _load_optimized_model(self, model_path: str) -> None:
        """Load the optimized model if available."""
        if os.path.exists(model_path):
            try:
                self.program.load(model_path)
                logger.info(f"Loaded optimized model from {model_path}")
            except Exception as e:
                logger.warning(f"Failed to load optimized model: {e}. Using base model.")
        else:
            logger.info("No optimized model found. Using base model.")

    def _remove_unwanted_keys(self, data: dict | list | str) -> dict | list | str:
        """Recursively remove keys not containing any wanted key substring."""
        if isinstance(data, dict):
            return {
                k: self._remove_unwanted_keys(v)
                for k, v in data.items()
                if any(wanted_key.lower() in k.lower() for wanted_key in self.wanted_keys)
            }
        elif isinstance(data, list):
            cleaned = [self._remove_unwanted_keys(v) for v in data]
            # Filter out "empty" results
            return [x for x in cleaned if x not in ({}, [], None, "")]
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
            # cleaned_report_body = self._remove_unwanted_keys(report_body)
            yaml_body = yaml.dump(report_body)
            logger.info(f"Cleaned report: {yaml_body}")
            prog = self.program(description=yaml_body)
            logger.info(dspy.inspect_history(2))
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
