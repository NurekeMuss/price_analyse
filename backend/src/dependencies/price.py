from src.ml.optimalprice import PricePredictor


_predictor = PricePredictor('./src/ml/train_data/mock_products.csv')


def get_price_predictor() -> PricePredictor:
    return _predictor
