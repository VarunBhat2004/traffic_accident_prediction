from flask import Flask, request, render_template
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import numpy as np

app = Flask(__name__)

# Create a dummy model (in a real scenario, you'd train this on actual data)
model = RandomForestClassifier(n_estimators=100, random_state=42)
X_dummy = np.random.rand(1000, 4)
y_dummy = np.random.randint(2, size=1000)
model.fit(X_dummy, y_dummy)

scaler = StandardScaler()
scaler.fit(X_dummy)

@app.route('/', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        # Get input from form
        speed = float(request.form['speed'])
        weather = float(request.form['weather'])
        time_of_day = float(request.form['time_of_day'])
        traffic_density = float(request.form['traffic_density'])
        
        # Prepare input for prediction
        input_data = np.array([[speed, weather, time_of_day, traffic_density]])
        input_data_scaled = scaler.transform(input_data)
        
        # Make prediction
        prediction = model.predict_proba(input_data_scaled)[0][1]
        
        return render_template('index.html', prediction=f"{prediction:.2%}")
    
    return render_template('index.html', prediction=None)

if __name__ == '__main__':
    app.run(debug=True)