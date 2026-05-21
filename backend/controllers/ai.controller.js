import Groq from 'groq-sdk';
import Product from '../models/Product.model.js';

// Lazy Groq client — instantiated on first request so dotenv has already run
let _groq = null;
const getGroq = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

// Valid product categories in our store
const VALID_CATEGORIES = ['seeds', 'fertilizers', 'pesticides', 'tools', 'irrigation', 'feed'];

// Keyword → category fallback map
const ISSUE_CATEGORY_MAP = {
  'yellow': ['fertilizers', 'pesticides'],
  'pale': ['fertilizers'],
  'pest': ['pesticides'],
  'insect': ['pesticides'],
  'bug': ['pesticides'],
  'disease': ['pesticides'],
  'fungal': ['pesticides'],
  'fungus': ['pesticides'],
  'blight': ['pesticides'],
  'wilt': ['pesticides'],
  'nutrient': ['fertilizers'],
  'deficiency': ['fertilizers'],
  'growth': ['fertilizers', 'seeds'],
  'irrigation': ['irrigation'],
  'water': ['irrigation'],
  'drought': ['irrigation'],
  'drip': ['irrigation'],
  'sprinkler': ['irrigation'],
  'seed': ['seeds'],
  'sowing': ['seeds'],
  'planting': ['seeds'],
  'germination': ['seeds'],
  'tool': ['tools'],
  'equipment': ['tools'],
  'animal': ['feed'],
  'livestock': ['feed'],
  'cattle': ['feed'],
  'organic': ['fertilizers', 'seeds'],
  'fertilizer': ['fertilizers'],
  'urea': ['fertilizers'],
  'spray': ['pesticides'],
  'weed': ['pesticides'],
  'खाद': ['fertilizers'],
  'कीट': ['pesticides'],
  'बीज': ['seeds'],
  'सिंचाई': ['irrigation'],
  'पीली': ['fertilizers', 'pesticides'],
};

/**
 * Extract JSON from a string that may contain extra text around it
 */
const extractJSON = (text) => {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }
  return null;
};

/**
 * POST /api/ai/farming-assistant
 */
