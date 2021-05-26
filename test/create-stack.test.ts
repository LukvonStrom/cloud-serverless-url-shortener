
import { expect as expectCDK, matchTemplate, haveResourceLike, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { ShortenerStack } from '../lib/create-stack'

describe('Test Infrastructure Integrity', function () {
  test('S3 Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ShortenerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResourceLike("AWS::S3::Bucket"));
  })


  test('Lambda Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ShortenerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
      "Handler": "index.handler",
      "Runtime": "nodejs12.x"
    }
    ));
  });

  test('API Gateway Http API Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ShortenerStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResourceLike("AWS::ApiGatewayV2::Api", {
      "ProtocolType": "HTTP"
    }
    ));
  });


})
