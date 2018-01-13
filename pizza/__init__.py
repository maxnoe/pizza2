from flask import Flask, render_template, jsonify, request, send_file, Blueprint
from flask_socketio import SocketIO
import os
import re
from datetime import datetime
import eventlet

from .database import database, Order, Pizzeria, create_tables
from .genorder import print_order


eventlet.monkey_patch()

bp = Blueprint('pizza', __name__, static_url_path='')


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


@bp.before_app_first_request
def setup():
    database.init(app.config['DATABASE'])
    create_tables()


@bp.route('/')
def home():
    return render_template('index.html')


@bp.route('/orders', methods=['GET'])
def get_orders():
    entries = list(Order.select().dicts())
    for e in entries:
        e['timestamp'] = e['timestamp'].isoformat()
    return jsonify(entries)


@bp.route('/orders', methods=['DELETE'])
def delete_orders():
    Order.delete().execute()
    socket.emit('orderUpdate')
    return jsonify("success")


@bp.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    Order.delete().where(Order.id == order_id).execute()
    socket.emit('orderUpdate')
    return jsonify("success")


@bp.route('/orders/<int:order_id>', methods=['POST'])
def toggle_paid(order_id):
    order = Order.get(id=order_id)
    order.paid = not order.paid
    order.save()

    socket.emit('orderUpdate')
    return jsonify("success")


@bp.route('/pizzerias', methods=['GET'])
def get_pizzerias():
    entries = list(Pizzeria.select().dicts())
    return jsonify(entries)


@bp.route('/orders', methods=['POST'])
def add_order():
    data = request.form.to_dict()

    price = re.findall('(\d+)(?:[,.](\d))?\s*(?:€|E)?', data['price'])
    timestamp = datetime.utcnow()

    if not data['description']:
        return jsonify(msg='Please provide a description', type='error')
    elif not data['name']:
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
            name=data['name'],
            description=data['description'],
            price=price,
            timestamp=timestamp,
            paid=False,
        )

    socket.emit('orderUpdate')

    return jsonify(msg='New entry added', type='success')


@bp.route('/pizzerias', methods=['POST'])
def add_pizzeria():
    data = request.form.to_dict()

    if not data['name']:
        return jsonify(msg='Please provide a description', type='error')
    elif not data['link']:
        return jsonify(msg='Please provide a link', type='error')
    else:
        Pizzeria.get_or_create(
            name=data['name'],
            defaults={'link': data['link']},
        )

    socket.emit('pizzeriaUpdate')

    return jsonify(msg='New entry added', type='success')


@bp.route('/pizzerias/<int:pizzeria_id>', methods=['POST'])
def select_pizzeria(pizzeria_id):
    try:
        pizzeria = Pizzeria.get(id=pizzeria_id)
        Pizzeria.update(active=False).execute()
        pizzeria.active = True
        pizzeria.save()
        socket.emit('pizzeriaUpdate')
    except Pizzeria.DoesNotExist:
        return jsonify(msg='Place does not exist', type='error')

    return jsonify(msg='New place selected', type='success')


@bp.route('/order.pdf', methods=['GET'])
def get_order():
    name = request.args.get('name', 'Hans')
    phone = request.args.get('phone', '1234')

    orders = list(Order.select(Order.description, Order.name, Order.price).dicts())
    tmp = print_order(orders, name, phone)
    return send_file(tmp.name)


basepath = os.environ.get('PIZZA_BASEPATH', '')
socket_address = os.path.join(basepath, 'socket.io').lstrip('/')
app = VueFlask(__name__, static_url_path=basepath)
app.register_blueprint(
    bp,
    url_prefix=basepath,
)
socket = SocketIO(app, resource=socket_address)
app.config['DATABASE'] = os.environ.get('PIZZA_DB', 'pizza.sqlite')
