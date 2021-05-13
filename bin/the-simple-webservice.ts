#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CommonStack } from '../lib/common-infrastructure-stack';

const app = new cdk.App();
new CommonStack(app, 'CommonStack');
