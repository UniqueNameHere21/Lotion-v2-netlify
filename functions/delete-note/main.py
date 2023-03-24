# add your delete-note function here
import boto3
from google.oauth2 import id_token
from google.auth.transport import requests
#create a dynamodb resource
dynamodb_resource = boto3.resource('dynamodb')
#create a table object
table = dynamodb_resource.Table('notes')

def lambda_handler(email, note):
    
    #token = event["queryStringParameters"]["token"]
    return table.delete_item(
        Key={
            "email": email,
            "id": note["id"]
        }
    )

    
    