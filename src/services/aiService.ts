import { Accommodation } from '../types';
import { mockApi, INITIAL_ACCOMMODATIONS } from '../api/mockApi';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  recommendedStays?: Accommodation[];
  intent?: 'search_stays' | 'support_faq' | 'general_chat';
}

interface GeminiExtractionResult {
  reply: string;
  intent: 'search_stays' | 'support_faq' | 'general_chat';
  criteria?: {
    destination?: string;
    maxPrice?: number;
    minPrice?: number;
    amenities?: string[];
    category?: 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa';
  };
  suggestedStayIds?: string[];
}

const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

// Primary & Fallback models
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
];

class AiService {
  /**
   * Send user message to Gemini and return structured assistant response
   * with matched real accommodation recommendations.
   */
  async sendMessage(
    userText: string,
    history: { role: 'user' | 'model'; text: string }[] = []
  ): Promise<{
    reply: string;
    recommendedStays: Accommodation[];
    intent: 'search_stays' | 'support_faq' | 'general_chat';
  }> {
    // 1. Fetch available accommodations for context
    let allStays: Accommodation[] = [];
    try {
      allStays = await mockApi.getAccommodations();
    } catch {
      allStays = INITIAL_ACCOMMODATIONS;
    }

    // Build a compact summary of real stays for Gemini context
    const staysSummary = allStays.slice(0, 20).map((s) => ({
      id: s.id,
      title: s.title,
      location: s.location,
      city: s.city,
      country: s.country,
      category: s.category,
      pricePerNight: s.pricePerNight,
      amenities: s.amenities.slice(0, 5),
      rating: s.rating,
    }));

    const systemPrompt = `
Bạn là "Trợ lý Du lịch AI" (AI Travel Assistant) thông minh của ứng dụng Travelling App.
Nhiệm vụ của bạn là hỗ trợ khách hàng bằng tiếng Việt một cách thân thiện, chu đáo và nhiệt tình:
1. Tư vấn lịch trình, gợi ý chỗ nghỉ theo ngôn ngữ tự nhiên (ví dụ: "Tìm chỗ nghỉ ở Bali có hồ bơi dưới $50", "Phòng view đẹp ở Đà Lạt cho 2 người").
2. Giải đáp thắc mắc về chính sách đặt phòng, hủy chuyến và hoàn tiền:
   - Chính sách hủy chuyến: Khách có thể hủy chuyến trực tiếp tại tab "Chuyến đi của tôi" bất cứ lúc nào trước giờ nhận phòng.
   - Tiền thanh toán sẽ được hoàn trả 100% về phương thức thanh toán ban đầu trong vòng 3-5 ngày làm việc.
3. Khi khách có nhu cầu tìm hoặc hỏi về chỗ nghỉ:
   - Hãy trích xuất các tiêu chí tìm kiếm: destination, maxPrice (USD), minPrice (USD), category ('Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa'), amenities (mảng chuỗi như Hồ bơi, Wifi, Bếp, View biển...).
   - Hãy đối chiếu với danh sách các chỗ nghỉ hiện có của app dưới đây và chọn ra 1 đến 4 id chỗ nghỉ phù hợp nhất đưa vào "suggestedStayIds".
   - KHÔNG ĐƯỢC TỰ BỊA RA CHỖ NGHỈ KHÔNG CÓ TRONG DANH SÁCH.

Danh sách chỗ nghỉ hiện có trong app:
${JSON.stringify(staysSummary)}

QUAN TRỌNG: Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ (không kèm Markdown \`\`\`json hay bất kỳ văn bản nào bên ngoài) với cấu trúc:
{
  "reply": "Nội dung phản hồi tư vấn tự nhiên, nhiệt tình và hữu ích bằng tiếng Việt",
  "intent": "search_stays" hoặc "support_faq" hoặc "general_chat",
  "criteria": {
    "destination": "tên địa điểm nếu có hoặc null",
    "maxPrice": 50,
    "category": "Beach hoặc null",
    "amenities": ["Hồ bơi", "Wifi"]
  },
  "suggestedStayIds": ["id-1", "id-2"]
}
`.trim();

    try {
      const parsedData = await this.callGeminiWithFallback(userText, history, systemPrompt);

      let matchedStays: Accommodation[] = [];

      // If Gemini returned specific IDs, resolve them
      if (parsedData.suggestedStayIds && Array.isArray(parsedData.suggestedStayIds) && parsedData.suggestedStayIds.length > 0) {
        matchedStays = allStays.filter((s) => parsedData.suggestedStayIds!.includes(s.id));
      }

      // If no IDs or not enough, filter by criteria
      if (matchedStays.length === 0 && parsedData.criteria) {
        matchedStays = this.filterStaysByCriteria(allStays, parsedData.criteria);
      }

      // If still search_stays intent but empty, try heuristic search on user's query
      if (matchedStays.length === 0 && (parsedData.intent === 'search_stays' || this.looksLikeSearch(userText))) {
        matchedStays = this.heuristicSearch(allStays, userText);
      }

      return {
        reply: parsedData.reply || 'Dưới đây là một số gợi ý chỗ nghỉ phù hợp với yêu cầu của bạn:',
        recommendedStays: matchedStays.slice(0, 4),
        intent: parsedData.intent || 'general_chat',
      };
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent fallback parser:', err);
      return this.fallbackLocalHandler(userText, allStays);
    }
  }

