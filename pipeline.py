import subprocess
import os

# Define the paths to the scripts
script1 = r"D:\AECTech_bcn\Hunyuan3D-2-main\examples\shape_gen_multiview.py"
script2 = r"D:\AECTech_bcn\Hunyuan3D-2-main\PARAM_all.py"

def run_pipeline():
    try:
        # Step 1: Run shape_gen_multiview.py
        print(f"Running: {script1}")
        subprocess.run(["python", script1], check=True)
        print(f"Completed: {script1}")

        # Step 2: Run PARAM_all.py
        print(f"Running: {script2}")
        subprocess.run(["python", script2], check=True)
        print(f"Completed: {script2}")

        print("Pipeline executed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while running the pipeline: {e}")
        return False
    return True

if __name__ == "__main__":
    success = run_pipeline()
    if success:
        print("Pipeline finished successfully!")
    else:
        print("Pipeline failed.")