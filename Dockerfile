FROM mxnet/python:latest

# Install NodeJS
RUN apt update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt install -y nodejs
RUN npm install -g yarn@1.17.3

WORKDIR /app

COPY package.json	/app

RUN yarn install
RUN pip install -U six
RUN pip install -U flask scikit-image numpy reverse_geocoder boto3 motionless

COPY plaNet/ 		/app/plaNet/
COPY src/			/app/src
COPY env.json		/app
COPY run.sh			/app

EXPOSE 9090

CMD ["/bin/bash", "run.sh"]
