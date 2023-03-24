# add your get-notes function here
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource('dynamodb', region_name='ca-central-1')
table = dynamodb_resource.Table('notes')

def handler(event, context):
    email = event["queryStringParameters"]["email"]
    items = table.query(KeyConditionExpression=Key("email").eq(email))
    return {
        "status": 200,
        "body": items,
    }
    