import time

import torch
from PIL import Image

from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline

images = {
    "front": "assets/example_mv_images/16/IMG-20250614-WA0017.jpg",
    "left": "assets/example_mv_images/16/IMG-20250614-WA0018.jpg",
    "back": "assets/example_mv_images/16/IMG-20250614-WA0019.jpg",
    "right": "assets/example_mv_images/16/IMG-20250614-WA0020.jpg",
}

for key in images:
    image = Image.open(images[key]).convert("RGBA")
    if image.mode == 'RGB':
        rembg = BackgroundRemover()
        image = rembg(image)
    images[key] = image

pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
    'tencent/Hunyuan3D-2mv',
    subfolder='hunyuan3d-dit-v2-mv',
    variant='fp16'
)

start_time = time.time()
mesh = pipeline(
    image=images,
    num_inference_steps=50,
    octree_resolution=380,
    num_chunks=20000,
    generator=torch.manual_seed(12345),
    output_type='trimesh'
)[0]
print("--- %s seconds ---" % (time.time() - start_time))
mesh.export(f'FS1.glb')
