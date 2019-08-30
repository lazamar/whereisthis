FROM mxnet/python:latest
WORKDIR /app

RUN pip install -U six
RUN pip install -U flask scikit-image numpy reverse_geocoder boto3 motionless

COPY plaNet/* 	/app/plaNet/
COPY src/		/app/src

EXPOSE 8080
CMD ["python3 src/app.py"]
