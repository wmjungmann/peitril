import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

options = webdriver.ChromeOptions()

#options.add_argument('--ignore-certificate-errors')
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.add_experimental_option('prefs', {"profile.default_content_setting_values.geolocation": 1})

driver = webdriver.Chrome(
    options = options
)

driver.get('https://locations.valero.com/')

loc_names = []
addresses = []
x_coords = []
y_coords = []
links = []

content = driver.page_source

soup = BeautifulSoup(content, features="html.parser")

# Zoom out of the map
for i in range(0, 7):
    WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, "//button[@title=\"Zoom out\"]"))).click()

# Wait for all information to load
time.sleep(20)

# Find location names and addresses by XPATH
locations = driver.find_elements(By.XPATH, "//div[@class=\"resultPanelItem\"]/a")
addresses_el = driver.find_elements(By.XPATH, "//div[@class=\"resultPanelItemAddress\"]")

# Append location names to a list
for location in locations:
    location_name = location.text
    
    loc_names.append(location_name)
    
# Clean and append addresses to list
for address in addresses_el:
    address_name = address.text
    address_name.strip("\n")
    address_name.replace(",", "")
    

    addresses.append(address_name)
    print(address_name)

df = pd.DataFrame({'Location': loc_names, 'Address': addresses})
df.to_csv('texaco.csv', index=False, encoding='utf-8')