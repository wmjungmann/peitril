import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

options = webdriver.ChromeOptions()

options.add_experimental_option('excludeSwitches', ['enable-logging'])

driver = webdriver.Chrome()

driver.get('https://stations.maxol.ie/stores')



counties = []
addresses = []
regions = []
names = []
eircodes = []
x_coords = []
y_coords = []

links = []
station_web = []

content = driver.page_source

soup = BeautifulSoup(content, features="html.parser")

linksSection = driver.find_elements(By.XPATH, "//li[@class=\"directory-manager-card\"]/a")

# Counties to ignore
norn_iron = ["Antrim", "Armagh", "Derry", "Down", "Fermanagh", "Tyrone"]

# Cycle through county URLS, ignore Northern Irish counties
for element in linksSection:
    
    # Find URL
    url_full = element.get_attribute('href')
    
    # Find location name label
    location = element.text
    
    # Clean label to allow comparison with listed counties
    loca = location.split("\n")
    
    # Append county URL if in the ROI
    if loca[0] not in norn_iron:
        links.append(url_full)
    
    
    
for link in links:
    driver.get(link)
    
    # Find link for every station in a county
    stationLinks = driver.find_elements(By.XPATH, "//a[@data-ya-track=\"Visit Page\"]")
    
    # Find the specific URLS so they could be visited by the selenium driver
    for station in stationLinks:
        station_url = station.get_attribute('href')
        
        station_web.append(station_url)
    

for station_link in station_web:
    driver.get(station_link)
    
    name = driver.find_element(By.XPATH, "//h4[@class=\"location-name\"]").text
    
    # Find the location address
    locationSpans = driver.find_elements(By.XPATH, "//div[@class=\"icon-row address\"]/div/div/span")
    
    
    address = locationSpans[0].text

    region = locationSpans[1].text

    county = locationSpans[2].text

    eircode = locationSpans[3].text
    
    names.append(name)
    addresses.append(address)
    regions.append(region)
    counties.append(county)
    eircodes.append(eircode)

    
    # Find coordinates
    url_find = driver.find_element(By.XPATH, "//a[@target=\"_blank\"]")
    
    coordinate_link = url_find.get_attribute('href')
    
    url_split = coordinate_link.split('=')[2]
    
    x_coord = url_split.split(',')[0]
    y_coord = url_split.split(',')[1]
    
    x_coords.append(x_coord)
    y_coords.append(y_coord)
    

df = pd.DataFrame({'Names': names, 'Address': addresses, 'Region': regions, 'Counties': counties, 'Eircode': eircodes, 'X_coord': x_coords, 'Y_coords': y_coords})
df.to_csv('maxol.csv', index=False, encoding='utf-8')