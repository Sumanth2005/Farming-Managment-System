from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash
)
from supabase import create_client
from dotenv import load_dotenv
import os
import re


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# FLASK APPLICATION
# =========================================================

app = Flask(__name__)

app.secret_key = os.getenv(
    "SECRET_KEY",
    "farming_management_secret_key"
)


# =========================================================
# SUPABASE CONFIGURATION
# =========================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception(
        "SUPABASE_URL or SUPABASE_KEY is missing in the .env file"
    )

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# =========================================================
# VALIDATION FUNCTIONS
# =========================================================

def valid_name(name):
    """
    Name can contain only letters and spaces.
    """

    return re.fullmatch(
        r"[A-Za-z ]+",
        name
    ) is not None


def valid_phone(phone):
    """
    Phone number must contain exactly 10 digits.
    """

    return re.fullmatch(
        r"[0-9]{10}",
        phone
    ) is not None


def valid_email(email):
    """
    Basic email validation.
    """

    return re.fullmatch(
        r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$",
        email
    ) is not None


# =========================================================
# LOGIN PAGE
# =========================================================

@app.route("/", methods=["GET", "POST"])
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        name = request.form.get(
            "name",
            ""
        ).strip()

        phone = request.form.get(
            "phone",
            ""
        ).strip()

        email = request.form.get(
            "email",
            ""
        ).strip().lower()


        # -------------------------------------------------
        # EMPTY FIELD VALIDATION
        # -------------------------------------------------

        if not name or not phone or not email:

            flash(
                "All fields are required.",
                "error"
            )

            return redirect(
                url_for("login")
            )


        # -------------------------------------------------
        # NAME VALIDATION
        # -------------------------------------------------

        if not valid_name(name):

            flash(
                "Name should contain only letters and spaces.",
                "error"
            )

            return redirect(
                url_for("login")
            )


        # -------------------------------------------------
        # PHONE VALIDATION
        # -------------------------------------------------

        if not valid_phone(phone):

            flash(
                "Phone number must be exactly 10 digits.",
                "error"
            )

            return redirect(
                url_for("login")
            )


        # -------------------------------------------------
        # EMAIL VALIDATION
        # -------------------------------------------------

        if not valid_email(email):

            flash(
                "Enter a valid email address.",
                "error"
            )

            return redirect(
                url_for("login")
            )


        try:

            # Check whether the email is already present
            existing_user_response = (
                supabase
                .table("users")
                .select("*")
                .eq("email", email)
                .execute()
            )

            existing_users = (
                existing_user_response.data or []
            )


            if existing_users:

                user = existing_users[0]

                session["user_name"] = user.get(
                    "name",
                    name
                )

                session["user_email"] = user.get(
                    "email",
                    email
                )

                session["user_phone"] = user.get(
                    "phone",
                    phone
                )

                flash(
                    "Welcome back!",
                    "success"
                )

                return redirect(
                    url_for("welcome")
                )


            # Create a new user when the email does not exist
            insert_response = (
                supabase
                .table("users")
                .insert(
                    {
                        "name": name,
                        "phone": phone,
                        "email": email
                    }
                )
                .execute()
            )


            if not insert_response.data:

                flash(
                    "Unable to save your details. Please try again.",
                    "error"
                )

                return redirect(
                    url_for("login")
                )


            session["user_name"] = name
            session["user_email"] = email
            session["user_phone"] = phone


            flash(
                "Login successful.",
                "success"
            )

            return redirect(
                url_for("welcome")
            )


        except Exception as error:

            print("LOGIN ERROR:", error)

            flash(
                "Database error. Please check your Supabase connection and RLS policy.",
                "error"
            )

            return redirect(
                url_for("login")
            )


    return render_template(
        "login.html"
    )


# =========================================================
# WELCOME PAGE
# =========================================================

@app.route("/welcome")
def welcome():

    if "user_name" not in session:

        flash(
            "Please login to continue.",
            "error"
        )

        return redirect(
            url_for("login")
        )


    return render_template(
        "welcome.html",
        name=session.get("user_name"),
        email=session.get("user_email"),
        phone=session.get("user_phone")
    )


# =========================================================
# CATEGORY PAGE
# =========================================================

@app.route("/category/<category_name>")
def category(category_name):

    if "user_name" not in session:

        flash(
            "Please login to continue.",
            "error"
        )

        return redirect(
            url_for("login")
        )


    category_name = (
        category_name
        .lower()
        .strip()
    )


    titles = {
        "poultry": "Poultry Management",
        "fish": "Fish Farming Management",
        "dairy": "Dairy Management"
    }


    if category_name not in titles:

        return render_template(
            "404.html"
        ), 404


    try:

        response = (
            supabase
            .table("animals")
            .select("*")
            .ilike(
                "category",
                category_name
            )
            .order("id")
            .execute()
        )


        animals = response.data or []


        print("\n========== CATEGORY DEBUG ==========")

        print(
            "CATEGORY:",
            category_name
        )

        print(
            "TOTAL ANIMALS:",
            len(animals)
        )


        for animal in animals:

            print("--------------------------------")

            print(
                "ID        :",
                animal.get("id")
            )

            print(
                "Name      :",
                animal.get("name")
            )

            print(
                "Category  :",
                animal.get("category")
            )

            print(
                "Image URL :",
                animal.get("image_url")
            )


        print("====================================\n")


        return render_template(
            "category.html",
            title=titles[category_name],
            category=category_name,
            animals=animals,
            name=session.get("user_name")
        )


    except Exception as error:

        print(
            "CATEGORY ERROR:",
            error
        )

        flash(
            "Unable to fetch animal data.",
            "error"
        )

        return redirect(
            url_for("welcome")
        )


# =========================================================
# ANIMAL DETAILS PAGE
# =========================================================

@app.route("/animal/<int:animal_id>")
def animal_detail(animal_id):

    if "user_name" not in session:

        flash(
            "Please login to continue.",
            "error"
        )

        return redirect(
            url_for("login")
        )


    try:

        response = (
            supabase
            .table("animals")
            .select("*")
            .eq(
                "id",
                animal_id
            )
            .execute()
        )


        animals = response.data or []


        if not animals:

            flash(
                "Animal details were not found.",
                "error"
            )

            return redirect(
                url_for("welcome")
            )


        animal = animals[0]


        print(
            "\n========== ANIMAL DETAIL DEBUG =========="
        )

        print(
            "ID        :",
            animal.get("id")
        )

        print(
            "Name      :",
            animal.get("name")
        )

        print(
            "Category  :",
            animal.get("category")
        )

        print(
            "Image URL :",
            animal.get("image_url")
        )

        print(
            "=========================================\n"
        )


        return render_template(
            "animal_detail.html",
            animal=animal,
            name=session.get("user_name")
        )


    except Exception as error:

        print(
            "ANIMAL DETAIL ERROR:",
            error
        )

        flash(
            "Unable to fetch animal details.",
            "error"
        )

        return redirect(
            url_for("welcome")
        )


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.clear()

    flash(
        "You have been logged out successfully.",
        "success"
    )

    return redirect(
        url_for("login")
    )


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    try:

        return render_template(
            "404.html"
        ), 404

    except Exception:

        return "Page not found", 404


@app.errorhandler(500)
def internal_server_error(error):

    print(
        "SERVER ERROR:",
        error
    )

    return (
        "Something went wrong. Please try again later.",
        500
    )


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )