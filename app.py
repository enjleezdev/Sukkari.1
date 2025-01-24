from flask import Flask, render_template, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from functools import wraps
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///diabetes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# نماذج قاعدة البيانات
class GlucoseReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    notes = db.Column(db.String(200))

class Medication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    time = db.Column(db.String(5), nullable=False)  # HH:MM format
    logs = db.relationship('MedicationLog', backref='medication', lazy=True)

class MedicationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    medication_id = db.Column(db.Integer, db.ForeignKey('medication.id'))
    date_taken = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100), nullable=False)
    duration = db.Column(db.Integer)  # بالدقائق
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Reading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(200))
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

with app.app_context():
    db.create_all()

def load_translations(lang):
    with open(f'translations/{lang}.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_user_language():
    return request.cookies.get('language', 'ar')

def with_translations(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        lang = get_user_language()
        translations = load_translations(lang)
        return f(*args, lang=lang, translations=translations, **kwargs)
    return decorated_function

@app.route('/')
@with_translations
def index(lang, translations):
    return render_template('index.html', lang=lang, translations=translations)

@app.route('/api/glucose', methods=['GET', 'POST'])
def glucose():
    if request.method == 'POST':
        data = request.json
        reading = GlucoseReading(
            value=data['value'],
            notes=data.get('notes', '')
        )
        db.session.add(reading)
        db.session.commit()
        return jsonify({'status': 'success'})
    
    readings = GlucoseReading.query.order_by(GlucoseReading.date_time.desc()).all()
    return jsonify([{
        'id': r.id,
        'value': r.value,
        'date_time': r.date_time.strftime('%Y-%m-%d %H:%M'),
        'notes': r.notes
    } for r in readings])

@app.route('/medications')
@with_translations
def medications(lang, translations):
    return render_template('medications.html', lang=lang, translations=translations)

@app.route('/api/medications', methods=['GET', 'POST'])
def medications_api():
    if request.method == 'POST':
        data = request.json
        med = Medication(
            name=data['name'],
            time=data['time']
        )
        db.session.add(med)
        db.session.commit()
        return jsonify({'status': 'success'})
    
    meds = Medication.query.all()
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'time': m.time
    } for m in meds])

@app.route('/api/medications/<int:med_id>', methods=['DELETE'])
def delete_medication(med_id):
    med = Medication.query.get_or_404(med_id)
    db.session.delete(med)
    db.session.commit()
    return '', 204

@app.route('/api/medication_logs', methods=['GET', 'POST'])
def medication_logs_api():
    if request.method == 'POST':
        data = request.json
        log = MedicationLog(
            medication_id=data['medication_id']
        )
        db.session.add(log)
        db.session.commit()
        return jsonify({'status': 'success'})
    
    logs = db.session.query(
        MedicationLog.id,
        MedicationLog.date_taken,
        Medication.name.label('medication_name'),
        Medication.time
    ).join(
        Medication,
        MedicationLog.medication_id == Medication.id
    ).order_by(MedicationLog.date_taken.desc()).all()

    return jsonify([{
        'id': log.id,
        'medication_name': log.medication_name,
        'time': log.time,
        'date_taken': log.date_taken.strftime('%Y-%m-%d %H:%M'),
        'taken': True
    } for log in logs])

@app.route('/glucose_readings')
@with_translations
def glucose_readings(lang, translations):
    return render_template('glucose_readings.html', lang=lang, translations=translations)

@app.route('/settings')
@with_translations
def settings(lang, translations):
    return render_template('settings.html', lang=lang, translations=translations)

if __name__ == '__main__':
    app.run()
