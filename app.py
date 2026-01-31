from flask import Flask
from extensions import db, login_manager
from models import User
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretsecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskecom.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth.login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register Blueprints
from auth.routes import auth_bp
from products.routes import products_bp
from cart.routes import cart_bp

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(cart_bp)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
