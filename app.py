import flask

app = flask.Flask(__name__)

@app.route('/')
def index():
    return flask.render_template('index.html')

@app.route('/about')
def about():
    return flask.render_template('about.html')

@app.route('/projects')
def projects():
    return flask.render_template('projects.html')

@app.route('/contact')
def contact():
    return flask.render_template('contact.html')

#Never deploy this in production
if __name__ == '__main__':
    app.run(debug=True)
