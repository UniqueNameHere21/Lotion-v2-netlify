# add your get-notes function here

import boto3
from boto3.dynamodb.conditions import Key
import json
#create a dynamodb resource
dynamodb_resource = boto3.resource('dynamodb', region_name='ca-central-1')
# #create a table object
table = dynamodb_resource.Table('lotion-30139550')


def handler(event, context):
    email = event["queryStringParameters"]["email"]
    items = table.query(KeyConditionExpression=Key("email").eq(email))
    return {
        "status": 200,
        "body": items,
    }
    
    