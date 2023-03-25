# add your save-note function here
import boto3
import json

#create a dynamodb resource
dynamodb_resource = boto3.resource('dynamodb', region_name="ca-central-1")
#create a table object
table = dynamodb_resource.Table('lotion-30139550')

def handler(event, context):
    email = event["queryStringParameters"]["email"]
    id = event["queryStringParameters"]["id"]
    hm = event["requestContext"]["http"]["method"].lower()
    if hm == "delete":
        try:
            table.delete_item(Key={
                "email": email,
                "id": id,
            })
            return{
                "status": 200,
                "body": "SUCCESS"
            }
        except Exception as e: 
            return{
                "status": 500,
                "body": json.dumps({
                    "message": str(e)
                })
            }

    
    
    
    