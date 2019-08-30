docker build . -t whereisthis
docker run \
	-p 8080:8080 \
	-v $(pwd)/images:/static \
	whereisthis