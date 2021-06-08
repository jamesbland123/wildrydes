# WildRydes sample application

There are two versions of the application, a serverless version and a container version (in-progress). 

## Serverless version deployment guide

> helper.yml and wildrydes.yml originally from https://github.com/k-morgan22/wildrydes-cloudformation

1. Clone this repo.
2. Create a temp bucket to stage the lambda function.
```
aws cloudformation deploy --template-file helper.yml --stack-name helper-bucket --capabilities CAPABILITY_IAM
```
3. Grab the bucket name, PhysicalResourceID in the output below.
```
aws cloudformation describe-stack-resources --stack-name helper-bucket
```
```
{
    "StackResources": [
        {
            "StackName": "helper-bucket",
            "StackId": "arn:aws:cloudformation:us-west-2:12345678910:stack/helper-bucket/10bc9d50-9b44-11eb-4456-0212b1ad1dcd",
            "LogicalResourceId": "LambdaBucket",
            "PhysicalResourceId": "helper-bucket-lambdabucket-01234567869",
            "ResourceType": "AWS::S3::Bucket",
            "Timestamp": "2021-04-12T04:04:11.318000+00:00",
            "ResourceStatus": "CREATE_COMPLETE",
            "DriftInformation": {
                "StackResourceDriftStatus": "NOT_CHECKED"
            }
        }
    ]
}
```
4. We need to package the lambda function and upload it to the helper bucket we just created. Bes sure to replace the helper-bucket name with the output from above.
```aws cloudformation package --template-file wildrydes.yml --s3-bucket helper-bucket-lambdabucket-0123456744--output-template-file packaged-wildrydes.yml
```
5. Deploy WildRydes Cloudformation
```
aws cloudformation deploy --template-file packaged-wildrydes.yml --stack-name wildrydes --capabilities CAPABILITY_IAM
```
6. Edit frontend/js/config.js
- A. ```aws cloudformation describe-stacks --stack-name wildrydes``` look under Output, output value for each of the values.
- B. Edit and save the file

7. Copy the frontend files to your new site bucket. The name should be in out of 6A
```
aws s3 sync frontend/ s3://wildrydes-sitebucket-12345678910
```
8. Connect to the WildRydes websiteURL from the 6A output. If everything works you should be greeted with the WildRydes main page. 

### Cleanup 
Be sure to replace the bucket names with the actual names.
```
aws s3 rm s3://WEBSITE-BUCKET --recursive 
aws s3 rm s3://HELPER-BUCKET --recursive

aws cloudformation delete-stack --stack-name helper-bucket
aws cloudformation delete-stack --stack-name wildrydes
```

## Container Guide
The container is not a full working example. Following the steps below will get a running container, but full functionality of the components such as requesting a ride do not work. But for the sake of demonstration and continuity with the workshop the apps purpose is to provide the same look and feel as the serverless app. Additionally, there are no Cloudformation deployments to allow flexibility for your choice of container orchestration (ECS, EKS, Beanstalk).

Instructions to build and run locally. 
1. cd to the containers directory
2. build the container ```docker build -t wildrydes .```
3. Run the container with MySQL ```docker-compose up -d```

To shutdown the container use
1. ```docker-compose down```

To run the container without MySQL, use
1. Run the container ```docker run -d -p 8080:8080 --rm wildrydes```
