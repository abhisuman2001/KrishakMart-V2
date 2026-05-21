import API from './api';
import { Product } from './productService';

export type AILanguage = 'en' | 'hi' | 'mr' | 'pa' | 'te' | 'ta';

export interface AIAnalysis {
  crop: string;
  issue: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  recommendedCategories: string[];
  summary: string;
  urgency: 'Immediate' | 'Within 3 days' | 'Within a week' | 'Not urgent';
  confidence: number;
}

export interface AIAssistantResponse {
  analysis: AIAnalysis;
  products: Product[];
  query: string;
}

export const askFarmingAssistant = async (
  query: string,
  language: AILanguage = 'en'
): Promise<AIAssistantResponse> => {
  const { data } = await API.post('/ai/farming-assistant', { query, language });
  return data.data as AIAssistantResponse;
};

// Language metadata
export const AI_LANGUAGES: { code: AILanguage; label: string; native: string; voiceLang: string }[] = [
  { code: 'en', label: 'English',    native: 'EN',   voiceLang: 'en-IN' },
  { code: 'hi', label: 'Hindi',      native: 'हिं',  voiceLang: 'hi-IN' },
  { code: 'mr', label: 'Marathi',    native: 'मरा',  voiceLang: 'mr-IN' },
  { code: 'pa', label: 'Punjabi',    native: 'ਪੰਜ', voiceLang: 'pa-IN' },
  { code: 'te', label: 'Telugu',     native: 'తెలు', voiceLang: 'te-IN' },
  { code: 'ta', label: 'Tamil',      native: 'தமி',  voiceLang: 'ta-IN' },
];

