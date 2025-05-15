from src.ml.potd import ProductOfTheDayClassifier

_classifier = ProductOfTheDayClassifier('./backend/src/ml/train_data/mock_products.csv')

def get_product_of_the_day_classifier() -> ProductOfTheDayClassifier:
    return _classifier
