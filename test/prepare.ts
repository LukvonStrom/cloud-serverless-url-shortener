import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";


export async function extractOutput()  {

    let command = new DescribeStacksCommand({StackName: "ShortenerStack"});
    let {Stacks} = await new CloudFormationClient({region: 'eu-central-1'}).send(command);
    if(Stacks){
        let output = (Stacks[0].Outputs?.filter(el => el.OutputKey === "S3WebsiteBucket"))
    if(output && output[0] && output[0].OutputValue && output[0].OutputKey ){
        process.env["SLUG_BUCKET"] = output[0].OutputValue
    }
    }else{
        throw new Error("Infrastructure mess up") 
    }
    
}