// UI strings per language
export const AI_UI: Record<AILanguage, {
  welcome: string;
  placeholder: string;
  quickQuestions: string;
  analyzing: string;
  activitySteps: string[];
  cropDetected: string;
  severity: string;
  urgency: string;
  confidence: string;
  recommendedAction: string;
  recommendedProducts: string;
  addAll: string;
  adding: string;
  loginToCart: string;
  addedToCart: string;
  outOfStock: string;
  addToCart: string;
  poweredBy: string;
  voiceStop: string;
  voiceStart: string;
}> = {
  en: {
    welcome: "Hello! I'm Krishi AI. Tell me your crop problem and I'll recommend the right products from our store.",
    placeholder: "Ask about your crop problem...",
    quickQuestions: "Quick Questions",
    analyzing: "AI is analyzing...",
    activitySteps: [
      "Analyzing your farming query...",
      "Detecting crop and issue type...",
      "Assessing severity level...",
      "Fetching matching products...",
      "Generating recommendations...",
    ],
    cropDetected: "Crop Detected",
    severity: "Severity",
    urgency: "Urgency",
    confidence: "AI Confidence",
    recommendedAction: "Recommended Action",
    recommendedProducts: "Recommended Products",
    addAll: "Add All",
    adding: "Adding...",
    loginToCart: "Please login to add items to cart",
    addedToCart: "products added to cart!",
    outOfStock: "Out of Stock",
    addToCart: "Add to Cart",
    poweredBy: "Powered by Groq AI · Hindi, Marathi, Punjabi, Telugu, Tamil supported",
    voiceStop: "Stop listening",
    voiceStart: "Voice input",
  },
  hi: {
    welcome: "नमस्ते! मैं कृषि AI हूं। अपनी फसल की समस्या बताएं और मैं सही उत्पाद सुझाऊंगा।",
    placeholder: "अपनी फसल की समस्या बताएं...",
    quickQuestions: "त्वरित प्रश्न",
    analyzing: "AI विश्लेषण कर रहा है...",
    activitySteps: [
      "आपकी कृषि समस्या का विश्लेषण हो रहा है...",
      "फसल और समस्या का प्रकार पहचाना जा रहा है...",
      "गंभीरता का स्तर आंका जा रहा है...",
      "उपयुक्त उत्पाद खोजे जा रहे हैं...",
      "सिफारिशें तैयार की जा रही हैं...",
    ],
    cropDetected: "फसल पहचानी गई",
    severity: "गंभीरता",
    urgency: "तात्कालिकता",
    confidence: "AI विश्वास",
    recommendedAction: "अनुशंसित कार्रवाई",
    recommendedProducts: "अनुशंसित उत्पाद",
    addAll: "सभी जोड़ें",
    adding: "जोड़ा जा रहा है...",
    loginToCart: "कार्ट में जोड़ने के लिए लॉगिन करें",
    addedToCart: "उत्पाद कार्ट में जोड़े गए!",
    outOfStock: "स्टॉक खत्म",
    addToCart: "कार्ट में जोड़ें",
    poweredBy: "Groq AI द्वारा संचालित · हिंदी, मराठी, पंजाबी, तेलुगु, तमिल समर्थित",
    voiceStop: "सुनना बंद करें",
    voiceStart: "आवाज़ इनपुट",
  },
  mr: {
    welcome: "नमस्कार! मी कृषी AI आहे. तुमच्या पिकाची समस्या सांगा आणि मी योग्य उत्पादने सुचवेन.",
    placeholder: "तुमच्या पिकाची समस्या विचारा...",
    quickQuestions: "त्वरित प्रश्न",
    analyzing: "AI विश्लेषण करत आहे...",
    activitySteps: [
      "तुमची शेती समस्या विश्लेषण होत आहे...",
      "पीक आणि समस्येचा प्रकार ओळखला जात आहे...",
      "तीव्रतेची पातळी मोजली जात आहे...",
      "योग्य उत्पादने शोधली जात आहेत...",
      "शिफारसी तयार केल्या जात आहेत...",
    ],
    cropDetected: "पीक ओळखले",
    severity: "तीव्रता",
    urgency: "तातडी",
    confidence: "AI विश्वास",
    recommendedAction: "शिफारस केलेली कृती",
    recommendedProducts: "शिफारस केलेली उत्पादने",
    addAll: "सर्व जोडा",
    adding: "जोडत आहे...",
    loginToCart: "कार्टमध्ये जोडण्यासाठी लॉगिन करा",
    addedToCart: "उत्पादने कार्टमध्ये जोडली!",
    outOfStock: "स्टॉक संपला",
    addToCart: "कार्टमध्ये जोडा",
    poweredBy: "Groq AI द्वारे चालवले · मराठी, हिंदी, पंजाबी, तेलुगु, तमिळ समर्थित",
    voiceStop: "ऐकणे थांबवा",
    voiceStart: "आवाज इनपुट",
  },
  pa: {
    welcome: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ AI ਹਾਂ। ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਸਮੱਸਿਆ ਦੱਸੋ ਅਤੇ ਮੈਂ ਸਹੀ ਉਤਪਾਦ ਸੁਝਾਵਾਂਗਾ।",
    placeholder: "ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਸਮੱਸਿਆ ਪੁੱਛੋ...",
    quickQuestions: "ਤੇਜ਼ ਸਵਾਲ",
    analyzing: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
    activitySteps: [
      "ਤੁਹਾਡੀ ਖੇਤੀ ਸਮੱਸਿਆ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...",
      "ਫ਼ਸਲ ਅਤੇ ਸਮੱਸਿਆ ਦੀ ਕਿਸਮ ਪਛਾਣੀ ਜਾ ਰਹੀ ਹੈ...",
      "ਗੰਭੀਰਤਾ ਦਾ ਪੱਧਰ ਮਾਪਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
      "ਢੁਕਵੇਂ ਉਤਪਾਦ ਲੱਭੇ ਜਾ ਰਹੇ ਹਨ...",
      "ਸਿਫ਼ਾਰਸ਼ਾਂ ਤਿਆਰ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ...",
    ],
    cropDetected: "ਫ਼ਸਲ ਪਛਾਣੀ ਗਈ",
    severity: "ਗੰਭੀਰਤਾ",
    urgency: "ਜ਼ਰੂਰੀਅਤ",
    confidence: "AI ਭਰੋਸਾ",
    recommendedAction: "ਸਿਫ਼ਾਰਸ਼ੀ ਕਾਰਵਾਈ",
    recommendedProducts: "ਸਿਫ਼ਾਰਸ਼ੀ ਉਤਪਾਦ",
    addAll: "ਸਭ ਜੋੜੋ",
    adding: "ਜੋੜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    loginToCart: "ਕਾਰਟ ਵਿੱਚ ਜੋੜਨ ਲਈ ਲੌਗਿਨ ਕਰੋ",
    addedToCart: "ਉਤਪਾਦ ਕਾਰਟ ਵਿੱਚ ਜੋੜੇ ਗਏ!",
    outOfStock: "ਸਟਾਕ ਖਤਮ",
    addToCart: "ਕਾਰਟ ਵਿੱਚ ਜੋੜੋ",
    poweredBy: "Groq AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ · ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਮਰਾਠੀ, ਤੇਲੁਗੂ, ਤਮਿਲ ਸਮਰਥਿਤ",
    voiceStop: "ਸੁਣਨਾ ਬੰਦ ਕਰੋ",
    voiceStart: "ਆਵਾਜ਼ ਇਨਪੁੱਟ",
  },
  te: {
    welcome: "నమస్కారం! నేను కృషి AI ని. మీ పంట సమస్య చెప్పండి, నేను సరైన ఉత్పత్తులు సూచిస్తాను.",
    placeholder: "మీ పంట సమస్య అడగండి...",
    quickQuestions: "త్వరిత ప్రశ్నలు",
    analyzing: "AI విశ్లేషిస్తోంది...",
    activitySteps: [
      "మీ వ్యవసాయ సమస్య విశ్లేషించబడుతోంది...",
      "పంట మరియు సమస్య రకం గుర్తించబడుతోంది...",
      "తీవ్రత స్థాయి అంచనా వేయబడుతోంది...",
      "సరిపోయే ఉత్పత్తులు వెతకబడుతున్నాయి...",
      "సిఫార్సులు తయారు చేయబడుతున్నాయి...",
    ],
    cropDetected: "పంట గుర్తించబడింది",
    severity: "తీవ్రత",
    urgency: "అత్యవసరత",
    confidence: "AI నమ్మకం",
    recommendedAction: "సిఫార్సు చేసిన చర్య",
    recommendedProducts: "సిఫార్సు చేసిన ఉత్పత్తులు",
    addAll: "అన్నీ జోడించు",
    adding: "జోడిస్తోంది...",
    loginToCart: "కార్ట్‌కు జోడించడానికి లాగిన్ చేయండి",
    addedToCart: "ఉత్పత్తులు కార్ట్‌కు జోడించబడ్డాయి!",
    outOfStock: "స్టాక్ లేదు",
    addToCart: "కార్ట్‌కు జోడించు",
    poweredBy: "Groq AI ద్వారా నడపబడుతోంది · తెలుగు, హిందీ, మరాఠీ, పంజాబీ, తమిళం మద్దతు",
    voiceStop: "వినడం ఆపు",
    voiceStart: "వాయిస్ ఇన్‌పుట్",
  },
  ta: {
    welcome: "வணக்கம்! நான் கிருஷி AI. உங்கள் பயிர் பிரச்சனையை சொல்லுங்கள், சரியான தயாரிப்புகளை பரிந்துரைக்கிறேன்.",
    placeholder: "உங்கள் பயிர் பிரச்சனையை கேளுங்கள்...",
    quickQuestions: "விரைவு கேள்விகள்",
    analyzing: "AI பகுப்பாய்வு செய்கிறது...",
    activitySteps: [
      "உங்கள் விவசாய கேள்வி பகுப்பாய்வு செய்யப்படுகிறது...",
      "பயிர் மற்றும் பிரச்சனை வகை கண்டறியப்படுகிறது...",
      "தீவிரத்தன்மை மதிப்பிடப்படுகிறது...",
      "பொருத்தமான தயாரிப்புகள் தேடப்படுகின்றன...",
      "பரிந்துரைகள் தயாரிக்கப்படுகின்றன...",
    ],
    cropDetected: "பயிர் கண்டறியப்பட்டது",
    severity: "தீவிரம்",
    urgency: "அவசரம்",
    confidence: "AI நம்பிக்கை",
    recommendedAction: "பரிந்துரைக்கப்பட்ட நடவடிக்கை",
    recommendedProducts: "பரிந்துரைக்கப்பட்ட தயாரிப்புகள்",
    addAll: "அனைத்தையும் சேர்",
    adding: "சேர்க்கிறது...",
    loginToCart: "கார்ட்டில் சேர்க்க உள்நுழையவும்",
    addedToCart: "தயாரிப்புகள் கார்ட்டில் சேர்க்கப்பட்டன!",
    outOfStock: "இருப்பு இல்லை",
    addToCart: "கார்ட்டில் சேர்",
    poweredBy: "Groq AI ஆல் இயக்கப்படுகிறது · தமிழ், இந்தி, மராத்தி, பஞ்சாபி, தெலுங்கு ஆதரவு",
    voiceStop: "கேட்பதை நிறுத்து",
    voiceStart: "குரல் உள்ளீடு",
  },
};

