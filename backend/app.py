from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, or_, and_
from flask_bcrypt import Bcrypt 
from datetime import datetime
from flask_marshmallow import Marshmallow
from sqlalchemy.orm.exc import NoResultFound
import math
from sqlalchemy.orm import aliased
from models import db, Accounts, Stations, Prices, Favourites
from config import ApplicationConfig
from flask_cors import CORS
from flask_session import Session
from schema import stations_schema, station_schema, account_schema, accounts_schema, price_schema, prices_schema
import sys
from price_extraction import ExtractPrice 
from submit_station import SendEmail
from PIL import Image
import os

 
app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

app.config.from_object(ApplicationConfig)
db.init_app(app)
with app.app_context():
    db.create_all
    
server_session = Session(app)

# Calculate the distance from the user to the stations
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in kilometers

    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula to calculate distance
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    # Distance in kilometers
    distance_km = R * c  
    
    # Distance in metres
    distance_m = distance_km * 1000
    
    return distance_m


@app.route("/register", methods=["POST"])
def register_user():
    #gets email and password input
    firstName = request.json["firstName"]
    secondName = request.json["secondName"]
    email = request.json["email"]
    password = request.json["password"]
    passwordCheck = request.json["confirmPassword"]
    
    if not all([firstName, secondName, email, password, passwordCheck]):
        return jsonify({'message': 'All fields are required'}), 400
    
    if password != passwordCheck:
        return jsonify({'message': 'Passwords do not match'}), 400

    account_exists = Accounts.query.filter_by(email=email).first() is not None

    if account_exists:
        return jsonify({"error": "Email already in use"}), 409
    
    hashed_password = bcrypt.generate_password_hash(password)
    store_password = hashed_password.decode('utf-8')
    
    new_user = Accounts(first_name=firstName, second_name=secondName, email=email, password=store_password, price_pref=1.75, dist_pref=5)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Registration Successful', 'password': store_password}), 200
    
    
# Account login
@app.route('/login', methods=['POST'])
def login():
    email = request.json['email']
    password = request.json['password']
    
    # Find account with matching email

    account = Accounts.query.filter_by(email=email).first()
    
    if account is None:
        return jsonify({'error': 'User does not exist'}), 404
    
    # Check if password is the same as hashed password
    if not bcrypt.check_password_hash(account.password, password):
        return jsonify({'error': 'Incorrect password'}), 401
    
    session['account_id'] = account.account_id
    
    return jsonify({'message': 'Login successful'}), 200


@app.route("/@current_account", methods=["GET"])
def get_current_account():
    if session.get("account_id"):
        current_id = session.get("account_id")
        
        if current_id:
            account = Accounts.query.filter_by(account_id=current_id).first()
        
        if account:
            return jsonify({
                "firstName": account.first_name,
                "secondName": account.second_name,
                "email": account.email,
                "pricePref": account.price_pref,
                "distPref": account.dist_pref
            }), 200
        else:
            return jsonify({
            "firstName": "Guest"
        }), 200
    else:
        return jsonify({
            "firstName": "Guest"
        }), 200

      
@app.route("/logout", methods=["GET"])
def logout_user():

    if session.get("account_id"):
        session.pop('account_id')
    
    return jsonify({'message': 'User logged out'}), 200


@app.route("/mapPreferences", methods=["GET"])
def get_map_preferences():
    if session.get("account_id"):
        current_id = session.get("account_id")
        
        if current_id:
            account = Accounts.query.filter_by(account_id=current_id).first()
        
        if account:
            return jsonify({
                "type": "Registered",
                "pricePref": account.price_pref,
                "distPref": account.dist_pref
            }), 200
        else:
            return jsonify({
            "type": "Guest",
            "pricePref": 0,
            "distPref": 5
            }), 200
    else:
        return jsonify({
            "type": "Guest",
            "pricePref": 0,
            "distPref": 5
        }), 200


# Update preferences
@app.route('/update_preferences', methods=['POST'])
def update_preferences():
    sys.stdout.flush()
    
    price = request.json['pricePref']
    distance = request.json['distPref']
    
    if session.get("account_id"):
        current_id = session.get("account_id")
        print(price)
        account = Accounts.query.filter_by(account_id=current_id).first()

        if account is None:
            return jsonify({'message': 'User does not exist'}), 404
        
        # Update preferences in the database
        account.price_pref = price
        account.dist_pref = distance
        
        # Commit changes to the database
        db.session.commit()
        
        return jsonify({'message': 'Preferences Updated'}), 200
        
        
