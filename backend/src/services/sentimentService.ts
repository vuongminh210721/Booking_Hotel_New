import { translate } from "@vitalets/google-translate-api";
import { pipeline } from "@xenova/transformers";

let sentimentPipeline: any = null;

const getPipeline = async () => {
    if (!sentimentPipeline) {
        sentimentPipeline = await pipeline(
            "sentiment-analysis",
            "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
        );
    }
    return sentimentPipeline;
};

export const analyzeSentimentFromVietnamese = async (text: string) => {
    const translated = await translate(text, { to: "en" });

    const pipe = await getPipeline();
    const result = await pipe(translated.text);


    return {
        label: result[0].label.toLowerCase(), // positive | negative
        score: result[0].score,               // 0 → 1
        translatedText: translated.text,
    };
};