// Suggested prompts per language
export const SUGGESTED_PROMPTS: Record<AILanguage, { text: string; icon: string }[]> = {
  en: [
    { text: 'Wheat leaves turning yellow', icon: '🌾' },
    { text: 'Pest attack on rice crop', icon: '🐛' },
    { text: 'Best fertilizer for tomato', icon: '🍅' },
    { text: 'Irrigation for low rainfall', icon: '💧' },
    { text: 'Organic farming suggestions', icon: '🌿' },
    { text: 'Fungal disease on potato', icon: '🥔' },
  ],
  hi: [
    { text: 'गेहूं की पत्तियां पीली हो रही हैं', icon: '🌾' },
    { text: 'धान की फसल पर कीट हमला', icon: '🐛' },
    { text: 'टमाटर के लिए सबसे अच्छा उर्वरक', icon: '🍅' },
    { text: 'कम वर्षा में सिंचाई का तरीका', icon: '💧' },
    { text: 'जैविक खेती के सुझाव', icon: '🌿' },
    { text: 'आलू पर फंगल रोग', icon: '🥔' },
  ],
  mr: [
    { text: 'गव्हाची पाने पिवळी होत आहेत', icon: '🌾' },
    { text: 'भाताच्या पिकावर कीड हल्ला', icon: '🐛' },
    { text: 'टोमॅटोसाठी सर्वोत्तम खत', icon: '🍅' },
    { text: 'कमी पावसात सिंचन', icon: '💧' },
    { text: 'सेंद्रिय शेतीचे सुझाव', icon: '🌿' },
    { text: 'बटाट्यावर बुरशीजन्य रोग', icon: '🥔' },
  ],
  pa: [
    { text: 'ਕਣਕ ਦੇ ਪੱਤੇ ਪੀਲੇ ਹੋ ਰਹੇ ਹਨ', icon: '🌾' },
    { text: 'ਝੋਨੇ ਦੀ ਫ਼ਸਲ ਤੇ ਕੀੜੇ ਦਾ ਹਮਲਾ', icon: '🐛' },
    { text: 'ਟਮਾਟਰ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਖਾਦ', icon: '🍅' },
    { text: 'ਘੱਟ ਮੀਂਹ ਵਿੱਚ ਸਿੰਚਾਈ', icon: '💧' },
    { text: 'ਜੈਵਿਕ ਖੇਤੀ ਦੇ ਸੁਝਾਅ', icon: '🌿' },
    { text: 'ਆਲੂ ਤੇ ਫੰਗਲ ਰੋਗ', icon: '🥔' },
  ],
  te: [
    { text: 'గోధుమ ఆకులు పసుపు రంగుకు మారుతున్నాయి', icon: '🌾' },
    { text: 'వరి పంటపై చీడపురుగుల దాడి', icon: '🐛' },
    { text: 'టమాటాకు ఉత్తమ ఎరువు', icon: '🍅' },
    { text: 'తక్కువ వర్షపాతంలో నీటిపారుదల', icon: '💧' },
    { text: 'సేంద్రీయ వ్యవసాయ సూచనలు', icon: '🌿' },
    { text: 'బంగాళాదుంపలపై శిలీంధ్ర వ్యాధి', icon: '🥔' },
  ],
  ta: [
    { text: 'கோதுமை இலைகள் மஞ்சளாகின்றன', icon: '🌾' },
    { text: 'நெல் பயிரில் பூச்சி தாக்குதல்', icon: '🐛' },
    { text: 'தக்காளிக்கு சிறந்த உரம்', icon: '🍅' },
    { text: 'குறைந்த மழையில் நீர்ப்பாசனம்', icon: '💧' },
    { text: 'இயற்கை விவசாய ஆலோசனைகள்', icon: '🌿' },
    { text: 'உருளைக்கிழங்கில் பூஞ்சை நோய்', icon: '🥔' },
  ],
};
