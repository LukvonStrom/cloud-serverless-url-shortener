import dynamodb = require('@aws-cdk/aws-dynamodb');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import {LambdaRedirectStack} from "./redirect/redirect-stack"
import {LambdaCreateStack} from "./create/create-stack"
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';

export class CommonStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //DynamoDB Table
    const table = new dynamodb.Table(this, 'shortener', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    

    // defines an API Gateway Http API resource backed by our "dynamoLambda" function.
    let api = new apigw.HttpApi(this, 'Endpoint', {
      apiName: 'shortener',
    });

    let redirectLambda = new LambdaRedirectStack(this, 'lambda-redirect', {api, table})
    let createLambda = new LambdaCreateStack(this, 'lambda-create', {api,table})

   new CfnOutput(this, 'HTTP-API', {
     value: api.url ?? 'Something went wrong with the deployment'
   });

   new CfnOutput(this, 'Dynamo-Table', {
       value: table.tableArn
   })
  }
}
