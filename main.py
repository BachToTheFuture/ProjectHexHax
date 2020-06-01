
from flask import Flask, render_template, flash, request
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

@app.route('/')
def sessions():
    return render_template('index.html',
        state_covid_cases=open("static/state_covid_cases.csv").read(),
        state_covid_deaths=open("static/state_covid_deaths.csv").read(),
        state_unemployment=open("static/state_unemployment.csv").read())

@app.route('/predict', methods=['POST'])
def predict():
    country = request.form["country"]
    print(country)
    """
    Evaluate function goes here
    """
    # PREDICTION SHOULD BE IN THIS FORMAT
    prediction = [{"dates":[], "[feature_goes_here]":[]}]
    return json.dumps({'status':'OK','prediction':prediction})