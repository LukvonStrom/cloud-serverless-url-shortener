import * as cdk from '@aws-cdk/core';
import nodeLambda = require('@aws-cdk/aws-lambda-nodejs');
import {LambdaNestedProps} from "../interface"
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';



export class LambdaRedirectStack extends cdk.NestedStack {

  

  constructor(scope: cdk.Construct, id: string, props: LambdaNestedProps) {
    super(scope, id, props);

    const {table, api} = props;

    // defines an AWS Lambda resource
    const redirectLambda = new nodeLambda.NodejsFunction(this, 'redirect-handler', {
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    const redirectIntegration = new LambdaProxyIntegration({handler: redirectLambda})


    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(redirectLambda);
    

    api.addRoutes({path: '/{id}', methods: [HttpMethod.GET], integration: redirectIntegration})
  }
}
