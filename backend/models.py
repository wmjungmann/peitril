from flask_sqlalchemy import SQLAlchemy
from uuid import _uuid
import datetime

db = SQLAlchemy()

class Stations(db.Model):
    __tablename__ = "stations"
    station_id = db.Column(db.Integer, primary_key=True)
    station_brand = db.Column(db.String(30))
    location_name = db.Column(db.String(30))
    x_coord = db.Column(db.Float)
    y_coord = db.Column(db.Float)
    
    def __init__(self, station_brand, location_name, x_coord, y_coord):
        self.station_brand = station_brand
        self.location_name = location_name
        self.x_coord = x_coord
        self.y_coord = y_coord


class Accounts(db.Model):
    __tablename__ = "accounts"
    account_id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String(100))
    first_name = db.Column(db.String(30))
    second_name = db.Column(db.String(30))
    email = db.Column(db.String(30))
    price_pref = db.Column(db.Float)
    dist_pref = db.Column(db.Float)
    
    def __init__(self, password, first_name, second_name, email, price_pref, dist_pref):
        self.password = password
        self.first_name = first_name
        self.second_name = second_name
        self.email = email
        self.price_pref = price_pref
        self.dist_pref = dist_pref


class Prices(db.Model):

    __tablename__ = "prices"
    price_id = db.Column(db.Integer, primary_key=True)
    petrol_price = db.Column(db.Float)
    diesel_price = db.Column(db.Float)
    day_date = db.Column(db.DateTime, default = datetime.datetime.now)
    station_fk = db.Column(db.Integer)
    account_fk = db.Column(db.Integer)
    
    station = db.relationship("Stations"), db.ForeignKey('stations.station_id')
    account = db.relationship("Accounts"), db.ForeignKey('accounts.account_id')

    def __init__(self, petrol_price, diesel_price, day_date, station_fk, account_fk):
        self.petrol_price = petrol_price
        self.diesel_price = diesel_price
        self.day_date = day_date
        self.station_fk = station_fk
        self.account_fk = account_fk


class Favourites(db.Model):

    __tablename__ = "favourites"
    favourite_id = db.Column(db.Integer, primary_key=True)
    station_fk = db.Column(db.Integer)
    account_fk = db.Column(db.Integer)
    
    station = db.relationship("Stations"), db.ForeignKey('stations.station_id')
    account = db.relationship("Accounts"), db.ForeignKey('accounts.account_id')

    def __init__(self, station_fk, account_fk):
        self.station_fk = station_fk
        self.account_fk = account_fk
