# app.py
import os, base64
from flask import Flask, request, render_template
from orchestrator import run_pipeline
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# ensure folders exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('static', exist_ok=True)

@app.route('/', methods=['GET', 'POST'])
def index():
    js_code = None
    params  = None

    if request.method == 'POST':
        img   = request.files['image']
        fname = os.path.join(app.config['UPLOAD_FOLDER'], img.filename)
        img.save(fname)

        # encode as data URI
        data = base64.b64encode(open(fname,'rb').read()).decode()
        ext  = img.filename.rsplit('.',1)[1].lower()
        data_url = f"data:image/{ext};base64,{data}"

        # run entire pipeline
        js_code, params = run_pipeline(data_url)

        # write outputs for live preview
        with open('static/tower_sketch.js','w') as f: f.write(js_code)
        with open('static/params.json','w')    as f: f.write(params)

    return render_template('index.html', js_code=js_code)

if __name__ == '__main__':
    app.run(debug=True)
