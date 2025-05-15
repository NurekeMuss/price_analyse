from src.ml.optimalprice import PricePredictor

_predictor = PricePredictor('./backend/src/ml/data/mock_products.csv')

def get_price_predictor() -> PricePredictor:
    return _predictor
