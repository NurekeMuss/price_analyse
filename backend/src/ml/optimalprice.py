import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


class PricePredictor:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.models = {
            "LinearRegression": LinearRegression(),
            "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=100, random_state=42),
        }
        self.best_model = None
        self.X_columns = None
        self._train()

    def _load_data(self):
        df = pd.read_csv(self.csv_path)
        df['description_length'] = df['description'].apply(len)
        df['is_active'] = df['is_active'].astype(int)
        y = df['price']
        X = df.drop(columns=['name', 'description', 'image_url', 'price'])
        X = pd.get_dummies(X, drop_first=True)
        return X, y, df

    def _train(self):
        X, y, _ = self._load_data()
        self.X_columns = X.columns
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        best_score = -np.inf
        for name, model in self.models.items():
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

            r2 = r2_score(y_test, preds)
            if r2 > best_score:
                best_score = r2
                self.best_model = model

    def recommend_price(self, sample: dict) -> float:
        sample_df = pd.DataFrame([sample])
        sample_df['description_length'] = sample_df['description'].apply(len)
        sample_df['is_active'] = sample_df['is_active'].astype(int)
        sample_df = sample_df.drop(columns=['name', 'description', 'image_url', 'price'], errors='ignore')
        sample_df = pd.get_dummies(sample_df)
        sample_df = sample_df.reindex(columns=self.X_columns, fill_value=0)

        return float(self.best_model.predict(sample_df)[0])
