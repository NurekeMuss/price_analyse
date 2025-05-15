import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


class ProductOfTheDayClassifier:
    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.features = [
            'price', 'quantity', 'is_active', 'views',
            'purchases', 'rating', 'margin', 'description_length'
        ]
        self.df = None
        self._train()

    def _load_data(self):
        df = pd.read_csv(self.csv_path)

        np.random.seed(42)
        df['views'] = np.random.randint(100, 1000, size=len(df))
        df['purchases'] = np.random.randint(10, 200, size=len(df))
        df['rating'] = np.round(np.random.uniform(1.0, 5.0, size=len(df)), 1)
        df['margin'] = np.round(np.random.uniform(0.1, 0.5, size=len(df)), 2) * df['price']
        df['description_length'] = df['description'].apply(len)
        df['is_active'] = df['is_active'].astype(int)

        df['product_of_the_day'] = (
            (df['views'] > df['views'].median()) &
            (df['purchases'] > df['purchases'].median()) &
            (df['rating'] > 4.0) &
            (df['margin'] > df['margin'].median())
        ).astype(int)

        return df

    def _train(self):
        df = self._load_data()
        X = df[self.features]
        y = df['product_of_the_day']

        self.model.fit(X, y)
        self.df = df

    def get_product_of_the_day(self):
        X_all = self.df[self.features]
        self.df['prediction'] = self.model.predict(X_all)
        top_products = self.df[self.df['prediction'] == 1]
        return top_products.to_dict(orient="records")
