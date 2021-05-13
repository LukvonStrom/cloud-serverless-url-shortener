import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {Context, APIGatewayProxyEventV2} from "aws-lambda"
import { unmarshall } from "@aws-sdk/util-dynamodb";

// create AWS SDK clients
const dynamo = new DynamoDBClient({region: process.env.AWS_REGION});

exports.handler = async function(event:APIGatewayProxyEventV2, context: Context) {
  

  if(event?.pathParameters?.id){
    const getItemCommand = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      ConsistentRead: true,
      Key: {
        "id": {"S": event?.pathParameters?.id} 
      }
    });
    const item = await dynamo.send(getItemCommand);
    if(item && item.Item){
      const {url} = unmarshall(item.Item);
      return redirect(url);
    }
  }else{
    return sendRes(500, "Invalid request, missing Url");
  }
  return sendRes(404, "Not found");
  
};

const redirect = (Location:string) => {
  return {
    statusCode: 302,
    headers: {
      Location
    },
    body: "redirecting..."
  }
}

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