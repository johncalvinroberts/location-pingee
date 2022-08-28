# lambda
resource "null_resource" "build" {
  provisioner "local-exec" {
    command = "pnpm build"
  }
}

data "archive_file" "zip_js" {
  type        = "zip"
  source_dir  = "${path.module}/dist"
  output_path = "${path.module}/LocationPingee.zip"
  depends_on = [
    null_resource.build
  ]
}

resource "aws_lambda_function" "location_pingee" {
  function_name = "LocationPingee"

  runtime     = "nodejs14.x"
  handler     = "main.handler"
  filename    = data.archive_file.zip_js.output_path
  memory_size = 512
  source_code_hash = filebase64sha256(data.archive_file.zip_js.output_path)

  role = aws_iam_role.lambda_exec.arn
  depends_on = [
    data.archive_file.zip_js
  ]
}

resource "aws_cloudwatch_log_group" "location_pingee" {
  name              = "/aws/lambda/${aws_lambda_function.location_pingee.function_name}"
  retention_in_days = 30
}

resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name = "pingee-lambda-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "s3:*"
        Effect   = "Allow"
        Resource = "arn:aws:s3:::*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}


resource "aws_lambda_function_url" "location_pingee_latest" {
  function_name      = aws_lambda_function.location_pingee.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

resource "aws_s3_bucket" "example" {
  bucket = "pingee"
}
