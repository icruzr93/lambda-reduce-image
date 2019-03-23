# aws-s3-lambda-process-image

- Create 2 Buckets (bucket-a, bucket-a-resized)
- Create lambda function and upload zip (node_modules, index.js)
- Give lambda function a S3 permission on LIST AND CRUD permissions on both buckets
- Program Events in S3 properties to exec the lambda function after create anykind of objects in the first bucket.