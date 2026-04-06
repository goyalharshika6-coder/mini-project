import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from 'dotenv';
dotenv.config();

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const testAI = async () => {
    const modelId = "meta.llama3-8b-instruct-v1:0";
    const prompt = "Hello, are you active?";
    const formattedPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    const body = JSON.stringify({
        prompt: formattedPrompt,
        max_gen_len: 128,
        temperature: 0.5,
    });

    try {
        console.log("Testing Bedrock with model:", modelId);
        const command = new InvokeModelCommand({
            modelId,
            body,
            contentType: "application/json",
            accept: "application/json",
        });

        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        console.log("Full Bedrock Result:", JSON.stringify(result, null, 2));
        console.log("--- AI RESPONSE START ---");
        console.log(result.generation);
        console.log("--- AI RESPONSE END ---");
    } catch (error) {
        console.error("Bedrock Connectivity Error:", error.message);
        if (error.stack) console.error(error.stack);
    }
};

testAI();
