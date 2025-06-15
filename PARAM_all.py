import trimesh
import pyqtgraph as pg
import pyqtgraph.opengl as gl
from PyQt5 import QtWidgets, QtCore
import sys
import numpy as np
import os

# Paths for GLB and PLY files
input_glb = r"D:\AECTech_bcn\Hunyuan3D-2-main\FS1.glb"
output_ply = r"D:\AECTech_bcn\Hunyuan3D-2-main\FS1.ply"

def convert_glb_to_ply(input_glb, output_ply):
    """Convert FS1.glb to FS1.ply."""
    try:
        print(f"Converting {input_glb} to {output_ply}...")
        mesh = trimesh.load(input_glb)
        mesh.export(output_ply)
        print(f"Conversion completed: {output_ply}")
    except Exception as e:
        print(f"An error occurred during GLB to PLY conversion: {e}")
        sys.exit(1)

# Convert FS1.glb to FS1.ply before proceeding
if not os.path.exists(output_ply):  # Only convert if PLY doesn't already exist
    convert_glb_to_ply(input_glb, output_ply)

# Load the mesh
mesh = trimesh.load(output_ply)

# Create app and window
app = QtWidgets.QApplication(sys.argv)
window = gl.GLViewWidget()
window.opts['distance'] = 2
window.show()
window.setWindowTitle('Global + Facade Parametric Editor (Solid Color + Edges)')
window.setBackgroundColor('w')

# Create mesh item with solid color and visible edges
def create_mesh_item(vertices, faces):
    mesh_data = gl.MeshData(vertexes=vertices, faces=faces)
    mesh_item = gl.GLMeshItem(
        meshdata=mesh_data,
        smooth=False,
        color=(0.5, 0.7, 1, 1),   # solid RGBA face color
        shader='balloon',         # solid flat shading
        drawEdges=True,           # enable edge drawing
        edgeColor=(0, 0, 0, 1)    # black edges
    )
    return mesh_item

# Detect facades
normals = mesh.face_normals
faces_posX = np.where(normals[:, 0] > 0.9)[0]
faces_negX = np.where(normals[:, 0] < -0.9)[0]
faces_posY = np.where(normals[:, 1] > 0.9)[0]
faces_negY = np.where(normals[:, 1] < -0.9)[0]

vertices_posX = np.unique(mesh.faces[faces_posX].flatten())
vertices_negX = np.unique(mesh.faces[faces_negX].flatten())
vertices_posY = np.unique(mesh.faces[faces_posY].flatten())
vertices_negY = np.unique(mesh.faces[faces_negY].flatten())

# Initialize mesh
current_vertices = mesh.vertices.copy()
mesh_item = create_mesh_item(current_vertices, mesh.faces)
window.addItem(mesh_item)

# Sliders
main_layout = QtWidgets.QWidget()
vbox = QtWidgets.QVBoxLayout()
vbox.addWidget(window)

# Global scale sliders
global_sliders = []
for axis, name in zip(range(3), ['X', 'Y', 'Z']):
    label = QtWidgets.QLabel(f'Scale {name} (Global)')
    slider = QtWidgets.QSlider(QtCore.Qt.Horizontal)
    slider.setRange(10, 300)
    slider.setValue(100)
    global_sliders.append((slider, axis))

    hbox = QtWidgets.QHBoxLayout()
    hbox.addWidget(label)
    hbox.addWidget(slider)
    vbox.addLayout(hbox)

# Facade scale sliders
facade_data = [
    ('Stretch +X Facade', vertices_posX, 0),
    ('Stretch -X Facade', vertices_negX, 0),
    ('Stretch +Y Facade', vertices_posY, 1),
    ('Stretch -Y Facade', vertices_negY, 1),
]

facade_sliders = []
for label_text, vertices, axis in facade_data:
    label = QtWidgets.QLabel(label_text)
    slider = QtWidgets.QSlider(QtCore.Qt.Horizontal)
    slider.setRange(10, 300)
    slider.setValue(100)
    facade_sliders.append((slider, vertices, axis))

    hbox = QtWidgets.QHBoxLayout()
    hbox.addWidget(label)
    hbox.addWidget(slider)
    vbox.addLayout(hbox)

# Reset button
reset_button = QtWidgets.QPushButton('Reset')
vbox.addWidget(reset_button)

main_layout.setLayout(vbox)

# Keep a reference to the main layout to prevent garbage collection
main_layout.setWindowTitle("Global + Facade Parametric Editor")
main_layout.resize(800, 600)
main_layout.show()

# Update function
def update():
    new_vertices = mesh.vertices.copy()

    # Apply global scaling
    for slider, axis in global_sliders:
        scale = slider.value() / 100
        new_vertices[:, axis] *= scale

    # Apply facade scaling on top
    for slider, vertices, axis in facade_sliders:
        scale = slider.value() / 100
        new_vertices[vertices, axis] *= scale

    # Swap Y and Z axes
    new_vertices[:, [1, 2]] = new_vertices[:, [2, 1]]

    global mesh_item
    window.removeItem(mesh_item)
    mesh_item = create_mesh_item(new_vertices, mesh.faces)
    window.addItem(mesh_item)

# Reset function
def reset():
    for slider, _ in global_sliders:
        slider.setValue(100)
    for slider, _, _ in facade_sliders:
        slider.setValue(100)

# Connect signals
for slider, _ in global_sliders:
    slider.valueChanged.connect(update)
for slider, _, _ in facade_sliders:
    slider.valueChanged.connect(update)

reset_button.clicked.connect(reset)

# Run app
sys.exit(app.exec_())
