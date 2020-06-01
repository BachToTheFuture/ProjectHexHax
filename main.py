
from flask import Flask, render_template, flash, request
import os
import json
import pandas
from joblib import dump, load
from sklearn import linear_model
from datetime import timedelta
from datetime import datetime

# New cases per million
ncpm = load("static/models/ncpm.joblib")
ndpm = load("static/models/ndpm.joblib")
ntpt = load("static/models/ntpt.joblib")
stidx = load("static/models/stidx.joblib")
tcpm = load("static/models/tcpm.joblib")
tdpm = load("static/models/tdpm.joblib")
ttpt = load("static/models/ttpt.joblib")


app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

state_covid_cases = open("static/state_covid_cases.csv").read()
state_covid_deaths = open("static/state_covid_deaths.csv").read()
state_unemployment = open("static/state_unemployment.csv").read()

gini_access = pandas.read_csv("static/models/combined_gini_access.csv")

@app.route('/')
def sessions():
    return render_template('index.html',
        state_covid_cases=state_covid_cases,
        state_covid_deaths=state_covid_deaths,
        state_unemployment=state_unemployment)

"""
//location,date,total_cases,new_cases,total_deaths,new_deaths,
//total_cases_per_million,new_cases_per_million,total_deaths_per_million,
//new_deaths_per_million,total_tests,new_tests,total_tests_per_thousand,
//new_tests_per_thousand,new_tests_smoothed,new_tests_smoothed_per_thousand,
//tests_units,stringency_index,population,population_density,median_age,aged_65_older,
//aged_70_older,gdp_per_capita,extreme_poverty,cvd_death_rate,diabetes_prevalence,
//female_smokers,male_smokers,handwashing_facilities,hospital_beds_per_100k

"""




def append_point_to_json(point, data):
    print("POINT", point)
    data["total_cases_per_million"].append(point[0])
    data["new_cases_per_million"].append(point[1])
    data["total_deaths_per_million"].append(point[2])
    data["new_deaths_per_million"].append(point[3])
    data["total_tests_per_thousand"].append(point[4])
    data["new_tests_per_thousand"].append(point[5])
    data["stringency_index"].append(point[6])
    data["population_density"].append(point[7])
    data["aged_65_older"].append(point[8])
    data["gdp_per_capita"].append(point[9])
    return data
 
def predict_future(data, days, gini=38, access=442):
    start = datetime.strptime(data["date"][-1], '%Y-%m-%d')
    for x in range(days):
        start += timedelta(days=1)
        data["date"].append(start.strftime('%Y-%m-%d'))
        point1 = [[
            data["total_cases_per_million"][-1],
            data["new_cases_per_million"][-1],
            data["total_deaths_per_million"][-1],
            data["new_deaths_per_million"][-1],
            data["total_tests_per_thousand"][-1],
            data["new_tests_per_thousand"][-1],
            data["stringency_index"][-1],
            data["population_density"][-1],
            data["aged_65_older"][-1],
            data["gdp_per_capita"][-1],
            # gini, access: default values for now
            0, gini, access
        ]]
        point2 = [tcpm.predict(point1)[0],
                ncpm.predict(point1)[0],
                tdpm.predict(point1)[0],
                ndpm.predict(point1)[0],
                ttpt.predict(point1)[0],
                ntpt.predict(point1)[0],
                stidx.predict(point1)[0],
                data["population_density"][-1],
                data["aged_65_older"][-1],
                data["gdp_per_capita"][-1],0,gini,access]
        data = append_point_to_json(point2, data)
    return data

@app.route('/predict', methods=['POST'])
def predict():
    country = request.form["country"]
    data = json.loads(request.form["data"])
    gini = 0
    access = 0
    try:
        x = gini_access.loc[gini_access['Country'] == country]
        gini = x["Gini Coefficient"]
        access = x["accessibility_weighted_mean"]
    except:
        gini = 38
        access = 442

    print(country)
    last_og_idx = len(data["date"])-1
    data = predict_future(data, 20, gini=gini, access=access)

    # PREDICTION SHOULD BE IN THIS FORMAT
    return json.dumps({'status':'OK','prediction':data, 'last_og_idx': last_og_idx})