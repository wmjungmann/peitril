import smtplib, ssl
import os
from email.message import EmailMessage

def SendEmail(user_id, y_coords, x_coords, location_name, location_brand, petrol_price, diesel_price, sub_date):
    try:
        port = 465 # For SSL
        smtp_server = "smtp.gmail.com"
        password = "yudg tfxx jyfp etjn"
        email_add = "peitrilapp@gmail.com"
        msg = EmailMessage()
        msg['Subject'] = 'New Station Submission'
        msg['From'] = email_add
        msg['To'] = email_add 
        msg.set_content("""\
        user_id: {id}
        x_coords: {x}
        y_coords: {y}
        location_name: {name}
        location_brand: {brand}
        petrol: {p_price}
        diesel: {d_price}
        date: {date}""".format(id=user_id, x=x_coords, y=y_coords, name=location_name, brand=location_brand, p_price=petrol_price, d_price=diesel_price, date=sub_date))

        # Create a secure SSL context
        context = ssl.create_default_context()

        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(email_add, password)
            server.send_message(msg)
        
        return True, "Email sent successfully"
    
    except smtplib.SMTPConnectError as e:
        error_message = f"Failed to connect to the SMTP server: {e}"
        return False, error_message
    except smtplib.SMTPAuthenticationError as e:
        error_message = f"Failed to authenticate with the SMTP server: {e}"
        return False, error_message
    except smtplib.SMTPException as e:
        error_message = f"An error occurred while sending the email: {e}"
        return False, error_message
    except Exception as e:
        error_message = f"An unexpected error occurred: {e}"
        return False, error_message