from flask import Flask, render_template, jsonify, request
import os
import re
from datetime import datetime

from .database import database, Order, create_tables


class VueFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update({
        'block_start_string': '{%',
        'block_end_string': '%}',
        'variable_start_string': '((',
        'variable_end_string': '))',
        'comment_start_string': '{#',
        'comment_end_string': '#}',
    })


app = VueFlask(__name__)
app.config['DATABASE'] = os.environ.get('PIZZA_DB', 'pizza.sqlite')


@app.before_first_request
def setup():
    database.init(app.config['DATABASE'])
    create_tables()


@app.route('/orders', methods=['GET'])
def get_orders():
    entries = list(Order.select().dicts())
    for e in entries:
        e['timestamp'] = e['timestamp'].isoformat()
    return jsonify(entries)


@app.route('/orders', methods=['POST'])
def add_order():
    data = request.form.to_dict()

    price = re.findall('(\d+)(?:[,.](\d))?\s*(?:€|E)?', data['price'])
    timestamp = datetime.utcnow()

    if not data['description']:
        return jsonify(msg='Please provide a description', type='error')
    elif not data['author']:
        return jsonify(msg='Please provide your name', type='error')
    elif not price:
        return jsonify(msg='Price must be formed like this: 3.14', type='error')
    else:
        value = price[0]
        price = int(value[0]) * 100
        if value[1]:
            if len(value[1]) == 1:
                price += int(value[1]) * 10
            else:
                price += int(value[1])

        Order.create(
            author=data['author'],
            description=data['description'],
            price=price,
            timestamp=timestamp,
            paid=False,
        )

    return jsonify(msg='New entry added', type='success')


@app.route('/')
def home():
    return render_template('index.html')
