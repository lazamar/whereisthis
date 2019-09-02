import os
from pathlib import Path
import flask
from flask import request, jsonify, send_from_directory
import predict
import enrich

app = flask.Flask("WhereML")


@app.route("/ping")
def ping():
    return "", 200


@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('../static', path)


@app.route("/from_url", methods=["POST"])
def invoke():
    data = request.get_json(force=True)
    url = data['url'];
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