  /**
   * Try models with fallback in case one model is unavailable
   */
  private async callGeminiWithFallback(
    userText: string,
    history: { role: 'user' | 'model'; text: string }[],
    systemPrompt: string
  ): Promise<GeminiExtractionResult> {
    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const contents = [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'Tôi đã hiểu và sẵn sàng hỗ trợ người dùng theo đúng định dạng JSON yêu cầu.' }],
          },
          ...history.map((h) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [{ text: userText }],
          },
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Gemini status ${response.status}: ${JSON.stringify(errData)}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const rawReply = candidate?.content?.parts?.[0]?.text || '';

        // Extract JSON from response (handling potential markdown code blocks)
        const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as GeminiExtractionResult;
        }

        // If pure text was returned without json brackets
        return {
          reply: rawReply,
          intent: 'general_chat',
        };
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next...`, err);
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }

  private looksLikeSearch(text: string): boolean {
    const q = text.toLowerCase();
    return (
      q.includes('tìm') ||
      q.includes('chỗ nghỉ') ||
      q.includes('khách sạn') ||
      q.includes('phòng') ||
      q.includes('homestay') ||
      q.includes('resort') ||
      q.includes('villa') ||
      q.includes('giá') ||
      q.includes('view') ||
      q.includes('bali') ||
      q.includes('đà lạt') ||
      q.includes('đà nẵng') ||
      q.includes('phú quốc') ||
      q.includes('nha trang')
    );
  }

  private filterStaysByCriteria(
    stays: Accommodation[],
    criteria: GeminiExtractionResult['criteria']
  ): Accommodation[] {
    if (!criteria) return [];

    return stays.filter((stay) => {
      if (criteria.destination) {
        const dest = criteria.destination.toLowerCase();
        const stayLoc = `${stay.location} ${stay.city} ${stay.country} ${stay.title}`.toLowerCase();
        if (!stayLoc.includes(dest)) return false;
      }
      if (criteria.maxPrice && stay.pricePerNight > criteria.maxPrice) {
        return false;
      }
      if (criteria.category && stay.category?.toLowerCase() !== criteria.category.toLowerCase()) {
        return false;
      }
      if (criteria.amenities && criteria.amenities.length > 0) {
        const hasSomeAmenity = criteria.amenities.some((reqFac) =>
          stay.amenities.some((a) => a.toLowerCase().includes(reqFac.toLowerCase()))
        );
        if (!hasSomeAmenity) return false;
      }
      return true;
    });
  }

  private heuristicSearch(stays: Accommodation[], text: string): Accommodation[] {
    const q = text.toLowerCase();

    // Check price in query e.g. "dưới 50", "duoi 60", "< 70", "50$"
    let maxPrice: number | null = null;
    const priceMatch = q.match(/(?:dưới|<|khoảng|tầm)\s*(\d+)/i) || q.match(/(\d+)\s*(?:\$|usd|đô)/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1], 10);
    }

    return stays.filter((s) => {
      if (maxPrice && s.pricePerNight > maxPrice) return false;

      const fullText = `${s.title} ${s.location} ${s.city} ${s.country} ${s.category} ${s.amenities.join(' ')}`.toLowerCase();

      // Check key locations
      if (q.includes('bali') && !fullText.includes('bali')) return false;
      if (q.includes('đà lạt') && !fullText.includes('đà lạt') && !fullText.includes('da lat')) return false;
      if (q.includes('phú quốc') && !fullText.includes('phú quốc') && !fullText.includes('phu quoc')) return false;
      if (q.includes('nha trang') && !fullText.includes('nha trang')) return false;

      // Check amenities
      if (q.includes('hồ bơi') || q.includes('bể bơi') || q.includes('pool')) {
        const hasPool = s.amenities.some((a) => a.toLowerCase().includes('hồ bơi') || a.toLowerCase().includes('pool'));
        if (!hasPool) return false;
      }

      if (q.includes('biển') || q.includes('beach')) {
        if (s.category !== 'Beach' && !fullText.includes('biển') && !fullText.includes('beach')) return false;
      }

      if (q.includes('núi') || q.includes('mountain')) {
        if (s.category !== 'Mountain' && !fullText.includes('núi')) return false;
      }

      return true;
    });
  }

  /**
   * Fallback handler providing intelligent responses if offline
   */
  private fallbackLocalHandler(
    userText: string,
    allStays: Accommodation[]
  ): {
    reply: string;
    recommendedStays: Accommodation[];
    intent: 'search_stays' | 'support_faq' | 'general_chat';
  } {
    const q = userText.toLowerCase();

    // 1. FAQ / Support questions
    if (q.includes('hủy') || q.includes('hoàn tiền') || q.includes('chính sách')) {
      return {
        reply:
          'Chính sách hủy chuyến của Travelling App rất linh hoạt:\n\n' +
          '• Bạn có thể hủy chuyến trực tiếp trong mục "Chuyến đi của tôi" bất cứ lúc nào trước giờ nhận phòng.\n' +
          '• Số tiền đã thanh toán sẽ được hoàn trả đầy đủ 100% vào tài khoản/thẻ ban đầu của bạn trong vòng 3-5 ngày làm việc.\n' +
          '• Bạn chỉ cần chọn lý do hủy (ví dụ: thay đổi lịch trình, việc bận...) và bấm Xác nhận hủy chuyến.',
        recommendedStays: [],
        intent: 'support_faq',
      };
    }

    if (q.includes('thanh toán') || q.includes('trả trước') || q.includes('thẻ')) {
      return {
        reply:
          'Travelling App hỗ trợ thanh toán bảo mật đa dạng:\n\n' +
          '• Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard, JCB).\n' +
          '• Bạn có thể chọn Thanh toán toàn bộ (Full) hoặc Trả trước 50% để giữ phòng, phần còn lại thanh toán khi nhận phòng.\n' +
          '• Sau khi thanh toán, hóa đơn và biên lai PDF điện tử sẽ được gửi ngay về mục Chuyến đi.',
        recommendedStays: [],
        intent: 'support_faq',
      };
    }

    // 2. Search query matches
    const matched = this.heuristicSearch(allStays, userText);
    if (matched.length > 0) {
      return {
        reply: `Dựa trên yêu cầu "${userText}", mình đã tìm thấy ${matched.length} chỗ nghỉ tuyệt vời phù hợp với bạn. Hãy bấm xem chi tiết để đặt phòng nhé:`,
        recommendedStays: matched.slice(0, 4),
        intent: 'search_stays',
      };
    }

    // 3. General travel recommendation
    return {
      reply:
        'Chào bạn! Mình là Trợ lý Du lịch AI của Travelling App. Bạn có thể hỏi mình bất kỳ điều gì, ví dụ:\n\n' +
        '• "Tìm chỗ nghỉ ở Bali có hồ bơi dưới $50"\n' +
        '• "Gợi ý phòng view núi lãng mạn Đà Lạt"\n' +
        '• "Chính sách hủy chuyến và hoàn tiền như thế nào?"\n\n' +
        'Mình có thể giúp bạn tìm phòng và giải đáp thắc mắc ngay!',
      recommendedStays: allStays.slice(0, 3),
      intent: 'general_chat',
    };
  }
}

export const aiService = new AiService();

