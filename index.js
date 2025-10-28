import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: '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', // ganti dengan key kamu
});

const completion = await openai.chat.completions.create({
  model: "deepseek/deepseek-chat",
  messages: [{ role: "user", content: "Apa obat sakit jantung paling murah dan bisa dibbeli bebas di apotek" }],
});

console.log(completion.choices[0].message.content);