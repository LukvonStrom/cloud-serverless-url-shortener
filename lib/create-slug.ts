import { S3Client, HeadObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomInt } from "crypto";
import { URL } from "url";

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
    /**
     * 
     * @param slug 
     * @returns GetObjectCommandOutput
     * @throws Error in case the object is not found
     */
    private async getSlug(slug: string): Promise<GetObjectCommandOutput> {
        const getCommand = new GetObjectCommand({ Bucket: this.bucket, Key: slug })
        return await this.s3Client.send(getCommand);
    }

    public static isValidUrl(urlLike: string): boolean {
        try {
            let url = new URL(urlLike);
            let matchTld = (str: string) => {
                let matches = str.match(/^\.\w+(\.\w+)*$/g);
                return !!str && !!matches && matches.length > 0;
            }
            if (!url.protocol) {
                return matchTld(url.pathname);

            } else {
                if (url.protocol === "http:" || url.protocol === "https:") {
                    return matchTld(url.hostname);
                }
            }

            return false;
        } catch (e) {
            return false;
        }
    }
}