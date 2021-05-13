import { DynamoDBClient, PutItemCommand  } from "@aws-sdk/client-dynamodb";
import {Context, APIGatewayProxyEventV2} from "aws-lambda"
import { marshall } from "@aws-sdk/util-dynamodb";

// create AWS SDK clients
const dynamo = new DynamoDBClient({region: process.env.AWS_REGION});

exports.handler = async function(event:APIGatewayProxyEventV2, context: Context) {
  

  if(event?.pathParameters?.url){
    let id = 24567;
    const putItemCommand = new PutItemCommand ({
      TableName: process.env.TABLE_NAME,
      Item: marshall({
        url: event.pathParameters.url,
        id,
        timestamp: new Date().toISOString()
      })
    });
    const item = await dynamo.send(putItemCommand);
    return sendRes(200, JSON.stringify(item))
  }else{
    return sendRes(500, "Invalid request, missing Url");
  }
  
};

const sendRes = (status:number, body:string) => {
  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "text/html"
    },
    body: body
  };
  return response;
};