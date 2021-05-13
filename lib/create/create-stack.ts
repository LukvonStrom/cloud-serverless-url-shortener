import nodeLambda = require('@aws-cdk/aws-lambda-nodejs');
import {LambdaNestedProps} from "../interface"
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { Construct, NestedStack } from '@aws-cdk/core';



export class LambdaCreateStack extends NestedStack {

  

  constructor(scope: Construct, id: string, props: LambdaNestedProps) {
    super(scope, id, props);

    const {table, api} = props;

    // defines an AWS Lambda resource
    const createLambda = new nodeLambda.NodejsFunction(this, 'create-handler', {
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    const createIntegration = new LambdaProxyIntegration({handler: createLambda})


    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(createLambda);
    

    api.addRoutes({path: '/{url}', methods: [HttpMethod.POST], integration: createIntegration})
  }
}
