from flask import Flask, render_template, flash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

@app.route('/')
def sessions():
    return render_template('index.html',
        global_covid_data=open("static/global_covid.csv").read(),
        state_covid_cases=open("static/state_covid_cases.csv").read(),
        state_covid_deaths=open("static/state_covid_deaths.csv").read())