@app.route('/get_stations', methods = ['POST'])
def get_stations():
    
    sys.stdout.flush()

    
    # Convert retrieved args from json
    user_lng = request.json["longitude"]
    user_lat = request.json["latitude"]
    
    if session.get("account_id"):
        current_id = session.get("account_id")
        account = Accounts.query.filter_by(account_id=current_id).first()
        
        # Get price and distance preferences
        price_pref = account.price_pref
        limit = account.dist_pref * 1000
    else:
        # If user is not logged in set limit at 5km and 0 price
        limit = 5000
        price_pref = 0
    
    # Check if the user hasn't allowed for location permission
    if (user_lat) == 9999 and (user_lng == 9999): 
        
        all_stations = Stations.query.all()
    
        results = stations_schema.dump(all_stations)
    
        return jsonify(results)
    # Else if user has given location permissions
    else:

        # Subquery to get the maximum date for each station
        max_date_subquery = db.session.query(
            Prices.station_fk,
            func.max(Prices.day_date).label("max_date")
        ).group_by(
            Prices.station_fk
        ).subquery()
        
        # Find all stations with most recent price for that station
        stations_with_price = db.session.query(
            Stations.station_id,
            Stations.station_brand,
            Stations.location_name,
            Stations.x_coord,
            Stations.y_coord,
            Prices.day_date,
            func.coalesce(Prices.petrol_price, None).label("petrol_price"),  
            func.coalesce(Prices.diesel_price, None).label("diesel_price")   
        ).select_from(
            Stations
        ).outerjoin(
            Prices,
            Stations.station_id == Prices.station_fk
        ).outerjoin(
            max_date_subquery,   
            Stations.station_id== max_date_subquery.c.station_fk  
        ).filter(
            or_(
            max_date_subquery.c.max_date == Prices.day_date,
            Prices.day_date.is_(None)             
          )
        )
        
        stations_within_radius = []
        # Cycle through all stations
        if stations_with_price != None :
            for station in stations_with_price:
                
                # Calculate the distance between the user and the station using Haversine formula
                distance = calculate_distance(user_lat, user_lng, station.x_coord, station.y_coord)
                
                # Check if the station is within the preferred radius
                if distance <= limit:
                    if station.petrol_price is not None:
                        price_value = station.petrol_price
                    
                        if price_value <= price_pref:
                            colour = "green"
                        elif price_value <= price_pref + 0.05:
                            colour = "yellow"
                        else:
                            colour = "red"
                            
                                            
                        coloured_station = {
                            "station_id": station.station_id,
                            "station_brand": station.station_brand,
                            "location_name": station.location_name,
                            "x_coord": station.x_coord,
                            "y_coord": station.y_coord,
                            "pet_price": station.petrol_price,
                            "die_price": station.diesel_price,
                            "date": station.day_date,
                            "colour": colour
                        }
                    
                    else:
                        colour = "navy"

                        coloured_station = {
                            "station_id": station.station_id,
                            "station_brand": station.station_brand,
                            "location_name": station.location_name,
                            "x_coord": station.x_coord,
                            "y_coord": station.y_coord,
                            "pet_price": "0.00",
                            "die_price": "0.00",
                            "date": "No price information",
                            "colour": colour
                        }
                    

                    stations_within_radius.append(coloured_station)
            
                
            return jsonify(stations_within_radius)
        else: 
            print("error")


# Getting a single station
@app.route('/get_nearest_station', methods = ['POST'])
def get_nearest_station():
    user_lat = request.json['user_lat']
    user_long = request.json['user_long']
    
    # Retrieve all stations from the database
    all_stations = Stations.query.all()

    # Initialize variables to store the closest station and its distance
    closest_station = None
    closest_distance = float('inf')

    # Iterate through all stations to find the closest one
    for station in all_stations:
        # Calculate the distance between the user's coordinates and the station
        distance = calculate_distance(user_lat, user_long, station.x_coord, station.y_coord)
        
        # Update closest_station and closest_distance if the current station is closer
        if distance < closest_distance:
            closest_station = station
            closest_distance = distance

    # Check if a closest station was found
    if closest_station:
        # Serialize the closest station and return it
        return station_schema.jsonify(closest_station)
    else:
        return jsonify({'message': 'No stations found'}), 404


