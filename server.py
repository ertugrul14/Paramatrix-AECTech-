from flask import Flask, request, send_file, jsonify
import subprocess
import os
import threading
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = r"D:\AECTech_bcn\Hunyuan3D-2-main\assets\example_mv_images\16"
OUTPUT_FILE = r"D:\AECTech_bcn\Hunyuan3D-2-main\assets\output.png"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

slider_values = {
    "X": 100,
    "Y": 100,
    "Z": 100,
    "Stretch +X Facade": 100,
    "Stretch -X Facade": 100,
    "Stretch +Y Facade": 100,
    "Stretch -Y Facade": 100,
}

@app.route('/save-images', methods=['POST'])
def save_images():
    file = request.files['file']
    file.save(os.path.join(UPLOAD_FOLDER, file.filename))
    return "Image saved successfully", 200

@app.route('/run-pipeline', methods=['POST'])
def run_pipeline():
    try:
        # Run the first operation (e.g., shape_gen_multiview.py)
        script1 = r"D:\AECTech_bcn\Hunyuan3D-2-main\examples\shape_gen_multiview.py"
        subprocess.run(["python", script1], check=True)

        # Run PARAM_all.py as the second operation
        script2 = r"D:\AECTech_bcn\Hunyuan3D-2-main\PARAM_all.py"
        subprocess.run(["python", script2], check=True)

        return "Pipeline executed successfully", 200
    except subprocess.CalledProcessError as e:
        return f"Pipeline execution failed: {e}", 500

@app.route('/get-visualization', methods=['GET'])
def get_visualization():
    if os.path.exists(OUTPUT_FILE):
        return send_file(OUTPUT_FILE, mimetype='image/png')
    return "Visualization not found", 404

@app.route('/update-sliders', methods=['POST'])
def update_sliders():
    global slider_values
    slider_values = request.json  # Receive slider values from the frontend
    update_pyqt_visualization(slider_values)  # Update PyQt visualization
    return jsonify({"status": "success", "slider_values": slider_values})

@app.route('/get-slider-values', methods=['GET'])
def get_slider_values():
    return jsonify(slider_values)

def update_pyqt_visualization(slider_values):
    new_vertices = mesh.vertices.copy()

    # Apply global scaling based on slider values
    new_vertices[:, 0] *= slider_values["X"] / 100
    new_vertices[:, 1] *= slider_values["Y"] / 100
    new_vertices[:, 2] *= slider_values["Z"] / 100

    # Apply facade scaling
    for facade, vertices, axis in [
        ("Stretch +X Facade", vertices_posX, 0),
        ("Stretch -X Facade", vertices_negX, 0),
        ("Stretch +Y Facade", vertices_posY, 1),
        ("Stretch -Y Facade", vertices_negY, 1),
    ]:
        scale = slider_values[facade] / 100
        new_vertices[vertices, axis] *= scale

    global mesh_item
    window.removeItem(mesh_item)
    mesh_item = create_mesh_item(new_vertices, mesh.faces)
    window.addItem(mesh_item)

def run_flask():
    app.run(debug=True, use_reloader=False)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.start()

