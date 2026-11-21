---
title: "Elephant Storage: Storing a Video Inside a Neural Network"
date: "2026-11-21"
excerpt: "Intentionally overfitting a PyTorch neural network to memorize video frames and reconstruct a SpongeBob clip from numerical keys."
---

# Why Overtrain a Neural Network?

In ML you normally spend most of your time trying to avoid overfitting. For this project I wanted to do the opposite. The idea behind **Elephant Storage** (The name I am giving this concept) is simple: take a video, break it into individual frames, and intentionally overtrain an Artificial Neural Network (ANN) until it memorizes every frame.

Once the network is trained, you pass in a frame number (a numerical key) and it outputs the RGB pixels for that frame. Do that for every key in sequence, stitch the images back together, and you get the video back without needing the original MP4 file. The entire clip lives inside the model weights.

All code can be found on [github](https://github.com/geryfabrega/elephant-memory)

## Disclaimer

I am not an AI/ML researcher—I'm a hobbyist with a genuine interest in how these systems work. I build projects like this (leaning on AI tools along the way) to grow my knowledge base and run experiments just for fun.

## The Output

Here is a side-by-side comparison of the original SpongeBob clip and the reconstruction generated purely from the trained PyTorch model (`256x256`, 1,599 frames trained for 15 epochs and stitched back together at 24 FPS):

![Original vs. reconstructed SpongeBob video side by side (256x256, 15 epochs, 24 FPS)](/blog-videos/side%20by%20side%20sponge.mp4 "width=720")

## How It Works

The pipeline itself is pretty straightforward and runs in PyTorch (with CUDA on Colab, oe locally):

1. Extract frames from the input video (`spongebob.mp4`) using OpenCV, resize them to `256x256`, and save them as PNGs while grabbing the original FPS and frame count.
2. Convert each frame index into a fixed-size input vector and pair it with the flattened, normalized RGB pixel array.
3. Train a wide MLP to map each key vector directly to the frame pixels.
4. Run inference across all keys and stitch the generated frames back into an `.mp4`.

### Turning Frame Numbers Into Input Vectors

Each frame is referenced by an integer index (`0, 1, 2, ...`). To keep the input representation simple, I zero-pad the key string to a fixed length of 16 and convert each digit to a float:

```python
def key_to_vector(key, dim=16):
    return np.array([float(x) for x in str(key).zfill(dim)])
```

On the target side, the dataset loads each `256x256` RGB image, flattens it into a 1D vector of `256 * 256 * 3 = 196,608` values, and divides by `255.0` so every pixel lands between `[0, 1]`.

### The Model Architecture

I started with a smaller two-layer MLP (`[1024, 4096]`), which struggled to retain detail across frames. To give the network enough capacity to actually memorize the video, I scaled it up to a wider 4-layer MLP (`[2048, 4096, 8192]` hidden layers using `ReLU`) ending with a `Sigmoid` output layer to keep every pixel between 0 and 1:

![Elephant Storage MLP diagram: Frame ID into an overfit neural network outputting a 256x256 RGB matrix](/blog-images/elephant-storage-mlp.svg)

```python
class KeyToImageModel(nn.Module):
    def __init__(self, input_dim, output_dim, hidden_layers=[2048, 4096, 8192], activation='relu'):
        super(KeyToImageModel, self).__init__()

        layers = []
        current_dim = input_dim

        if activation == 'relu':
            self.activation = nn.ReLU()
        elif activation == 'leaky_relu':
            self.activation = nn.LeakyReLU(0.01)
        elif activation == 'gelu':
            self.activation = nn.GELU()
        else:
            raise ValueError(f"Unsupported activation function: {activation}")

        for h_dim in hidden_layers:
            layers.append(nn.Linear(current_dim, h_dim))
            layers.append(self.activation)
            current_dim = h_dim

        layers.append(nn.Linear(current_dim, output_dim))
        layers.append(nn.Sigmoid())

        self.fc = nn.Sequential(*layers)

    def forward(self, x):
        return self.fc(x)
```

Because the final linear layer maps `8,192` neurons straight out to `196,608` pixels, the parameter count is massive. This is definitely not a practical video compression algorithm (the `.pth` weights file is much larger than the original video), it is just a fun experiment in pushing raw memorization.

### Training and Avoiding Catastrophic Forgetting

For training I used `MSELoss`, `Adam` with `initial_lr = 0.0005`, `weight_decay = 0` (no regularization since we actually want to overfit), `batch_size = 1`, and a `ReduceLROnPlateau` scheduler for 15-20 epochs.

One thing that tripped me up early on was loading the frames in sequential order (`shuffle=False`). When the network trains on frames `0..N` in order, it ends up suffering from catastrophic forgetting, overwriting earlier frames as it learns later ones. Switching the DataLoader to `shuffle=True` fixed that immediately:

```python
# Randomize batches to prevent catastrophic forgetting
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=initial_lr, weight_decay=0)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', factor=0.5, patience=5
)
```

It definitely took a few tries to get to a recognizable result. Here is an example of one of my earlier failed attempts before dialing in the model capacity and training setup:

![Earlier failed reconstruction attempt](/blog-videos/bad%20reconstruction.mp4 "width=480")

### Reconstructing the Video

Once the weights are saved to disk, rebuilding the video is just a forward pass per frame index. Each output vector gets reshaped back to `(256, 256, 3)`, scaled back to `[0, 255]`, and saved as a PNG:

```python
with torch.no_grad():
    output = model(key_tensor).cpu().numpy().reshape(image_size, image_size, 3)
    output = (output * 255).astype(np.uint8)
```

From there OpenCV's `cv2.VideoWriter` stitches the generated PNGs back into `reconstructed_video_spongebob.mp4` at 24 FPS.

## Thoughts and Next Steps

Overall this was a really fun weekend experiment to build and tweak. Seeing recognizable SpongeBob frames come back out of nothing but a matrix of learned weights and an integer key is pretty cool.

If I revisit this later, a few things I would want to try:
- **Better key encodings**: Zero-padded decimal digits jump around discontinuously (like going from `9` to `10`). Sinusoidal or positional encodings would give the network a much smoother input space to learn from.
- **Convolutional decoder**: Replacing the huge final linear layer with transposed convolutions would drastically cut down the parameter count and let the model scale to higher resolutions or longer clips.
- **Real Time Streaming**: I would like to explore the possibility of having some inference program that will do the forward propagation in real time to output the frames, this will skip the need for storing the video frames and stitching the via opencv. If the forward passes are quick enough this could be viable.
