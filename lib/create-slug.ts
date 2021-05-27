import { S3Client, HeadObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomInt } from "crypto";
const { resolve } = require("dns").promises;
import { URL } from "url";
const {isWebUri} = require('valid-url')

export class Slug {
    private alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")
    private s3Client: S3Client;
    private bucket: string;

    constructor(s3Client: S3Client, bucket: string) {
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    private shuffleSlug = async (): Promise<string> => {
        let _slug = "12345".split("").map(el => this.alphabet[randomInt(this.alphabet.length)]).join("")
        if (await this.hasSlug(_slug)) {
            return await this.shuffleSlug();
        } else {
            return _slug;
        }
    }

    /**
     * 
     * @param url 
     * @returns string slug
     * @throws Error
     */
    async createSlug(url: string) {

        const slug = await this.shuffleSlug();
        const createCommand = new PutObjectCommand({ Bucket: this.bucket, WebsiteRedirectLocation: url, Key: slug });

        // No try-catch here, because error should be non-retriable (i.e. insufficient perms, etc.)
        await this.s3Client.send(createCommand);

        return slug;
    }

    async createSlugsBulk(urls: string[]): Promise<string[]> {

        return await Promise.all(urls.map(async (url) => {
            const slug = await this.shuffleSlug()
            const createCommand = new PutObjectCommand({ Bucket: this.bucket, WebsiteRedirectLocation: url, Key: slug });

            await this.s3Client.send(createCommand);
            return slug;
        }))

    }

    private async hasSlug(slug: string): Promise<boolean> {
        try {
            const headCommand = new HeadObjectCommand({ Bucket: this.bucket, Key: slug })
            // Either throws or returns metadata, which we can throw away, to free heap
            await this.s3Client.send(headCommand);
            return true;
        } catch (e) {
            return false;
        }

    }

    private static parseUrl(urlLike: string): {status: boolean, url?: URL} {
        try{
            let url = new URL(urlLike);
            return {status: true, url};
        }catch(e){
            return {status: false};
        }
    }

    public static async isValidUrl(urlLike: string): Promise<boolean> {
        try {
            let url = Slug.parseUrl(urlLike);
            let matchTld = async (str: string) => {

                let countOfPoints = (str.match(new RegExp(/\./, "g")) || []).length

                // a domain has either [].com or [].co.uk or www.[].co.uk
                if(0 < countOfPoints &&  countOfPoints < 4){
                    // The domain name system allows various tricky usecases like unicode in the domain name
                    // I am not able to cover all valid instances via Regex
                    // So I perform a DNS resolve.
                    
                    let result = await resolve(str)
                    return result.length > 0;
                    
                }
                return false;
            }
            if(!url.status){
                // This is considered valid by some browsers
                if(urlLike.includes("://")){
                    return await matchTld(urlLike.replace("://", ""));
                }
                if(urlLike.includes("//")){
                    return await matchTld(urlLike.replace("//", ""));
                }
                return await matchTld(urlLike);
            }else if(url.url){
                if (!url.url.protocol) {
                    console.log("No protocol")
                    return await matchTld(url.url.pathname);
    
                } else {
                    if (url.url.protocol === "http:" || url.url.protocol === "https:") {
                        return !!isWebUri(urlLike) && await matchTld(url.url.hostname)
                    }
                }
            }else{
                return false;
            }

            return false;
        } catch (e) {
            return false;
        }
    }
}