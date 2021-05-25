import { CloudFormationClient, ListExportsCommand } from "@aws-sdk/client-cloudformation";
import { S3Client } from "@aws-sdk/client-s3";
import { join } from "path";
import { cwd } from "process";
import {Slug} from "../lib/create-slug"
const {readFile} = require('fs/promises')
let slug: Slug;

beforeAll(async () => {
    let s3Client = new S3Client({
        region: 'eu-central-1',
    })
    let command = new ListExportsCommand({});
    let {Exports} = await new CloudFormationClient({region: 'eu-central-1'}).send(command);
    let bucket = Exports?.filter(el => el.Name === "S3-Website-Bucket")[0]
    if(!bucket || !bucket.Value){
        throw new Error("Infrastructure mess up")
    }else{
        slug = new Slug(s3Client, bucket.Value)
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