# Adding a station
@app.route('/add_price', methods = ['POST'])
def add_price():
    
    station_fk = request.json['station_id']
    petrol_price = request.json['petrol_price']
    diesel_price = request.json['diesel_price']
    account_fk = session.get("account_id")
    date_input = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    price = Prices(petrol_price, diesel_price, date_input, station_fk, account_fk)
    db.session.add(price)
    db.session.commit()
    
    return jsonify({'message': 'Price added'}), 200


# Getting a single price
@app.route('/get_price', methods = ['POST'])
def get_price():
    sys.stdout.flush()
    
    station_id = request.json['station_id']
    
    latest_price = Prices.query.filter_by(
        station_fk=station_id
        ).order_by(
            Prices.day_date.desc()
        ).first()
        
    if latest_price:
        petrol_split = []
        diesel_split = []
        
        petrol_price = str(latest_price.petrol_price)
        diesel_price = str(latest_price.diesel_price)
        
        petrol_price = petrol_price.replace(".", "")
        diesel_price = diesel_price.replace(".", "")
        
        if len(petrol_price) < 3:
            petrol_price = petrol_price + "0"
        if len(diesel_price) < 3:
            diesel_price = diesel_price + "0"

        petrol_split[:] = petrol_price
        diesel_split[:] = diesel_price
        
        result = {
            "p1": petrol_split[0],
            "p2": petrol_split[1],
            "p3": petrol_split[2],
            "d1": diesel_split[0],
            "d2": diesel_split[1],
            "d3": diesel_split[2],
            "date": latest_price.day_date
        }
    else: 
        result = {
            "p1": "0",
            "p2": "0",
            "p3": "0",
            "d1": "0",
            "d2": "0",
            "d3": "0",
            "date": "No price available"
        }
    return(result)

# Getting a single price
@app.route('/parse_price', methods = ['POST'])
def parse_price():
    sys.stdout.flush()
    
    petrol_price = request.json['petrol_price']
    diesel_price = request.json['diesel_price']
    
    if petrol_price == 0 or diesel_price == 0:
        result = {
            "p1": "0",
            "p2": "0",
            "p3": "0",
            "d1": "0",
            "d2": "0",
            "d3": "0"
        }
    else:
        petrol_split = []
        diesel_split = []
        
        petrol_price = petrol_price.replace(".", "")
        diesel_price = diesel_price.replace(".", "")
        
        if len(petrol_price) < 3:
            petrol_price = petrol_price + "0"
        if len(diesel_price) < 3:
            diesel_price = diesel_price + "0"

        petrol_split[:] = petrol_price
        diesel_split[:] = diesel_price
        
        result = {
            "p1": petrol_split[0],
            "p2": petrol_split[1],
            "p3": petrol_split[2],
            "d1": diesel_split[0],
            "d2": diesel_split[1],
            "d3": diesel_split[2]
        }
        
    return(result)

# Getting a single station
@app.route('/get_station', methods = ['POST'])
def get_station():
    sys.stdout.flush()
    
    station_id = request.json['station_id']
    
    station  = Stations.query.filter_by(station_id=station_id).first()
        
    return station_schema.jsonify(station)

# Proces image price
@app.route('/price_extraction', methods = ['POST'])
def price_extraction():
    
    image_file = request.files['image']
    
    # Save image to server
    image_path = os.path.join(app.root_path, 'uploads', image_file.filename)
    image_file.save(image_path)
    
    # Retrieve stored image
    image = Image.open(image_path)

    petrol_price, diesel_price = ExtractPrice(image)
    
    station_id = request.form['station_id']
    
    # Check that prices have been extracted correctly
    if petrol_price == None and diesel_price == None:
        return jsonify({'message': 'Price Extraction Unsuccessful',
                        'petrol_price': 0,
                        'diesel_price': 0}), 200 
    else:
        return jsonify({'message': "Price Extraction Successful",
                        'petrol_price': petrol_price,
                        'diesel_price': diesel_price}), 200 
    
    
