import { S3Client } from "@aws-sdk/client-s3";
import { Agent } from "https";
import { Slug } from "../lib/create-slug"
import { extractOutput } from "./prepare"
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");


describe('Test Slug Functionality', function () {

    let timeout = 50000


    let requestHandler = new NodeHttpHandler({
        httpsAgent: new Agent({
            maxSockets: 100
        })
    })

    let s3Client = new S3Client({
        region: 'eu-central-1',
        requestHandler
    })


    beforeAll(async () => {
        try {
            await extractOutput()
            return;
        } catch (e) {
            console.error(e)
            throw e;
        }
    })



    test('test for hash collisions with random input', async () => {

        expect(process?.env?.SLUG_BUCKET).toBeDefined();
        if (process?.env?.SLUG_BUCKET) {
            let slug = new Slug(s3Client, process?.env?.SLUG_BUCKET)

            let testEntries = Array.from(Array(1000).keys()).map(i => `https://fruntke.tech/test/${i}`)

            let output = await slug.createSlugsBulk(testEntries)
            let duplicates = output.some((el, i) => output.indexOf(el) !== i)
            //console.log(output.filter((el, i) => output.indexOf(el) !== i), duplicates)
            expect(duplicates).toBeFalsy();
        }

    }, timeout)

    test('test for hash collisions with same input', async () => {
        expect(process?.env?.SLUG_BUCKET).toBeDefined();
        if (process?.env?.SLUG_BUCKET) {
            let slug = new Slug(s3Client, process?.env?.SLUG_BUCKET)

            let testEntries = Array.from(Array(1000).keys()).map(() => `https://fruntke.tech/test/`)

            let output = await slug.createSlugsBulk(testEntries)
            let duplicates = output.some((el, i) => output.indexOf(el) !== i)
            expect(duplicates).toBeFalsy();
        }

    }, timeout)

    test('test for invalid URLs', async () => {
        expect(await Slug.isValidUrl("protocol://wrong/uri")).toBeFalsy()
        expect(await Slug.isValidUrl("https://wrong/uri")).toBeFalsy()
        expect(await Slug.isValidUrl("http://wrong/uri")).toBeFalsy()
        // Non resolvable TLDs
        expect(await Slug.isValidUrl("http://wrong.uri")).toBeFalsy()
        expect(await Slug.isValidUrl("https://wrong.uri")).toBeFalsy()
        expect(await Slug.isValidUrl("wrong.uri")).toBeFalsy()
        expect(await Slug.isValidUrl("://wrong.uri")).toBeFalsy()
        // Resolvable TLDs
        expect(await Slug.isValidUrl("http://fruntke.tech")).toBeTruthy()
        expect(await Slug.isValidUrl("https://fruntke.tech")).toBeTruthy()
        expect(await Slug.isValidUrl("https://www.fruntke.tech")).toBeTruthy()
        expect(await Slug.isValidUrl("https://google.de")).toBeTruthy()
        expect(await Slug.isValidUrl("https://www.google.de")).toBeTruthy()
        expect(await Slug.isValidUrl("https://www.google.de/path")).toBeTruthy()
        expect(await Slug.isValidUrl("golem.de")).toBeTruthy()
        expect(await Slug.isValidUrl("://golem.de")).toBeTruthy()
    }, timeout)



    test('test for slug length', async () => {
        expect(process?.env?.SLUG_BUCKET).toBeDefined();
        if (process?.env?.SLUG_BUCKET) {
            let slug = new Slug(s3Client, process?.env?.SLUG_BUCKET)

            let result = await slug.createSlug('https://google.com')
            expect(result).toHaveLength(5);
        }
    }, timeout)


})



