import open3d as o3d
import numpy as np
from scipy.spatial import cKDTree
import matplotlib.pyplot as plt
import time

def detect_planar_surfaces(points, normals, angle_threshold=2, distance_threshold=0.03):
    """
    Detect planar surfaces using point normals and connectivity
    
    Args:
        points: np.array of shape (N, 3) containing point coordinates
        normals: np.array of shape (N, 3) containing point normals
        angle_threshold: maximum angle difference in degrees for points to be considered coplanar
        distance_threshold: maximum distance between points to be considered connected
    """
    N = len(points)
    labels = np.full(N, -1)
    current_label = 0
    
    # Convert angle threshold to dot product threshold
    angle_threshold_rad = np.cos(np.radians(angle_threshold))
    
    # Build KD-tree for nearest neighbor search
    tree = cKDTree(points)
    
    for i in range(N):
        if labels[i] >= 0:
            continue
            
        # Start new surface
        stack = [i]
        labels[i] = current_label
        
        # Region growing
        while stack:
            current_idx = stack.pop()
            current_normal = normals[current_idx]
            
            # Find nearby points
            neighbors = tree.query_ball_point(points[current_idx], distance_threshold)
            
            for neighbor_idx in neighbors:
                if labels[neighbor_idx] >= 0:
                    continue
                    
                # Check if normals are similar
                neighbor_normal = normals[neighbor_idx]
                if abs(np.dot(current_normal, neighbor_normal)) > angle_threshold_rad:
                    labels[neighbor_idx] = current_label
                    stack.append(neighbor_idx)
        
        current_label += 1
    
    return labels

def preprocess_mesh(input_ply):
    """Load and preprocess mesh to extract surface information"""
    print("Loading mesh...")
    mesh = o3d.io.read_triangle_mesh(input_ply)
    
    # Ensure mesh has normals
    if not mesh.has_vertex_normals():
        mesh.compute_vertex_normals()
    
    # Convert to point cloud with normals
    points = np.asarray(mesh.vertices)
    normals = np.asarray(mesh.vertex_normals)
    
    print("Detecting surfaces...")
    surface_ids = detect_planar_surfaces(points, normals)
    
    return points, surface_ids

def save_xyzc(points, surface_ids, output_file):
    """Save points with surface IDs to XYZC format"""
    # Ensure surface IDs start from 1
    surface_ids = surface_ids + 1
    
    # Combine points and surface IDs
    data = np.hstack((points, surface_ids.reshape(-1, 1)))
    
    # Save to file
    np.savetxt(output_file, data, delimiter=' ', fmt=['%.6f', '%.6f', '%.6f', '%d'])
    
    n_surfaces = len(np.unique(surface_ids))
    print(f"✅ Saved {len(points)} points with {n_surfaces} surfaces to {output_file}")
    return data

def ply_to_xyzc(input_ply, output_xyzc):
    """Convert PLY mesh to XYZC format preserving surface information"""
    # Process mesh and detect surfaces
    points, surface_ids = preprocess_mesh(input_ply)
    
    # Save results
    data = save_xyzc(points, surface_ids, output_xyzc)
    return data

def visualize_xyzc(file_path):
    """Visualize the XYZC file with colored surfaces"""
    try:
        data = np.loadtxt(file_path, delimiter=' ')
        xyz = data[:, :3]
        surface_ids = data[:, 3]
        
        unique_ids = np.unique(surface_ids)
        colors = np.zeros((len(xyz), 3))
        color_map = plt.cm.get_cmap('tab20')(np.linspace(0, 1, len(unique_ids)))[:, :3]
        
        for i, id in enumerate(unique_ids):
            mask = surface_ids == id
            colors[mask] = color_map[i % len(color_map)]
        
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(xyz)
        pcd.colors = o3d.utility.Vector3dVector(colors)
        
        o3d.visualization.draw_geometries([pcd])
        
    except Exception as e:
        print(f"Error during visualization: {str(e)}")

def convert_glb_to_ply(input_glb, output_ply):
    """
    Convert a .glb file to .ply format.
    """
    print(f"Converting {input_glb} to {output_ply}...")
    mesh = o3d.io.read_triangle_mesh(input_glb)
    if not mesh.has_vertex_normals():
        print("Computing vertex normals...")
        mesh.compute_vertex_normals()
    o3d.io.write_triangle_mesh(output_ply, mesh)
    print(f"✅ Conversion complete: {output_ply}")

# Add this function call at the beginning of your main script
if __name__ == "__main__":
    input_glb = "FS1.glb"  # Replace with your .glb file
    intermediate_ply = "FS1.ply"  # Temporary .ply file for processing
    output_file = "FS1.xyzc"  # Final output file

    # Convert .glb to .ply
    convert_glb_to_ply(input_glb, intermediate_ply)

    # Process the .ply file as before
    data = ply_to_xyzc(intermediate_ply, output_file)
    print("Visualizing point cloud...")
    visualize_xyzc(output_file)
