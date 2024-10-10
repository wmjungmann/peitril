from flask_marshmallow import Marshmallow

ma = Marshmallow()

class StationSchema(ma.Schema):
    class Meta:
        fields = ('station_id', 'station_brand', 'location_name', 'x_coord', 'y_coord')
        

class AccountSchema(ma.Schema):
    class Meta:
        fields = ('account_id', 'password', 'first_name', 'second_name', 'email', 'price_pref', 'dist_pref')
        

class PriceSchema(ma.Schema):
    class Meta:
        fields = ('price_id', 'petrol_price', 'diesel_price', 'station_fk', 'account_fk', 'day_date')

class FavouriteSchema(ma.Schema):
    class Meta:
        fields = ('favourite_id', 'station_fk', 'account_fk')        

station_schema = StationSchema()
stations_schema = StationSchema(many=True)

account_schema = AccountSchema()
accounts_schema = AccountSchema(many=True)

price_schema = PriceSchema()
prices_schema = PriceSchema(many=True)

favourite_schema = FavouriteSchema()
favourites_schema = FavouriteSchema(many=True)