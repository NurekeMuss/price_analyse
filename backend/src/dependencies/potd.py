from src.ml.potd import ProductsOfTheDayClassifier

_classifier = ProductsOfTheDayClassifier('./src/ml/train_data/mock_products.csv')

def get_products_of_the_day_classifier() -> ProductsOfTheDayClassifier:
    return _classifier
