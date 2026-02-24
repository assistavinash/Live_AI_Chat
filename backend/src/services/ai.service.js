const {GoogleGenAI} = require("@google/genai");

const ai = new GoogleGenAI({})

// Request tracking - stores requests per user per day
const dailyRequestTracker = {};
const REQUEST_LIMIT = 20;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000; // 1 second

// Get today's date key
function getTodayKey() {
    const date = new Date();
    return date.toISOString().split('T')[0];
}

// Track and check request limit
function canMakeRequest(userId) {
    const today = getTodayKey();
    const key = `${userId}-${today}`;
    
    if (!dailyRequestTracker[key]) {
        dailyRequestTracker[key] = 0;
    }
    
    return dailyRequestTracker[key] < REQUEST_LIMIT;
}

// Increment request count
function incrementRequestCount(userId) {
    const today = getTodayKey();
    const key = `${userId}-${today}`;
    dailyRequestTracker[key] = (dailyRequestTracker[key] || 0) + 1;
    return dailyRequestTracker[key];
}

// Get remaining requests
function getRemainingRequests(userId) {
    const today = getTodayKey();
    const key = `${userId}-${today}`;
    const used = dailyRequestTracker[key] || 0;
    return REQUEST_LIMIT - used;
}

// Exponential backoff with retry
async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = BASE_RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        if (error.status === 429 && retries > 0) {
            console.log(`Rate limited. Retrying in ${delay}ms... Retries left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

async function generateResponse(content, userId) {
    try {
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: content,
                config: {
                    temperature: 0.7,
                    systemInstruction:`<system_instruction>

<identity>
    Tumhara naam <name>Aurora</name> hai.
    Tum ek smart, friendly aur reliable AI assistant ho.
    Tumhara kaam users ki problems solve karna aur unhe clearly guide karna hai.
</identity>

<persona>
    Tumhara tone warm, natural aur supportive hai.
    Tum ek knowledgeable dost ki tarah samjhate ho — na overly playful, na robotic.
</persona>

<communication_style>
    • Hinglish use karo (natural Hindi + English mix).
    • Simple aur direct language use karo.
    • Extra explanation tab tak mat do jab tak user na maange.
</communication_style>

<response_length_rule>
    ⚠️ Default behaviour:

    • Har reply MAX 2 lines ka hoga.
    • Sirf direct answer dena hai — no extra detail.
    • Examples, steps, ya explanation include nahi karne.

    ✅ Agar user explicitly bole:
    "explain", "detail", "samjhao", "kaise", "thoda sahi se batao"

    → Tabhi detailed answer do.
</response_length_rule>

<behavior_rules>
    • Concise raho — unnecessary text avoid karo.
    • Jab tak user na kahe, teaching mode activate mat karo.
    • Repeat ya filler lines mat likho.
</behavior_rules>

<technical_mode>
    Default: sirf fix ya answer.
    Detail tabhi jab user specifically maange.
</technical_mode>

<restrictions>
    • Kabhi claim mat karo ki tum human ho.
    • Fake ya assumed info mat do.
    • Over-explaining strictly avoid karo.
</restrictions>

<goal>
    Fast answers. Minimal text. Zero bakbak.
</goal>

</system_instruction>`
                }
            });
        });
        return response.text;
    } catch (error) {
        if (error.status === 429) {
            throw { code: 'QUOTA_EXCEEDED', message: 'Daily limit reached, please try tomorrow ✨', status: 429 };
        }
        if (error.status === 503) {
            throw { code: 'SERVICE_BUSY', message: 'Aurora is currently busy, please try in a few seconds', status: 503 };
        }
        throw error;
    }
}

async function generateVector(content) {
    try {
        const response = await retryWithBackoff(async () => {
            return await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: content,
                config: {
                    outputDimensionality:768}
            });
        });
        return response.embeddings[0].values;
    } catch (error) {
        if (error.status === 429) {
            throw { code: 'QUOTA_EXCEEDED', message: 'Daily limit reached, please try tomorrow ✨', status: 429 };
        }
        console.log('Vector generation error:', error.message);
        return null;
    }
}

module.exports = { 
    generateResponse, 
    generateVector,
    canMakeRequest,
    incrementRequestCount,
    getRemainingRequests
};