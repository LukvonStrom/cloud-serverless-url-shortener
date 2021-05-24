#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {ShortenerStack} from '../lib/create-stack'

const app = new cdk.App();
new ShortenerStack(app, 'ShortenerStack');
