Paramatrix – Image to Parametric 3D Modeling 🧩

Paramatrix is a methodology developed during the AECTech Hackathon Barcelona 2025 that converts sets of photographs into fully parametric 3D models. 
Powered by Huanyuan 3D v2, it bridges the gap between 3D mesh reconstruction and custom parametric modeling—giving users creative control from image input to adjustable output.

🔍 Features
Photo-to-3D Mesh
Import a image or a series of images to generate an accurate 3D mesh using Huanyuan 3D v2.

Parametric Modeling
Export and manipulate models using a set of parameters to customize geometry.

Methodology Experiments
A suite of experiments in the repo exploring techniques.

🚀 Quick Start
Clone the Repo

bash

Copy

Edit

git clone https://github.com/ertugrul14/Paramatrix-AECTech-.git

cd Paramatrix-AECTech-

Install Dependencies

Install Python dependencies (adjust for your environment):


bash

Copy

Edit

pip install -r requirements.txt

Run the Pipeline

Feed your images and generate the parametric 3D model:

🧪 Methodology & Experiments
Check out the /experiments folder to discover what was tested during the hackathon:

Alternative mesh reconstruction techniques

Shape fitting approaches to streamline conversion

Parameter selection strategies to enhance customization


🛠️ Project Structure
bash
Copy
Edit


Paramatrix-AECTech-/

├── pipeline.py        
├── requirements.txt     
├── README.md      
└── experiments/

🎯 Goals & Roadmap

Current Goal: Seamlessly convert multi-view images to a clean parametric 3D model with user-set parameters.


👥 Acknowledgements

Built during AECTech Hackathon Barcelona 2025 by the Abdellah Choufani, Eleni Papakosta, Ertuğrul Akdemir, Michele Cobelli, Carmine A. Rago. 

Special thanks to the organizers and mentors!

PARAMETRIX focuses on 3D parametric creation from images accessible—experiment, customize, and build your next 3D‑powered application!
