from flask import Blueprint, redirect, url_for, render_template
from extensions import db
from flask import flash
from models import Cart, Product, Order
from flask_login import login_required, current_user
from models import Order

cart_bp = Blueprint("cart", __name__)

@cart_bp.route("/add-to-cart/<int:product_id>")
@login_required
def add_to_cart(product_id):
    item = Cart.query.filter_by(user_id=current_user.id, product_id=product_id).first()

    if item:
        item.quantity += 1
    else:
        item = Cart(user_id=current_user.id, product_id=product_id, quantity=1)
        db.session.add(item)

    db.session.commit()
    return redirect(url_for("products.home"))


@cart_bp.route("/cart")
@login_required
def view_cart():
    items = Cart.query.filter_by(user_id=current_user.id).all()
    cart_items = []
    total = 0

    for item in items:
        product = Product.query.get(item.product_id)
        subtotal = product.price * item.quantity
        total += subtotal

        cart_items.append({
            "id": item.id,
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": item.quantity,
            "stock": product.stock,
            "image": product.images[0].filename if product.images else None,
            "subtotal": subtotal
        })

    return render_template("cart.html", cart_items=cart_items, total=total)


@cart_bp.route("/remove-from-cart/<int:item_id>")
@login_required
def remove_from_cart(item_id):
    item = Cart.query.get_or_404(item_id)

    if item.user_id != current_user.id:
        return "Unauthorized"

    db.session.delete(item)
    db.session.commit()
    return redirect(url_for("cart.view_cart"))

@cart_bp.route("/cart-buy/<int:item_id>")
@login_required
def cart_buy(item_id):
    item = Cart.query.get_or_404(item_id)
    product = Product.query.get(item.product_id)

    if product.stock < item.quantity:
        return "Not enough stock"

    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=item.quantity,
        total_price=product.price * item.quantity
    )

    product.stock -= item.quantity

    db.session.add(order)
    db.session.delete(item)
    db.session.commit()

    return redirect(url_for("products.home"))

@cart_bp.route("/checkout")
@login_required
def checkout():
    items = Cart.query.filter_by(user_id=current_user.id).all()

    if not items:
        flash("Your cart is empty", "error")
        return redirect(url_for("cart.view_cart"))

    for item in items:
        product = Product.query.get(item.product_id)
        if product.stock < item.quantity:
            flash(f"Not enough stock for {product.name}", "error")
            return redirect(url_for("cart.view_cart"))


    for item in items:
        product = Product.query.get(item.product_id)

        order = Order(
            buyer_id=current_user.id,
            product_id=product.id,
            quantity=item.quantity,
            total_price=product.price * item.quantity
        )

        product.stock -= item.quantity
        db.session.add(order)

    Cart.query.filter_by(user_id=current_user.id).delete()

    db.session.commit()

    flash("All items purchased successfully!", "success")
    return redirect(url_for("products.home"))



