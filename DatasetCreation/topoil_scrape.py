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

driver.get('https://www.top.ie/locations/find-location')

addresses = []
x_coords = []
y_coords = []
eircodes = []
links = []

content = driver.page_source

soup = BeautifulSoup(content, features="html.parser")


WebDriverWait(driver, 30).until(EC.presence_of_all_elements_located((By.XPATH, "//div[@class=\"MuiPaper-root MuiPaper-elevation MuiPaper-rounded MuiPaper-elevation0 MuiCard-root css-699ymc\"]")))

linksSection = driver.find_elements(By.XPATH, "//a[@class=\"MuiTypography-root MuiTypography-subtitle1 MuiLink-root MuiLink-underlineAlways css-ezt6sz\"]")
print(linksSection)
for element in linksSection:
      
    url_full = element.get_attribute('href')
    
    links.append(url_full)



for link in links:

    driver.get(link)
    
    address = driver.find_element(By.XPATH, "//div[@class=\"location__address\"]").text
    
    address = address.replace('\n', ' ')
    
    eircode = address[-8:]
    
    address = address[:len(address) - 8]
    
    x_coord = driver.find_element(By.XPATH, "//div[@class=\"location__latitude\"]").text
    
    y_coord = driver.find_element(By.XPATH, "//div[@class=\"location__longitude\"]").text
    
        
    addresses.append(address)
    x_coords.append(x_coord)
    y_coords.append(y_coord)
    eircodes.append(eircode)
    
    print(address)
    print(eircode)
    print(x_coord)
    print(y_coord)

        


df = pd.DataFrame({'Address': addresses, 'x_coord': x_coords, 'y_coord': y_coords, 'eircode': eircodes})
df.to_csv('topoil.csv', index=False, encoding='utf-8')