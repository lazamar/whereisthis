import os
from pathlib  import Path
import urllib
from collections import namedtuple


import mxnet as mx
import numpy as np
from skimage import io, transform


currentFolder = str(Path(__file__).parent)
MODEL_PATH = os.path.join(currentFolder,"model")
MODEL_NAME = "RN101-5k500"
EPOCH = 12

sym, arg_params, aux_params = mx.model.load_checkpoint(
    os.path.join(MODEL_PATH, MODEL_NAME),
    EPOCH
)
mod = mx.mod.Module(symbol=sym, context=mx.cpu())
mod.bind([('data', (1, 3, 224, 224))], for_training=False)
mod.set_params(arg_params, aux_params, allow_missing=True)

mean_rgb = np.array([123.68, 116.779, 103.939]).reshape((3, 1, 1))

Batch = namedtuple('Batch', ['data'])
grids = []
GRIDS_PATH = os.path.join(MODEL_PATH, 'grids.txt')
with open(GRIDS_PATH, 'r') as f:
    for line in f:
        line = line.strip().split('\t')
        lat = float(line[1])
        lng = float(line[2])
        grids.append((lat, lng))


def preprocess_image(img):
    # We crop image from center to get size 224x224.
    short_side = min(img.shape[:2])
    yy = int((img.shape[0] - short_side) / 2)
    xx = int((img.shape[1] - short_side) / 2)
    crop_img = img[yy: yy + short_side, xx: xx + short_side]
    resized_img = transform.resize(crop_img, (224, 224))
    # convert to numpy.ndarray
    sample = np.asarray(resized_img) * 256
    # swap axes to make image from (224, 224, 3) to (3, 224, 224)
    sample = np.swapaxes(sample, 0, 2)
    sample = np.swapaxes(sample, 1, 2)
    # sub mean
    normed_img = sample - mean_rgb
    normed_img = normed_img.reshape((1, 3, 224, 224))
    return [mx.nd.array(normed_img)]


def predict(img, max_predictions):
    mod.forward(Batch(img), is_train=False)
    # shape is probability of each cell 0 to ~15k
    prob = mod.get_outputs()[0].asnumpy()[0]
    # sort by most probable
    pred = np.argsort(prob)[::-1]
    result = []
    for i in range(max_predictions):
        pred_loc = grids[int(pred[i])]
        result.append((pred_loc, str(prob[pred[i]])))
    return result


def download_image(url):
    fd = urllib.request.urlopen(url)
    img = io.call_plugin('imread', fd, plugin='pil')
    return img


def predict_from_url(url, max_predictions=3):
    img = preprocess_image(download_image(url))
    return predict(img, max_predictions)


def load_local_image(path):
    fd = open(path, "rb")
    img = io.call_plugin('imread', fd, plugin='pil')
    return img

def predict_from_local_path(path, max_predictions=3):
    img = preprocess_image(load_local_image(path))
    return predict(img, max_predictions)
