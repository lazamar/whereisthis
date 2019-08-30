import os
from pathlib import Path
import flask
from flask import request, jsonify
import predict
import enrich

app = flask.Flask("WhereML")


@app.route("/ping")
def ping():
    return "", 200


# /from_url?url=URL_ENCODED_IMAGE_ADDRESS
@app.route("/from_url")
def invoke():
    url = request.args.get("url");
    result = predict.predict_from_url(url)
    return jsonify(result)


ROOT = str(Path(__file__).parent.parent)
IMAGES_DIR = os.path.join(ROOT, "images")

# /from_local?path=image.jpg
@app.route("/from_local")
def local():
    path = os.path.join(IMAGES_DIR, request.args.get("path"))
    coords = predict.predict_from_local_path(path)
    enriched = enrich.coordinates(coords)
    return jsonify(enriched)


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=8080)
