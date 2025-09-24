import random

from datasets import load_dataset


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

def label_dataset_spam() -> None:
    """Label the dataset as spam or not spam using teacher model."""
    pass
