import { CloudFormationClient, DescribeStacksCommand, ListExportsCommand } from "@aws-sdk/client-cloudformation";
import { S3Client } from "@aws-sdk/client-s3";
import { join } from "path";
import { cwd } from "process";
import {Slug} from "../lib/create-slug"
const {readFile} = require('fs/promises')
let slug: Slug;

jest.setTimeout(30000);

beforeAll(async () => {
    let s3Client = new S3Client({
        region: 'eu-central-1',
    })
   
    let command = new DescribeStacksCommand({StackName: "ShortenerStack"});
    let {Stacks} = await new CloudFormationClient({region: 'eu-central-1'}).send(command);
    if(Stacks){
        let output = (Stacks[0].Outputs?.filter(el => el.OutputKey === "S3WebsiteBucket"))
    if(output && output[0] && output[0].OutputValue && output[0].OutputKey ){
        slug = new Slug(s3Client, output[0].OutputValue)
    }
    }else{
        throw new Error("Infrastructure mess up") 
    }
})

test('test for hash collisions with random input', async () => {
    let output: string[] = []
    for (let i = 0; i < 1000; i++) {
        let url = `https://fruntke.tech/test/${i}`
        output.push(await slug.createSlug(url))
    }
    let duplicates = output.some((el, i) => output.indexOf(el) !== i)
    console.log(output.filter((el, i) => output.indexOf(el) !== i), duplicates)
    expect(duplicates).toBeFalsy();
})

test('test for hash collisions with same input', async () => {
    let output: string[] = []
    for (let i = 0; i < 1000; i++) {
        let url = `https://fruntke.tech/test/`
        output.push(await slug.createSlug(url))
    }
    let duplicates = output.some((el, i) => output.indexOf(el) !== i)
    expect(duplicates).toBeFalsy();
})

test('test for invalid URLs', async () => {
    expect(Slug.isValidUrl("protocol://wrong/uri")).toBeFalsy()
    expect(Slug.isValidUrl("https://wrong/uri")).toBeFalsy()
    expect(Slug.isValidUrl("http://wrong/uri")).toBeFalsy()
    // TLDs change to frequently to validate them properly
    expect(Slug.isValidUrl("http://wrong.uri")).toBeTruthy()
    expect(Slug.isValidUrl("https://wrong.uri")).toBeTruthy()
})

test('test for slug length', async () => {
    let result = await slug.createSlug('https://google.com')
    expect(result).toHaveLength(5);
})