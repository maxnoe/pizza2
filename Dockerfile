FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

EXPOSE 5000
RUN apt-get update -qq \
	&& apt-get install -y --no-install-recommends \
	    locales curl libcairo2 unzip python3 python3-pip libpango1.0-dev libffi-dev netbase python3-wheel \
	&& echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && ln -fs /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
    && dpkg-reconfigure --frontend noninteractive tzdata \
	&& locale-gen \
	&& rm -rf /var/lib/apt/lists/*

ENV LC_ALL="en_US.UTF-8"
ENV LANG="en_US.UTF-8"

RUN python3 -m pip install setuptools \
    && python3 -m pip install flask markdown jinja2 lxml cffi html5lib \
    	weasyprint flask-socketio simple-websocket peewee gunicorn \
    && rm -rf ~/.cache/pip

RUN curl -sSfL -o /tmp/fira-sans.zip 'https://fonts.google.com/download?family=Fira%20Sans' \
    && unzip /tmp/fira-sans.zip -d /usr/share/fonts/truetype \
    && rm /tmp/fira-sans.zip \
    && fc-cache

COPY pizza /pizza


CMD python3 -m gunicorn.app.wsgiapp -w 1 --threads 100 -b '0.0.0.0:5000' pizza:app
