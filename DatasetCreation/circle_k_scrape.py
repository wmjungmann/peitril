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

driver.get('https://www.circlek.ie/stations')

addresses = []
regions = []
eircodes = []
links = []

content = driver.page_source

soup = BeautifulSoup(content, features="html.parser")

linksSection = driver.find_elements(By.XPATH, "//ul[@class=\"links\"]/li/a")


for element in linksSection:
    url_full = element.get_attribute('href')
    
    print(url_full)
    
    links.append(url_full)
    
    
for link in links:
    driver.get(link)
    
    address = driver.find_element(By.XPATH, "//span[@itemprop=\"streetAddress\"]")
    
    region = driver.find_element(By.XPATH, "//span[@itemprop=\"addressLocality\"]")
    
    eircode = driver.find_element(By.XPATH, "//span[@itemprop=\"postalCode\"]")
        
    addresses.append(address.text)
    regions.append(region.text)
    eircodes.append(eircode.text)
        


df = pd.DataFrame({'Address': addresses, 'Region': regions, 'Eircode': eircodes})
df.to_csv('circleK.csv', index=False, encoding='utf-8')