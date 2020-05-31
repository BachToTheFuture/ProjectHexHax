from flask import Flask, render_template, flash
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

"""
# Prepare the large covid data
covid = open("static/owid-covid-data.csv").read().split('\n')
header = covid[0].split(",")
feature_range = range(2,len(header)-1)
covid = [x.split(",") for x in covid[1:]]

data = {}
for x in covid:
    if x[1] not in data.keys(): data[x[1]] = {header[y]: [] for y in feature_range}
    for n in feature_range:
        val = x[n]
        try:
            val = float(x[n])
        except:
            pass
        if val == "": val = 0
        data[x[1]][header[n]].append(val)

f = open("test.json", "w")
f.write(json.dumps(data))
f.close()
"""

@app.route('/')
def sessions():
    return render_template('index.html',
        state_covid_cases=open("static/state_covid_cases.csv").read(),
        state_covid_deaths=open("static/state_covid_deaths.csv").read(),
        state_unemployment=open("static/state_unemployment.csv").read())
