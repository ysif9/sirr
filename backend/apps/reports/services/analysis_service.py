import logging
import os
from typing import Literal

import dspy
import yaml
from dspy import Prediction

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


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
        self._setup_model()
        self.wanted_keys = ["description"]
        self.program = ReportAnalyzerModule()
        self._load_optimized_model(model_path)

    def _setup_model(self) -> None:
        """Set up the language model."""
        lm = dspy.LM("ollama_chat/gemma3:4b", api_base="http://localhost:11434")
        dspy.configure(lm=lm)

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
            cleaned_report_body = self._remove_unwanted_keys(report_body)
            logger.info(f"Cleaned report: {cleaned_report_body}")
            yaml_body = yaml.dump(cleaned_report_body)
            logger.info(f"YAML report: {yaml_body}")
            return self.program(description=cleaned_report_body)
        except Exception as e:
            logger.error(f"Failed to analyze report: {e}")
            return Prediction(
                is_spam="not_spam",
                confidence=0.0,
                urgency="low",
                urgency_reasoning="",
                spam_reasoning="",
            )


def example_usage():
    critical_body = {
        "hazard_disclaimer": "If the incident poses an immediate threat to health or life (e.g., chemical spill, fire), call 911 immediately.",
        "location": "Near the east bank of Green River, close to the old mill site.",
        "incident_datetime": "2025-09-24T15:30:00",
        "incident_description": "I observed several large piles of construction debris being dumped near the riverbank. The debris contained broken concrete, insulation material, and what appeared to be chemical containers leaking into the soil and water. Fish were floating dead along the river edge, and the area smelled strongly of solvents.",
        "material_description": "Construction debris, plastic barrels with unknown liquid, several old tires, and broken insulation panels.",
        "is_hazardous": "Yes",
        "suspect_description": "Two men wearing neon vests marked with 'ClearPath Contractors.' One was medium build with dark hair, roughly 40 years old. The other was taller, also dark-haired, about mid-30s.",
        "vehicle_description": "A white dump truck with partial license plate 'XJ-42'. The truck had 'ClearPath Contractors' painted on the side in blue letters.",
        "evidence_upload": "green_river_dumping_photos.zip"
    }
    medium_body = {
        "hazard_disclaimer": "If the incident poses an immediate threat to health or life (e.g., chemical spill, fire), call 911 immediately.",
        "location": "Edge of Pinewood Forest, near the hiking trail entrance by Route 18.",
        "incident_datetime": "2025-09-20T11:45:00",
        "incident_description": "While hiking, I noticed several bags of household trash and electronic waste dumped off the trail into the woods. There was no immediate fire or chemical spill, but animals have been rummaging through the garbage, and some broken electronics may contain harmful substances.",
        "material_description": "Plastic bags filled with mixed garbage, broken television parts, old batteries, and food waste.",
        "is_hazardous": "Unsure",
        "suspect_description": "No individuals seen, but some of the trash bags had store receipts with the name 'J. Thompson' visible.",
        "vehicle_description": "No vehicle observed in the vicinity.",
        "evidence_upload": "pinewood_forest_dumping.jpg"
    }
    spam_body = {
        "hazard_disclaimer": "If the incident poses an immediate threat to health or life (e.g., chemical spill, fire), call 911 immediately.",
        "location": "My house",
        "incident_datetime": "2025-09-25T00:00:00",
        "incident_description": "This man is following me",
        "material_description": "Stardust, cosmic slime, and infinite cheeseburgers",
        "is_hazardous": "No",
        "suspect_description": "A man with dark hair and blue eyes",
        "vehicle_description": "A flying saucer with disco lights and loud music",
        "evidence_upload": "lol_not_a_real_file.gif"
    }
    service = ReportAnalyzerService()
    print(service.analyze_report(spam_body))
    print(dspy.inspect_history(2))


if __name__ == "__main__":
    example_usage()
