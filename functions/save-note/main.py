# add your save-note function here
import boto3
import json

#create a dynamodb resource
dynamodb_resource = boto3.resource("dynamodb")
#create a table object
table = dynamodb_resource.Table("lotion-30139550")

def handler(event, context):
    hm = event["requestContext"]["http"]["method"].lower()
    body = json.loads(event["body"])
    if hm == "put":
        try:
            table.put_item(Item=body)
            return{
                "status":200,
                "body": json.dumps({
                    "message": "SUCCESS"
                })
            }
        except Exception as exp:
            return{
                "status": 500,
                "body": json.dumps({
                    "message": str(exp)
                })
            }
