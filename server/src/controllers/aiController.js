import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const askMentor = async (req, res) => {
    const { question, context } = req.body;

    try {
        const systemPrompt = `You are a professional AI Learning Mentor for SkillPath AI. 
        Context: ${context || 'General learning guidance'}.
        Provide a concise, helpful, and encouraging response. 
        If it's a technical question, explain clearly. If it's about their progress, motivate them.
        Return ONLY the text response.`;

        const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

        const modelId = "meta.llama3-8b-instruct-v1:0";
        const body = JSON.stringify({
            prompt: prompt,
            max_gen_len: 1024,
            temperature: 0.7,
            top_p: 0.9,
        });

        const command = new InvokeModelCommand({
            modelId,
            body,
            contentType: "application/json",
            accept: "application/json",
        });

        console.log("Sending prompt to Bedrock (8B)...");
        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        console.log("Bedrock Response received.");
        const answer = result.generation;

        res.json({ answer });
    } catch (error) {
        console.error("Mentor Error Stack:", error.stack);
        res.status(500).json({ message: error.message });
    }
};
