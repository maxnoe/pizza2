from flask import Flask, render_template


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


@app.route('/')
def home():
    return render_template('index.html')
