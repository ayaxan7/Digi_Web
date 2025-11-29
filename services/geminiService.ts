import { BACKEND_URL } from '../config';

export const generateAgriResponse = async (
  prompt: string,
  imageBase64?: string,
  language: 'en' | 'hi' | 'kn' | 'te' = 'en'
): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            image: imageBase64, // Send full base64 string including header
            language
        })
    });

    if (!response.ok) {
        throw new Error('Backend failed to generate response');
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    if (language === 'hi') return "क्षमा करें, मुझे सर्वर से जुड़ने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।";
    if (language === 'kn') return "ಕ್ಷಮಿಸಿ, ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ.";
    if (language === 'te') return "క్షమించండి, సర్వర్‌కు కనెక్ట్ చేయడంలో సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.";
    return "Sorry, I am having trouble connecting to the agri-server. Please try again later.";
  }
};