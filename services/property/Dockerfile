FROM  python:3.10

WORKDIR /booking_flask_microservice

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV FLASK_APP=__init__.py
CMD [ "python", "-m" , "flask", "run", "--host=0.0.0.0"]