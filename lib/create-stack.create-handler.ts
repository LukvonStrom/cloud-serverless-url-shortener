import { Context, APIGatewayProxyEventV2 } from "aws-lambda"
import { Slug } from "./create-slug";
import { S3Client } from "@aws-sdk/client-s3";


const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async function (event: APIGatewayProxyEventV2, context: Context) {
  let targetUrl: string;

  if (process?.env?.BUCKET_NAME) {
    const slug = new Slug(s3, process?.env?.BUCKET_NAME)

    if (event?.body && event.headers["content-type"] === "application/json") {
      let { url } = JSON.parse(event?.body);
      targetUrl = url;

      console.log(url, targetUrl, event.body)

      if(!Slug.isValidUrl(url)) return sendRes(500, JSON.stringify({ error: "Invalid request, malformed Url" }));

      try {
        let generatedSlug: string = await slug.createSlug(targetUrl)
        return sendRes(200, JSON.stringify({ slug: generatedSlug, url: targetUrl }))
      } catch (e) {
        return sendRes(500, JSON.stringify({ error: e.message }));
      }


    } else {
      return sendRes(500, JSON.stringify({ error: "Invalid request, no detectable Url" }));
    }
  } else {
    return sendRes(500, JSON.stringify({ error: "Deployment failure, environment misconfigured" }));
  }



};

const sendRes = (status: number, body: string) => {
  var response = {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      "Content-Type": "application/json"
    },
    body: body
  };
  return response;
};