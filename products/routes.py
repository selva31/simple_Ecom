from flask import Blueprint, render_template, request, redirect, url_for, current_app, flash
from extensions import db
from models import Product, ProductImage, Order
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os, io, base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

products_bp = Blueprint("products", __name__)


CATEGORY_COLOR_PALETTE = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A8",
    "#FFC300", "#DAF7A6", "#581845", "#900C3F"
]

@products_bp.route("/")
def home():
    products = Product.query.all()
    return render_template("home.html", products=products)

@products_bp.route("/add-product", methods=["GET", "POST"])
@login_required
def add_product():
    if current_user.role.strip().lower() != "seller":
        return "Only sellers allowed"

    if request.method == "POST":
        category = request.form["category"].strip().lower()
        product = Product(
            name=request.form["name"],
            price=float(request.form["price"]),
            stock=int(request.form["stock"]),
            category=category,
            seller_id=current_user.id,
            description = request.form["description"]

        )
        db.session.add(product)
        db.session.commit()

        # Save multiple images
        files = request.files.getlist("images")
        for f in files:
            if f.filename:
                filename = secure_filename(f.filename)
                f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                img = ProductImage(product_id=product.id, filename=filename)
                db.session.add(img)
        db.session.commit()

        flash("Product added successfully!", "success")
        return redirect(url_for("products.home"))

    return render_template("add_product.html")


@products_bp.route("/edit-product/<int:product_id>", methods=["GET", "POST"])
@login_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    if product.seller_id != current_user.id:
        return "Unauthorized"

    if request.method == "POST":
        product.name = request.form["name"]
        product.price = float(request.form["price"])
        product.stock = int(request.form["stock"])
        product.category = request.form["category"].strip().lower()
        product.description = request.form["description"]

        # Add new images
        files = request.files.getlist("images")
        for f in files:
            if f.filename:
                filename = secure_filename(f.filename)
                f.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                img = ProductImage(product_id=product.id, filename=filename)
                db.session.add(img)

        db.session.commit()
        flash("Product updated successfully!", "success")
        return redirect(url_for("products.seller_dashboard"))

    return render_template("edit_product.html", product=product)

@products_bp.route("/buy-now/<int:product_id>")
@login_required
def buy_now(product_id):
    product = Product.query.get_or_404(product_id)
    if product.stock < 1:
        flash("Out of stock!", "error")
        return redirect(url_for("products.home"))

    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=1,
        total_price=product.price
    )
    product.stock -= 1
    db.session.add(order)
    db.session.commit()

    flash("Order placed successfully!", "success")
    return redirect(url_for("products.home"))


@products_bp.route("/seller-dashboard")
@login_required
def seller_dashboard():
    if current_user.role.strip().lower() != "seller":
        flash("Access denied", "error")
        return redirect(url_for("products.home"))

    products = Product.query.filter_by(seller_id=current_user.id).all()


    categories = sorted({p.category for p in products})
    category_colors = {cat: CATEGORY_COLOR_PALETTE[i % len(CATEGORY_COLOR_PALETTE)]
                       for i, cat in enumerate(categories)}


    names = [p.name for p in products]
    stocks = [p.stock for p in products]
    stock_colors = [category_colors[p.category] for p in products]

    plt.figure(figsize=(6,4))
    plt.bar(names, stocks, color=stock_colors)
    plt.xlabel("Products")
    plt.ylabel("Stock Quantity")
    plt.title("Stock Overview by Category")
    stock_img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(stock_img, format='png')
    stock_img.seek(0)
    stock_plot = base64.b64encode(stock_img.getvalue()).decode()
    plt.close()

    #  Revenue Pie Chart
    labels = [p.name for p in products]
    sizes = [sum(o.total_price for o in Order.query.filter_by(product_id=p.id).all()) for p in products]
    pie_colors = [category_colors[p.category] for p in products]

    plt.figure(figsize=(6,6))
    plt.pie(
        sizes,
        labels=labels,
        autopct='%1.1f%%',
        startangle=140,
        colors=pie_colors,
        wedgeprops={'edgecolor':'black'}
    )
    plt.title("Revenue Distribution by Category")
    rev_img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(rev_img, format='png')
    rev_img.seek(0)
    revenue_plot = base64.b64encode(rev_img.getvalue()).decode()
    plt.close()

    return render_template(
        "seller_dashboard.html",
        products=products,
        stock_plot=stock_plot,
        revenue_plot=revenue_plot
    )


@products_bp.route("/seller/orders")
@login_required
def seller_orders():
    if current_user.role.strip().lower() != "seller":
        flash("Access denied", "error")
        return redirect(url_for("products.home"))

    seller_products = Product.query.filter_by(seller_id=current_user.id).all()
    product_ids = [p.id for p in seller_products]
    orders = Order.query.filter(Order.product_id.in_(product_ids)).order_by(Order.created_at.desc()).all()
    return render_template("seller_orders.html", orders=orders)


@products_bp.route("/seller/order/<int:order_id>/update", methods=["POST"])
@login_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    if order.product.seller_id != current_user.id:
        flash("Unauthorized", "error")
        return redirect(url_for("products.home"))

    order.status = request.form.get("status")
    db.session.commit()
    flash("Order status updated!", "success")
    return redirect(url_for("products.seller_orders"))


@products_bp.route("/seller/customers")
@login_required
def seller_customers():
    if current_user.role.strip().lower() != "seller":
        flash("Access denied", "error")
        return redirect(url_for("products.home"))

    seller_products = Product.query.filter_by(seller_id=current_user.id).all()
    product_ids = [p.id for p in seller_products]
    orders = Order.query.filter(Order.product_id.in_(product_ids)).all()
    customers = {order.buyer for order in orders}

    return render_template("seller_customers.html", customers=customers)




@products_bp.route("/product/<int:product_id>")
def product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    images = ProductImage.query.filter_by(product_id=product.id).all()

    related_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product.id
    ).limit(4).all()

    return render_template(
        "product_detail.html",
        product=product,
        images=images,
        related_products=related_products
    )

