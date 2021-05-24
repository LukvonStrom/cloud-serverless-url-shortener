import { HttpProxyIntegration, LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { CfnOutput, Construct, Fn, Stack, StackProps } from '@aws-cdk/core';
import { Bucket, HttpMethods } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { join } from 'path';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { CodeSigningConfig } from '@aws-cdk/aws-lambda';
import { Platform, SigningProfile } from '@aws-cdk/aws-signer';
import { CloudFrontWebDistribution, Distribution } from '@aws-cdk/aws-cloudfront';



export class ShortenerStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // defines an AWS Lambda resource

    let api = new HttpApi(this, 'Endpoint', {
      apiName: 'shortener',
    });
    if (api.url) {

      const myBucket = new Bucket(this, "my-static-website-bucket", {
        publicReadAccess: true,
        // see: https://stackoverflow.com/a/20273548
        websiteIndexDocument: "index.htm",
        websiteErrorDocument: "admin/index.html"
      });
      myBucket.addCorsRule({
        "allowedHeaders": [
          "*"
        ],
        "allowedMethods": [
          HttpMethods.GET
        ],
        "allowedOrigins": [
          "*"
        ],
        "exposedHeaders": [
          "Date"
        ],
        "id": "allowCORS",
        "maxAge": 3600
      })

      const deployment = new BucketDeployment(this, "adminSite", {
        sources: [Source.asset(join(__dirname, "./website"))],
        destinationBucket: myBucket,
        destinationKeyPrefix: "admin"
      })


      /*
      const distribution = new CloudFrontWebDistribution(this, 'cloudfront', {
        originConfigs: [

          {
            s3OriginSource: {
              s3BucketSource: myBucket
            },
            behaviors: [{ isDefaultBehavior: true }]
          },
          {
            customOriginSource: {
              domainName: Fn.select(2, Fn.split('/',api?.url)),
              originPath: '/create'
            },
            behaviors: [{ pathPattern: '/create' }]
          }
        ]
      });*/


      const signingProfile = new SigningProfile(this, 'SigningProfile', {
        platform: Platform.AWS_LAMBDA_SHA384_ECDSA
      });

      const codeSigningConfig = new CodeSigningConfig(this, 'CodeSigningConfig', {
        signingProfiles: [signingProfile],
      });

      const createLambda = new NodejsFunction(this, 'create-handler', {
        environment: {
          BUCKET_NAME: myBucket.bucketName,
          BUCKET_ARN: myBucket.bucketArn
        },
        bundling: {
          target: "es2020"
        },
        codeSigningConfig,
        logRetention: 30
      });

      myBucket.grantReadWrite(createLambda)



      const createIntegration = new LambdaProxyIntegration({ handler: createLambda })
      const redirectIntegration = new HttpProxyIntegration({ url: myBucket.bucketWebsiteUrl + "/{id}" });
      const adminIntegration = new HttpProxyIntegration({ url: myBucket.bucketWebsiteUrl + "/admin/{documents}" });

      api.addRoutes({ path: '/create', methods: [HttpMethod.POST], integration: createIntegration })
      api.addRoutes({ path: '/{id}', methods: [HttpMethod.GET, HttpMethod.OPTIONS], integration: redirectIntegration })
      api.addRoutes({ path: '/admin/{documents+}', methods: [HttpMethod.GET, HttpMethod.OPTIONS], integration: adminIntegration })

      new CfnOutput(this, 'HTTP-API', {
        value: api.url ?? 'Something went wrong with the deployment'
      });
    }
  }

}
