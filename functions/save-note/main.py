# add your save-note function here
import boto3

#create a dynamodb resource
dynamodb_resource = boto3.resource('dynamodb')
#create a table object
table = dynamodb_resource.Table('notes')

def lambda_handler(email, note):
    try:
        return table.update_item(
            Key={
                "email": email,
                "id": note["id"]
            },
            UpdateExpression="set title=:t, body=:b, when=:w",
            ExpressionAttributeValues={"t": note["title"], "b": note["body"], "w": note["when"]},
        )
    except:
        note["email"] = email
        table.put_item(
            table.put_item(Item=note)
        )
        return "SUCCESS"

    
    