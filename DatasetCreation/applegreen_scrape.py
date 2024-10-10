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


driver = webdriver.Chrome(
    options = options
)

driver.get('https://locations.applegreen.com/')

addresses = []
x_coords = []
y_coords = []
links = []

content = driver.page_source

soup = BeautifulSoup(content, features="html.parser")

WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))).click()

WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CLASS_NAME, "show-locations-list"))).click()


WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.XPATH, "//div[@class=\"location-col\"]/article[@class=\"location\"]/a")))

linksSection = driver.find_elements(By.XPATH, "//div[@class=\"location-col\"]/article[@class=\"location\"]/a")


for element in linksSection:
      
    url_full = element.get_attribute('href')
    
    links.append(url_full)
    

for link in links:

    driver.get(link)
    
    address = driver.find_element(By.XPATH, "//div[@class=\"map-contact-details\"]/div/h3")
    
    coords_el = driver.find_element(By.XPATH, "//div[@class=\"map-detail-container\"]/a")
    
    coords_url = coords_el.get_attribute('href')
    
    coords = coords_url.split('=')[2]
    
    y_coord, x_coord = coords.split(",")
    
    print(y_coord)
    print(x_coord)
    
        
    addresses.append(address.text)
    x_coords.append(x_coord)
    y_coords.append(y_coord)

        

df = pd.DataFrame({'Address': addresses, 'y_coord': y_coords, 'x_coord': x_coords})
df.to_csv('applegreen.csv', index=False, encoding='utf-8')