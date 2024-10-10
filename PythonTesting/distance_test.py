import unittest
import math

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

class TestDistanceCalculation(unittest.TestCase):
    def test_distance_inside_limit(self):
        # Test case 1: Three stations with known cordinates, two within the distance limit, one outside
        lat_user, lon_user = 53.267983, -6.12041  # User cordinates
        lat1, lon1 = 53.27026, -6.141424  # Killiney

        # Expected distance in metres
        expected_distance = 5000  
        
        # Call the function to calculate distance
        less_than1 = calculate_distance(lat_user, lon_user, lat1, lon1)
        
        # Assert that the calculated distance is within the distance limit
        self.assertLessEqual(less_than1, expected_distance)
        

    def test_distance_outside_limit(self):
        #Test case 2: Known station location falls outside the distance limit
        lat_user, lon_user = 53.267983, -6.12041  # User cordinates
        lat3, lon3 = 52.672394, -6.3180037  # Gorey
        
        # Expected distance in metres
        expected_distance = 5000  
        
        # Call the function to calculate distance
        greater_than1 = calculate_distance(lat_user, lon_user, lat3, lon3)
        
        # Assert that the calculated distance is outside the distance limit
        self.assertGreater(greater_than1, expected_distance)
        
    def test_distance_zero_limit(self):
        # Test case 1: Station and user coordinates are the same resulting in 0 distance
        lat_user, lon_user = 53.267983, -6.12041  # User cordinates
        lat1, lon1 = 53.267983, -6.12041  # Killiney

        # Expected distance in metres
        expected_distance = 0  
        
        # Call the function to calculate distance
        less_than1 = calculate_distance(lat_user, lon_user, lat1, lon1)
         
        # Assert that the calculated distance is within the distance limit
        self.assertEqual(less_than1, expected_distance)
           
        
if __name__ == '__main__':
    unittest.main()