# predictor.py
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import joblib

app = Flask(__name__)

# Load and train model
df = pd.read_csv("poi_data.csv")
le_type = LabelEncoder()
le_cat = LabelEncoder()
df["type_enc"] = le_type.fit_transform(df["type"])
df["category_enc"] = le_cat.fit_transform(df["category"])

X = df[["distance_to_route", "type_enc", "category_enc"]]
y = df["time_spent"]

model = LinearRegression()
model.fit(X, y)

# Save model and encoders
joblib.dump(model, "model.pkl")
joblib.dump(le_type, "le_type.pkl")
joblib.dump(le_cat, "le_cat.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    dist = data["distance"]
    typ = le_type.transform([data["type"]])[0]
    cat = le_cat.transform([data["category"]])[0]
    pred = model.predict([[dist, typ, cat]])[0]
    return jsonify({"predicted_minutes": round(pred)})

if __name__ == "__main__":
    app.run(port=5000)
