const { execSync } = require('child_process');
const fs = require('fs');

// Function to run shell commands
function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    process.exit(1);
  }
}

// Create project structure
fs.mkdirSync('traffic_accident_prediction', { recursive: true });
fs.mkdirSync('traffic_accident_prediction/templates', { recursive: true });

// Write Python script
fs.writeFileSync('traffic_accident_prediction/app.py', `
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
`);

// Write HTML template
fs.writeFileSync('traffic_accident_prediction/templates/index.html', `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Traffic Accident Prediction</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        label, input, button {
            margin: 10px 0;
        }
        button {
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Traffic Accident Prediction</h1>
    <form method="POST">
        <label for="speed">Speed (km/h):</label>
        <input type="number" id="speed" name="speed" required min="0" max="200">
        
        <label for="weather">Weather Condition (0-clear, 1-rain, 2-snow):</label>
        <input type="number" id="weather" name="weather" required min="0" max="2" step="1">
        
        <label for="time_of_day">Time of Day (0-24 hours):</label>
        <input type="number" id="time_of_day" name="time_of_day" required min="0" max="24" step="0.1">
        
        <label for="traffic_density">Traffic Density (0-low, 1-medium, 2-high):</label>
        <input type="number" id="traffic_density" name="traffic_density" required min="0" max="2" step="1">
        
        <button type="submit">Predict</button>
    </form>
    
    {% if prediction %}
    <h2>Prediction Result:</h2>
    <p>The likelihood of a traffic accident is: {{ prediction }}</p>
    {% endif %}
</body>
</html>
`);

// Install required Python packages
runCommand('pip install flask scikit-learn numpy');

console.log('Project setup complete. To run the server, use the following command:');
console.log('python traffic_accident_prediction/app.py');