docker build . -t whereisthis
docker run \
	-p 9090:9090 \
	whereisthis

# Development
# docker run \
# 	-p 9090:9090 \
# 	-v $(pwd):/app \
# 	-it whereisthis bash
