import os
import random
import time

import dspy
import pandas as pd
from datasets import load_dataset
from tqdm import tqdm

from apps.reports.services.analysis_service import ReportAnalyzerService


def load_crime_reports_dataset() -> None:
    """Load the Crime Reports dataset and save a sample as CSV."""
    dataset = load_dataset("Dev523/Crime-Reports-Dataset")

    # --- Sample 300 random rows from the train set ---
    train_size = len(dataset["train"])
    train_indices = random.sample(range(train_size), 300)
    train_sample = dataset["train"].select(train_indices)

    # --- Sample 60 random rows from the test set ---
    test_size = len(dataset["test"])
    test_indices = random.sample(range(test_size), 60)
    test_sample = dataset["test"].select(test_indices)

    train_sample.to_csv("crime_reports_train_sample.csv", index=False)
    test_sample.to_csv("crime_reports_test_sample.csv", index=False)

    print("\n Saved 300 train samples and 60 test samples as CSV.")


def label_dataset(max_retries: int = 5) -> None:
    """Label the dataset using teacher model,
    retrying on rate limit errors with progress bar."""

    spam_service = ReportAnalyzerService()

    # Load dataset
    data = pd.read_csv("crime_dataset/crime_reports_train_sample.csv")
    descriptions = pd.DataFrame(data["crimeaditionalinfo"])

    print("Using teacher model...")

    results = []
    with dspy.context(
        lm=dspy.LM(
            "gemini/gemini-2.5-flash",
            api_key=os.environ.get("GOOGLE_API_KEY"),
        )
    ):
        for text in tqdm(
            descriptions["crimeaditionalinfo"],
            desc="Labeling dataset",
            unit="row",
        ):
            attempt = 0
            while attempt < max_retries:
                try:
                    pred = spam_service.analyze_report(text)
                    results.append(pred)
                    break
                except Exception as e:
                    if "limit" in str(e).lower():
                        attempt += 1
                        wait_time = 60
                        print(
                            f"\n Rate limit hit. Sleeping {wait_time}s "
                            f"(Attempt {attempt}/{max_retries})"
                        )
                        time.sleep(wait_time)
                    else:
                        results.append(None)
                        break  # stop retry loop for non-rate-limit error

    # Convert results into DataFrame columns
    descriptions["is_spam"] = [
        r.is_spam if r else None for r in results
    ]
    descriptions["confidence"] = [
        r.confidence if r else None for r in results
    ]
    descriptions["urgency"] = [
        r.urgency if r else None for r in results
    ]

    descriptions.to_csv("labeled_crime_reports.csv", index=False)
    print("\n Saved labeled dataset as CSV.")

if __name__ == "__main__":
    label_dataset()
