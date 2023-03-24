terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
}

# s3 bucket
resource "aws_s3_bucket" "lambda" {}
#output the name of bucket after creation
output "bucket_name" {
  value = aws_s3_bucket.lambda.id
}

#constants
locals{
    function_delete = "delete-note-30139550"
    function_get = "get-notes-30139550"
    function_save = "save-note-30139550"
    handler_name = "main.handler"
    artifact_delete = "${local.function_delete}/artifact.zip"
    artifact_get = "${local.function_get}/artifact.zip"
    artifact_save = "${local.function_save}/artifact.zip"
}

#create role for lambda functions to assume
resource "aws_iam_role" "lambda"{
    name = "iam-for-lambda"
    assume_role_policy = <<EOF
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid": ""
            }
        ]
    }
    EOF
}

#create lambda functions
resource "aws_lambda_function" "delete-note"{
    s3_bucket = aws_s3_bucket.lambda.bucket
    s3_key = local.artifact_delete
    role = aws_iam_role.lambda.arn
    function_name = local.function_delete
    handler = local.handler_name

    runtime = "python3.9"
}

resource "aws_lambda_function" "get-notes" {
    s3_bucket = aws_s3_bucket.lambda.bucket
    s3_key = local.artifact_get
    role = aws_iam_role.lambda.arn
    function_name = local.function_get
    handler = local.handler_name

    runtime = "python3.9"
}

resource "aws_lambda_function" "save-note" {
    s3_bucket = aws_s3_bucket.lambda.bucket
    s3_key = local.artifact_save
    role = aws_iam_role.lambda.arn
    function_name = local.function_save
    handler = local.handler_name

    runtime = "python3.9"
}

#Cloudwatch log publishing policy
resource "aws_iam_policy" "logs"{
    name = "lambda-logging"
    description = "IAM policy for logging from a lambda"

    policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

#attach policy to function role
resource "aws_iam_role_policy_attachment" "mabda_logs"{
    role = aws_iam_role.lambda.name
    policy_arn = aws_iam_policy.logs.arn
}


#create dynamodb table
resource "aws_dynamodb_table" "lotion-30139550" {
    name = "notes"
    billing_mode = "PROVISIONED"

    read_capacity = 1
    write_capacity = 1

    hash_key = "email"
    range_key = "id"

    attribute {
        name = "email"
        type = "S"
    }

    attribute {
        name = "id"
        type = "S"
    }
}

#Create URLs and output
resource "aws_lambda_function_url" "url-delete-note"{
    function_name = aws_lambda_function.delete-note.function_name
    authorization_type = "NONE"

    cors{
        allow_credentials = true
        allow_origins = ["*"]
        allow_methods = ["DELETE"]
        allow_headers = ["*"]
        expose_headers = ["keep-alive", "date"]
    }
}

# output "url-delete-note" {
#     value = aws_lambda_function_url.url-delete-note.function_url
# }

resource "aws_lambda_function_url" "url-get-notes"{
    function_name = aws_lambda_function.get-notes.function_name
    authorization_type = "NONE"

    cors{
        allow_credentials = true
        allow_origins = ["*"]
        allow_methods = ["GET"]
        allow_headers = ["*"]
        expose_headers = ["keep-alive", "date"]
    }
}

# output "url-get-notes" {
#     value = aws_lambda_function_url.url-get-notes.function_url
# }

resource "aws_lambda_function_url" "url-save-note"{
    function_name = aws_lambda_function.save-note.function_name
    authorization_type = "NONE"

    cors{
        allow_credentials = true
        allow_origins = ["*"]
        allow_methods = ["POST"]
        allow_headers = ["*"]
        expose_headers = ["keep-alive", "date"]
    }
}
  
# output "url-save-note" {
#     value = aws_lambda_function_url.url-save-note.function_url
# }