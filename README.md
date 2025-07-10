# 🗺️ Sightseeing Route Planner with AI

A full-stack web app that helps users plan a more enjoyable road trip. Given a start and destination, it shows **interesting places (POIs)** along the route and predicts **how much time** a traveler might spend at each one using a **machine learning model**.

---

## 🚀 Features

- 🧭 Input any starting point and destination
- 📍 Discover Points of Interest (POIs) like:
  - Museums, monuments, restaurants, parks, etc.
- 🔮 Predict how long users might spend at each stop using a trained regression model
- 🗺️ Display route and stops on an interactive map
- 🧾 Summary of total driving time, stop time, and trip time

---

## 🧠 AI Component

- Uses **Linear Regression** (via Scikit-learn)
- Trained on sample data with:
  - POI type (historic, restaurant, etc.)
  - Category (tourism, amenity, shop, etc.)
  - Distance from route
- Predicts estimated **visit time (minutes)** for each POI

---

## 🛠️ Tech Stack
 Layer     - Technology              

 Frontend  - React.js, Leaflet        |
 Backend   - Flask (Python) + scikit-learn 
 Data/API  -  OpenRouteService, Overpass API 

---

 📁 Folder Structure
sightseeing-route-app/
├── public/
├── src/
│ ├── components/
│ │ └── Map.js
│ └── App.js
├── predictor.py # Python Flask backend for prediction
├── poi_data.csv # Sample dataset for training
├── model.pkl # Trained regression model
├── le_type.pkl # Type label encoder
├── le_cat.pkl # Category label encoder
├── README.md


---

 Setup Instructions

1. Clone the Repository

git clone https://github.com/Swizknife/sightseeing-route-app.git
cd sightseeing-route-app

2.Frontend Setup
npm install
npm start

3.Backend Setup(Python + flask+ML)
pip install flask pandas scikit-learn joblib
python predictor.py

the model will serve at-
http://localhost:5000/predict

 How to Use
1. Enter a **Start** and **Destination**
2. Choose a POI Category (Tourism, Restaurant, etc.)
3. Click **Search Route & POIs**
4. View:
   - Driving route on the map
   - Suggested places along the way
   - Predicted visit time at each POI
   - Trip summary (total time, distance, stop time)


Example Dataset (poi_data.csv)
name,type,distance_to_route,category,time_spent
Red Fort,historic,2.4,tourism,45
Cafe Mocha,restaurant,0.5,amenity,30
Zoo,leisure,2.0,tourism,35
Big Mall,shop,3.1,shop,60

 APIs Used
OpenRouteService API - for directions and coordinates
Overpass API - for POI data from OpenStreetMap
Local Flask server - for AI predictions

 Future Ideas
Replace Linear Regression with Random Forest or XGBoost
Calculate real distance from POI to the route
Add filters for opening hours, ratings, etc.
Learn from actual trip histories (collaborative filtering)
Deploy full stack online (Render, Vercel, Railway, etc.)