export const farmingAssistant = async (req, res) => {
  try {
    const { query, language = 'en' } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const trimmedQuery = query.trim().slice(0, 500);

    // Language name for the prompt
    const LANG_NAMES = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
      pa: 'Punjabi',
      te: 'Telugu',
      ta: 'Tamil',
    };
    const langName = LANG_NAMES[language] || 'English';

    // ── Step 1: Call Groq AI ──
    const systemPrompt = `You are Krishi AI, an expert agricultural assistant for Indian farmers.
Analyze farming problems and respond ONLY with a valid JSON object — no extra text, no markdown, no explanation outside the JSON.

JSON schema (respond with exactly this structure):
{
  "crop": "name of crop detected, or General if not mentioned",
  "issue": "short issue title in 3-5 words",
  "severity": "Low",
  "recommendation": "2-3 practical sentences advising the farmer what to do",
  "recommendedCategories": ["fertilizers"],
  "summary": "one sentence summary",
  "urgency": "Within a week",
  "confidence": 80
}

Rules:
- severity must be exactly one of: Low, Medium, High, Critical
- urgency must be exactly one of: Immediate, Within 3 days, Within a week, Not urgent
- recommendedCategories must only contain values from this list: seeds, fertilizers, pesticides, tools, irrigation, feed
- confidence is an integer 0-100
- IMPORTANT: Write the "recommendation" and "summary" fields in ${langName} language
- The "crop" and "issue" fields can be in English
- Output ONLY the JSON object, nothing else`;

    const userMessage = `Farmer query: "${trimmedQuery}"
Respond language: ${langName}
Write recommendation and summary in ${langName}.
Respond with JSON only.`;

    let aiAnalysis = null;
    let groqError = null;

    try {
      const completion = await getGroq().chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 700,
      });

      const rawContent = completion.choices[0]?.message?.content || '';
      console.log('Groq raw response:', rawContent.slice(0, 300));

      aiAnalysis = extractJSON(rawContent);

      if (!aiAnalysis) {
        console.error('Failed to parse Groq JSON response:', rawContent);
      }
    } catch (err) {
      groqError = err;
      console.error('Groq API call failed:', err.message);
      if (err.status) console.error('Groq status:', err.status);
      if (err.error) console.error('Groq error detail:', JSON.stringify(err.error));
    }

    // ── Fallback if Groq failed or returned bad JSON ──
    if (!aiAnalysis) {
      // Build a smart fallback using keyword matching
      const queryLower = trimmedQuery.toLowerCase();
      let fallbackCategories = [];
      for (const [keyword, cats] of Object.entries(ISSUE_CATEGORY_MAP)) {
        if (queryLower.includes(keyword)) {
          fallbackCategories.push(...cats);
        }
      }
      fallbackCategories = [...new Set(fallbackCategories)].slice(0, 3);
      if (fallbackCategories.length === 0) fallbackCategories = ['fertilizers', 'pesticides'];

      aiAnalysis = {
        crop: 'General',
        issue: 'Farming Query',
        severity: 'Medium',
        recommendation: {
          en: 'Please consult your local agricultural expert. The products below may help with your issue.',
          hi: 'कृपया अपने स्थानीय कृषि विशेषज्ञ से सलाह लें। नीचे दिए गए उत्पाद आपकी समस्या में मदद कर सकते हैं।',
          mr: 'कृपया तुमच्या स्थानिक कृषी तज्ञाशी सल्लामसलत करा. खालील उत्पादने तुमच्या समस्येत मदत करू शकतात.',
          pa: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਨਾਲ ਸਲਾਹ ਕਰੋ। ਹੇਠਾਂ ਦਿੱਤੇ ਉਤਪਾਦ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੇ ਹਨ।',
          te: 'దయచేసి మీ స్థానిక వ్యవసాయ నిపుణుడిని సంప్రదించండి. దిగువ ఉత్పత్తులు మీ సమస్యకు సహాయపడవచ్చు.',
          ta: 'உங்கள் உள்ளூர் வேளாண் நிபுணரை அணுகவும். கீழே உள்ள தயாரிப்புகள் உங்கள் பிரச்சனைக்கு உதவலாம்.',
        }[language] || 'Please consult your local agricultural expert.',
        recommendedCategories: fallbackCategories,
        summary: trimmedQuery,
        urgency: 'Within a week',
        confidence: 60,
        _fallback: true,
      };

      if (groqError) {
        console.error('Using fallback due to Groq error:', groqError.message);
      }
    }

    // ── Validate categories ──
    let validatedCategories = (aiAnalysis.recommendedCategories || [])
      .filter(cat => VALID_CATEGORIES.includes(cat))
      .slice(0, 3);

    if (validatedCategories.length === 0) {
      const queryLower = trimmedQuery.toLowerCase();
      for (const [keyword, cats] of Object.entries(ISSUE_CATEGORY_MAP)) {
        if (queryLower.includes(keyword)) {
          validatedCategories.push(...cats);
        }
      }
      validatedCategories = [...new Set(validatedCategories)].slice(0, 3);
      if (validatedCategories.length === 0) validatedCategories = ['fertilizers', 'pesticides'];
    }

    // ── Step 2: Fetch real products from MongoDB ──
    const products = await Product.find({
      category: { $in: validatedCategories },
      isAvailable: true,
      stock: { $gt: 0 },
    })
      .populate('sellerId', 'name shopName')
      .sort({ rating: -1, createdAt: -1 })
      .limit(8);

    // ── Step 3: Respond ──
    res.json({
      success: true,
      data: {
        analysis: {
          crop: aiAnalysis.crop || 'General',
          issue: aiAnalysis.issue || 'Farming Query',
          severity: ['Low', 'Medium', 'High', 'Critical'].includes(aiAnalysis.severity)
            ? aiAnalysis.severity : 'Medium',
          recommendation: aiAnalysis.recommendation || 'Please consult an agricultural expert.',
          recommendedCategories: validatedCategories,
          summary: aiAnalysis.summary || trimmedQuery,
          urgency: ['Immediate', 'Within 3 days', 'Within a week', 'Not urgent'].includes(aiAnalysis.urgency)
            ? aiAnalysis.urgency : 'Within a week',
          confidence: typeof aiAnalysis.confidence === 'number'
            ? Math.min(100, Math.max(0, Math.round(aiAnalysis.confidence))) : 80,
        },
        products,
        query: trimmedQuery,
      },
    });

  } catch (error) {
    console.error('AI assistant fatal error:', error);
    res.status(500).json({
      success: false,
      message: 'AI assistant temporarily unavailable. Please try again.',
    });
  }
};