# Get favourite stations
@app.route('/get_favourites', methods = ['GET'])  
def get_favourites():
    sys.stdout.flush()
    
    current_id = session.get("account_id")
    account = Accounts.query.filter_by(account_id=current_id).first()
        
    # Get price and distance preferences
    price_pref = account.price_pref
    
    favourites = Favourites.query.filter_by(account_fk=current_id).all()
    
    station_ids = []
    
    # Extract station ids from favourites
    for favourite in favourites:
        station_ids.append(favourite.station_fk)
    
    # Subquery to get the maximum date for each station
    max_date_subquery = db.session.query(
        Prices.station_fk,
        func.max(Prices.day_date).label("max_date")
    ).group_by(
        Prices.station_fk
    ).subquery()
    
    # Query stations using station ids from favourites    
    favourite_stations = db.session.query(
            Stations.station_id,
            Stations.station_brand,
            Stations.location_name,
            Stations.x_coord,
            Stations.y_coord,
            Prices.day_date,
            func.coalesce(Prices.petrol_price, None).label("petrol_price"),  # Set petrol_price to null if it's null in Prices
            func.coalesce(Prices.diesel_price, None).label("diesel_price")   # Set diesel_price to null if it's null in Prices
        ).select_from(
            Stations
        ).outerjoin(
            Prices,
            Stations.station_id == Prices.station_fk
        ).outerjoin(
            max_date_subquery,   
            Stations.station_id== max_date_subquery.c.station_fk  
        ).filter(
            and_(
                or_(
                max_date_subquery.c.max_date == Prices.day_date,
                Prices.day_date.is_(None)             
                ),
                Stations.station_id.in_(station_ids)
            )
        )
        
    
    return_stations = []
    
    # Cycle through all stations
    if favourite_stations != None :
        for station in favourite_stations:
            if station.petrol_price is not None:
                price_value = station.petrol_price
            
                if price_value <= price_pref:
                    colour = "green"
                elif price_value <= price_pref + 0.05:
                    colour = "yellow"
                else:
                    colour = "red"
                    
                                    
                coloured_station = {
                    "station_id": station.station_id,
                    "station_brand": station.station_brand,
                    "location_name": station.location_name,
                    "x_coord": station.x_coord,
                    "y_coord": station.y_coord,
                    "pet_price": station.petrol_price,
                    "die_price": station.diesel_price,
                    "date": station.day_date,
                    "colour": colour
                }
            
            else:
                colour = "navy"

                coloured_station = {
                    "station_id": station.station_id,
                    "station_brand": station.station_brand,
                    "location_name": station.location_name,
                    "x_coord": station.x_coord,
                    "y_coord": station.y_coord,
                    "pet_price": "0.00",
                    "die_price": "0.00",
                    "date": "No price information",
                    "colour": colour
                }
            
            return_stations.append(coloured_station)
    else:
        return jsonify({'message': "No favourites found"}), 200 
    
    print(return_stations)
    
    return jsonify(return_stations)


@app.route('/add_favourite', methods = ['POST'])  
def add_favourite():
    current_id = session.get("account_id")
    station = request.json["station_id"]
    
    # Check if the record already exists in the database
    if Favourites.query.filter_by(account_fk=current_id, station_fk=station).first():
        return jsonify({'error': 'Favorite already exists'}), 409
    
    # Create a new Favorite record and add it to the database
    new_favorite = Favourites(account_fk=current_id, station_fk=station)
    
    db.session.add(new_favorite)
    db.session.commit()

    
    return jsonify({'message': 'Favourite added'}), 200

    
# Get favourite stations
@app.route('/remove_favourite', methods = ['POST'])  
def remove_favourite():
    current_id = session.get("account_id")
    station = request.json["station_id"]
    
    favourite = Favourites.query.filter_by(account_fk=current_id, station_fk=station).first()

    db.session.delete(favourite)
    db.session.commit()
    
    return jsonify({'message': 'Favourite removed'}), 200
    
    
@app.route('/add_station', methods = ['POST'])  
def add_station():
    current_id = session.get("account_id")
    y_coords = request.json["longitude"]
    x_coords = request.json["latitude"]
    location_name = request.json["name"]
    location_brand = request.json["brand"]
    petrol_price = request.json["petrol"]
    diesel_price = request.json["diesel"]
    date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    emailConfirm, message = SendEmail(current_id, y_coords, x_coords, location_name, location_brand, petrol_price, diesel_price, date)
    
    if emailConfirm == True:
        return jsonify({'message': message}), 200
    else: 
        return jsonify({'message': message}), 500
    

if __name__ == "__main__":
    app.run(debug = True, host = '0.0.0.0', port=5000)
    
#Run with python -m flask run --host=0.0.0.0