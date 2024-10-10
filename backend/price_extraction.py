import cv2 as cv
from matplotlib import pyplot as plt
import numpy as np
import pytesseract
import sys 

sys.stdout.flush()
pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'

def ExtractPrice(image):
    
    I = np.array(image)

    oh, ow, od = I.shape

    # Resize image to blend LED pixels
    cropped = cv.resize(I, dsize=(int(ow * 2), int(oh * 2)))

    # Convert to HSV colour space (Hue, Saturation, Value)
    HSV = cv.cvtColor(cropped, cv.COLOR_RGB2HSV)

    # Blur image to further blend LED bulbs
    HSV = cv.GaussianBlur(HSV, (7, 7), 2)

    # Create limits for thresholding pixels of the prices
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([255, 10,255])

    # Create mask using the image and declared values
    mask = cv.inRange(HSV, lower_white, upper_white)

    # Initiate morph shape
    shape = cv.getStructuringElement(cv.MORPH_ELLIPSE, (10, 10))

    # Use shap to close created mask
    closedMask = cv.morphologyEx(mask, cv.MORPH_CLOSE, shape, iterations = 5)

    # Dilate mask further to ensure entire board is captured
    fullMask = cv.dilate(closedMask, shape, iterations = 4)

    # Crop image using mask
    ROI = cv.bitwise_and(cropped, cropped, mask=fullMask)

    # Chnge cropped image to black and white
    ROI_g = cv.cvtColor(ROI, cv.COLOR_RGB2GRAY)

    # Find contours in the image
    contours, _ = cv.findContours(ROI_g, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    ROI_not = cv.bitwise_not(ROI_g)
    
    if len(contours) > 0:
        for cnt in contours:
            x, y, w, h = cv.boundingRect(cnt)

            # Cropping the text block for giving input to OCR
            text_crop = ROI_not[y:y + h, x:x + w]

            # Apply OCR on the cropped image
            text = pytesseract.image_to_string(text_crop, config='digits')

            #Process text taken from image
            price_list = text.split("\n")

            prices = []
            
            
            if len(price_list) > 1:
                print(price_list)
                for price in price_list:
                    target_index = price_list.index(price)
                    
                    print(price)

                    #Check if the number is blank
                    if price == '':
                        price_list.remove(price)
                        continue
                    
                    # Check for if the decimal in the price was correctly located by Tesseract
                    if price.find("."):
                        price = price[0:3]
                        price_list[target_index] = price
                        
                    # If decimal was not found, insert decimal into string    
                    if price.find(".") == -1:
                        price = price[0] + '.' + price[1] + price[2]
                        price_list[target_index] = price

                    # Add price to list
                    prices.append(price)
                    
                    # Find number of recognised prices
                    number_of_prices = len(prices)

                    # Sort prices to not include premium petrol or diesel
                    if number_of_prices == 2:
                        petrol_price = prices[0]
                        diesel_price = prices[1]
                    elif number_of_prices == 4:
                        petrol_price = prices[0]
                        diesel_price = prices[2]
                    else:
                        petrol_price = None
                        diesel_price = None
            else:
                petrol_price = None
                diesel_price = None
    else: 
        petrol_price = None
        diesel_price = None   
    
    return petrol_price, diesel_price