import apigw = require('@aws-cdk/aws-apigatewayv2');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import * as cdk from '@aws-cdk/core';

export interface LambdaNestedProps extends cdk.NestedStackProps {
    api: apigw.HttpApi;
    table: dynamodb.Table;
}