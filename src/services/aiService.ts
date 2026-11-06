import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accommodation } from '../types';
import { mockApi, INITIAL_ACCOMMODATIONS } from '../api/mockApi';

export interface AiFilterCriteria {
  destination?: string;
  maxPrice?: number;
  minPrice?: number;
  amenities?: string[];
  category?: 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa';
}

export interface VoiceSearchResult {
  rawQuery: string;
  isItineraryOrFaq: boolean;
  destination?: string;
  category?: 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa' | 'All';
  amenities?: string[];
  matchingStays: Accommodation[];
  aiMessage: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  recommendedStays?: Accommodation[];
  intent?: 'search_stays' | 'support_faq' | 'general_chat';
  criteria?: AiFilterCriteria;
  followUps?: string[];
}

interface GeminiExtractionResult {
  reply: string;
  intent: 'search_stays' | 'support_faq' | 'general_chat';
  criteria?: AiFilterCriteria;
  suggestedStayIds?: string[];
}

const AI_CHAT_STORAGE_KEY = '@travelling_app_ai_chat_history';

const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

// Primary & Fallback models
// (Các model 1.5 / 2.0 / 2.5 cũ đã bị Google ngừng hỗ trợ -> trả về 404)
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

class AiService {
  /**
   * Send user message to Gemini and return structured assistant response
   * with matched real accommodation recommendations and search criteria.
   */
  async sendMessage(
    userText: string,
    history: { role: 'user' | 'model'; text: string }[] = []
  ): Promise<{
    reply: string;
    recommendedStays: Accommodation[];
    intent: 'search_stays' | 'support_faq' | 'general_chat';
    criteria?: AiFilterCriteria;
    followUps?: string[];
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
1. LẬP LỊCH TRÌNH DU LỊCH THÔNG MINH (AI Itinerary Planner):
   - Khi người dùng hỏi lập lịch trình, lên kế hoạch du lịch (ví dụ: "Lập lịch trình 3 ngày 2 đêm ở Đà Lạt", "Kế hoạch đi Phú Quốc 2N1Đ", "Tour Bali tiết kiệm"):
   - Hãy thiết kế một lịch trình chi tiết theo từng ngày (Ngày 1, Ngày 2...), chia theo các buổi Sáng - Trưa - Chiều - Tối, bao gồm các điểm check-in hấp dẫn, địa điểm ăn uống đặc sản địa phương, và dự toán chi phí hợp lý.
   - Luôn kèm theo 1 đến 2 chỗ nghỉ phù hợp nhất trong danh sách có sẵn của app đưa vào "suggestedStayIds" để khách có thể đặt phòng ngay.
2. Giải đáp thắc mắc về chính sách đặt chỗ, hủy chuyến và hoàn tiền:
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

      const followUps = this.generateFollowUps(parsedData.intent, userText, parsedData.criteria);

      return {
        reply: parsedData.reply || 'Dưới đây là một số gợi ý chỗ nghỉ phù hợp với yêu cầu của bạn:',
        recommendedStays: matchedStays.slice(0, 4),
        intent: parsedData.intent || 'general_chat',
        criteria: parsedData.criteria,
        followUps,
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
    if (!GEMINI_API_KEY) {
      throw new Error('No GEMINI_API_KEY provided');
    }

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

    // Check price in query (supports both VND and USD):
    let maxPrice: number | null = null;

    // 1. VND patterns like "1.500.000", "1500000", "1.200.000", "1500k"
    const vndFullMatch = q.match(/(?:dưới|<|khoảng|tầm)\s*([\d\.,]+)\s*(?:đ|vnd|vnđ|đồng|k)?/i);
    if (vndFullMatch) {
      const cleanNumStr = vndFullMatch[1].replace(/\./g, '').replace(/,/g, '');
      let val = parseInt(cleanNumStr, 10);
      if (q.includes('k') && val < 10000) {
        val = val * 1000;
      }
      if (val >= 10000) {
        maxPrice = Math.round(val / 25000); // quy đổi về USD để so khớp với dữ liệu
      } else if (val > 0 && val < 500) {
        maxPrice = val;
      }
    }

    // 2. VND patterns like "1,5 triệu", "1.5 triệu", "1tr5", "1 triệu"
    const trieuMatch = q.match(/(?:dưới|<|khoảng|tầm)\s*(\d+)(?:[,\.](\d+))?\s*(?:triệu|tr)/i);
    if (trieuMatch) {
      const whole = parseInt(trieuMatch[1], 10);
      const frac = trieuMatch[2] ? parseInt(trieuMatch[2], 10) : 0;
      const vndVal = whole * 1000000 + frac * 100000;
      maxPrice = Math.round(vndVal / 25000);
    }

    // 3. USD explicit: "$60", "60 usd", "60 đô"
    const usdMatch = q.match(/(\d+)\s*(?:\$|usd|đô)/i);
    if (usdMatch) {
      maxPrice = parseInt(usdMatch[1], 10);
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

  private generateFollowUps(
    intent?: string,
    userText?: string,
    criteria?: AiFilterCriteria
  ): string[] {
    if (intent === 'search_stays') {
      const dest = criteria?.destination || '';
      return [
        dest ? `Xem thêm các chỗ nghỉ khác tại ${dest}` : 'Xem thêm chỗ nghỉ có giá tốt nhất',
        'Chỗ nào có hồ bơi và bữa sáng miễn phí?',
        'Chính sách hủy chuyến và hoàn tiền của app',
      ];
    }

    if (intent === 'support_faq') {
      return [
        'Làm cách nào để hủy chuyến trên app?',
        'Thời gian nhận lại tiền hoàn trả là bao lâu?',
        'Gợi ý cho mình các chỗ nghỉ hot ở Đà Lạt',
      ];
    }

    return [
      'Tìm chỗ nghỉ ở Bali có hồ bơi dưới 1.500.000 VNĐ',
      'Gợi ý phòng view núi lãng mạn ở Đà Lạt',
      'Chính sách hủy chuyến & hoàn tiền ra sao?',
    ];
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
    criteria?: AiFilterCriteria;
    followUps?: string[];
  } {
    const q = userText.toLowerCase();

    // 0. ITINERARY PLANNER (Lập lịch trình du lịch thông minh)
    if (q.includes('lịch trình') || q.includes('kế hoạch') || q.includes('tour') || (q.includes('ngày') && q.includes('đêm'))) {
      if (q.includes('đà lạt') || q.includes('da lat')) {
        const dalatStays = allStays.filter(s => s.location.toLowerCase().includes('đà lạt') || s.location.toLowerCase().includes('da lat') || s.category === 'Mountain');
        return {
          reply:
            '🗺️ **LỊCH TRÌNH 3 NGÀY 2 ĐÊM TẠI ĐÀ LẠT (Dự toán ngân sách ~3.000.000đ/2 người)**\n\n' +
            '🌿 **Ngày 1: Chạm ngõ thành phố sương mù**\n' +
            '• Sáng (8:00 - 11:30): Nhận phòng chỗ nghỉ, thưởng thức bánh căn xíu mại nóng hổi.\n' +
            '• Chiều (14:00 - 17:30): Check-in Đồi chè Cầu Đất săn mây & hái dâu tây công nghệ cao.\n' +
            '• Tối (18:30 - 21:30): Thưởng thức lẩu gà lá é Tao Ngộ, dạo Chợ Đêm ăn bánh tráng nướng & uống sữa đậu nành nóng.\n\n' +
            '🌲 **Ngày 2: Rừng thông & Hoàng hôn thơ mộng**\n' +
            '• Sáng: Chèo thuyền SUP đón sương sớm tại Hồ Tuyền Lâm, viếng Thiền Viện Trúc Lâm.\n' +
            '• Chiều: Thưởng thức cà phê ngắm hoàng hôn đồi thông (Tiệm Cà Phê Túi Mơ To hoặc Lululola).\n' +
            '• Tối: Tiệc nướng BBQ sưởi ấm ngắm thung lũng đèn lung linh.\n\n' +
            '☕ **Ngày 3: Thư giãn & Mua sắm đặc sản**\n' +
            '• Sáng: Cà phê vợt cổ truyền, mua hồng treo gió & mứt atiso làm quà cho gia đình.\n' +
            '• Trưa: Trả phòng, kết thúc chuyến đi tuyệt vời!\n\n' +
            '🏨 Dưới đây là các chỗ nghỉ view núi tuyệt đẹp tại Đà Lạt để bạn đặt phòng:',
          recommendedStays: dalatStays.length > 0 ? dalatStays.slice(0, 3) : allStays.slice(0, 3),
          intent: 'search_stays',
          followUps: [
            'Phòng view núi lãng mạn ở Đà Lạt',
            'Chính sách hủy phòng & hoàn tiền',
            'Lập lịch trình 3N2Đ biển Phú Quốc',
          ],
        };
      }

      if (q.includes('phú quốc') || q.includes('phu quoc')) {
        const pqStays = allStays.filter(s => s.location.toLowerCase().includes('phú quốc') || s.location.toLowerCase().includes('phu quoc') || s.category === 'Beach');
        return {
          reply:
            '🏖️ **LỊCH TRÌNH 3 NGÀY 2 ĐÊM THIÊN ĐƯỜNG BIỂN PHÚ QUỐC**\n\n' +
            '🌊 **Ngày 1: Đón hoàng hôn & Thưởng thức hải sản**\n' +
            '• Trưa: Đến Phú Quốc, nhận phòng bungalow ven biển nghỉ ngơi.\n' +
            '• Chiều: Check-in Sunset Sanato ngắm hoàng hôn rực rỡ bên biển Bãi Trường.\n' +
            '• Tối: Ăn bún quậy Kiến Xây, dạo chợ đêm thưởng thức hải sản nướng mỡ hành.\n\n' +
            '🤿 **Ngày 2: Tour 4 đảo & Cáp treo Hòn Thơm**\n' +
            '• Sáng: Cano tham quan Hòn Mây Rút, Hòn Móng Tay lặn ngắm san hô tự nhiên.\n' +
            '• Chiều: Đi cáp treo vượt biển Hòn Thơm ngắm toàn cảnh vịnh An Thới.\n' +
            '• Tối: Thưởng thức cocktail tại OCSEN Beach Bar ngắm biển đêm.\n\n' +
            '🏝️ **Ngày 3: Tắm biển Bãi Sao & Mua sắm**\n' +
            '• Sáng: Tắm biển tại Bãi Sao với bờ cát trắng mịn, mua ngọc trai & tiêu đen làm quà.\n' +
            '• Trưa: Trả phòng, chuẩn bị ra sân bay.\n\n' +
            '🏨 Dưới đây là các resort & bungalow ven biển tại Phú Quốc dành cho bạn:',
          recommendedStays: pqStays.length > 0 ? pqStays.slice(0, 3) : allStays.slice(0, 3),
          intent: 'search_stays',
          followUps: [
            'Bungalow view biển Phú Quốc',
            'Chính sách trả trước 50% ra sao?',
            'Lập lịch trình 4N3Đ Bali tiết kiệm',
          ],
        };
      }

      if (q.includes('bali')) {
        const baliStays = allStays.filter(s => s.location.toLowerCase().includes('bali') || s.category === 'Beach' || s.category === 'Villa');
        return {
          reply:
            '🌴 **LỊCH TRÌNH 4 NGÀY 3 ĐÊM KHÁM PHÁ THIÊN ĐƯỜNG BALI TIẾT KIỆM**\n\n' +
            '🌺 **Ngày 1: Đến Bali & Thư giãn hồ bơi**\n' +
            '• Nhận phòng villa có hồ bơi riêng, ngắm hoàng hôn bãi biển Kuta.\n' +
            '• Ăn tối món cơm Nasi Goreng & thịt xiên Satay đặc trưng Indonesia.\n\n' +
            '🌾 **Ngày 2: Trái tim văn hóa Ubud**\n' +
            '• Sáng: Check-in ruộng bậc thang Tegalalang xanh mướt & trải nghiệm Bali Swing.\n' +
            '• Chiều: Khám phá Rừng khỉ thiêng Sacred Monkey Forest & Thác nước Tegenungan.\n\n' +
            '🏛️ **Ngày 3: Đền Uluwatu & Múa lửa Kecak**\n' +
            '• Sáng: Tắm biển cát trắng tại Padang Padang Beach.\n' +
            '• Chiều: Tham quan đền vách đá Uluwatu, thưởng thức múa lửa Kecak lúc hoàng hôn.\n' +
            '• Tối: Tiệc hải sản BBQ trên bãi cát vịnh Jimbaran.\n\n' +
            '🛍️ **Ngày 4: Mua sắm quà lưu niệm & Tạm biệt**\n' +
            '• Mua đồ thủ công tại chợ nghệ thuật Ubud Art Market, ra sân bay.\n\n' +
            '🏨 Dưới đây là các villa & chỗ nghỉ Bali đẹp giá dưới 1.500.000đ dành cho bạn:',
          recommendedStays: baliStays.length > 0 ? baliStays.slice(0, 3) : allStays.slice(0, 3),
          intent: 'search_stays',
          followUps: [
            '🌴 Chỗ nghỉ Bali có hồ bơi dưới 1.500.000đ',
            'Chính sách hủy phòng hoàn tiền',
            '🗺️ Lập lịch trình 3N2Đ Đà Lạt',
          ],
        };
      }
    }

    // 1. FAQ / Support questions
    if (q.includes('hủy') || q.includes('hoàn tiền') || q.includes('chính sách')) {
      return {
        reply:
          'Chính sách hủy chuyến của Travelling App rất linh hoạt:\n\n' +
          '• Bạn có thể hủy chuyến trực tiếp trong mục "Chuyến đi của tôi" bất cứ lúc nào trước giờ nhận phòng.\n' +
          '• Số tiền đã thanh toán sẽ được hoàn trả đầy đủ 100% vào phương thức ban đầu trong vòng 3-5 ngày làm việc.\n' +
          '• Bạn chỉ cần chọn lý do hủy (ví dụ: thay đổi lịch trình, việc bận...) và bấm Xác nhận hủy chuyến.',
        recommendedStays: [],
        intent: 'support_faq',
        followUps: [
          'Làm sao để xem chuyến đi đã hủy?',
          'Gợi ý chỗ nghỉ lãng mạn ở Đà Lạt',
          'Tìm phòng có hồ bơi dưới 1.200.000 VNĐ',
        ],
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
        followUps: [
          'Chính sách hủy chuyến & hoàn tiền',
          'Tìm villa nghỉ dưỡng view biển',
        ],
      };
    }

    // 2. Search query matches
    const matched = this.heuristicSearch(allStays, userText);
    const dest = q.includes('bali') ? 'Bali' : q.includes('đà lạt') ? 'Đà Lạt' : q.includes('phú quốc') ? 'Phú Quốc' : undefined;
    const criteria: AiFilterCriteria = {
      destination: dest,
      amenities: q.includes('hồ bơi') ? ['Hồ bơi'] : undefined,
    };

    if (matched.length > 0) {
      return {
        reply: `Dựa trên yêu cầu "${userText}", mình đã tìm thấy ${matched.length} chỗ nghỉ tuyệt vời phù hợp với bạn. Hãy bấm xem chi tiết hoặc chuyển sang bộ lọc tìm kiếm nhé:`,
        recommendedStays: matched.slice(0, 4),
        intent: 'search_stays',
        criteria,
        followUps: this.generateFollowUps('search_stays', userText, criteria),
      };
    }

    // 3. General travel recommendation
    return {
      reply:
        'Chào bạn! Mình là Trợ lý Du lịch AI của Travelling App. Bạn có thể hỏi mình bất kỳ điều gì, ví dụ:\n\n' +
        '• "Tìm chỗ nghỉ ở Bali có hồ bơi dưới 1.500.000đ"\n' +
        '• "Gợi ý phòng view núi lãng mạn Đà Lạt"\n' +
        '• "Chính sách hủy chuyến và hoàn tiền như thế nào?"\n\n' +
        'Mình có thể giúp bạn tìm phòng và giải đáp thắc mắc ngay!',
      recommendedStays: allStays.slice(0, 3),
      intent: 'general_chat',
      followUps: this.generateFollowUps('general_chat'),
    };
  }

  /**
   * Transcribe recorded audio (base64) using Gemini Multimodal Speech Recognition
   */
  async transcribeAudio(base64Audio: string, mimeType: string = 'audio/mp4'): Promise<string> {
    if (!GEMINI_API_KEY || !base64Audio) {
      return '';
    }

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Audio,
                    },
                  },
                  {
                    text: 'Hãy chuyển toàn bộ giọng nói tiếng Việt trong đoạn ghi âm thành văn bản chính xác nhất. Chỉ trả về duy nhất nội dung văn bản mà người dùng nói, không thêm bất kỳ lời chào, giải thích, dấu ngoặc kép hay định dạng nào khác.',
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!response.ok) {
          console.warn(`transcribeAudio: model ${model} trả về status ${response.status}`);
          continue;
        }

        const data = await response.json();
        const parts: any[] = data.candidates?.[0]?.content?.parts || [];
        const candidateText = parts
          .filter((p) => typeof p?.text === 'string' && !p.thought)
          .map((p) => p.text)
          .join(' ');
        if (candidateText) {
          const cleanText = candidateText
            .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '')
            .replace(/[.!?。]+$/g, '')
            .trim();
          if (cleanText) {
            return cleanText;
          }
        }
      } catch (err) {
        console.warn(`transcribeAudio failed with model ${model}:`, err);
      }
    }
    return '';
  }

  /**
   * AI Voice Search Processor:
   * Semantically analyzes spoken Vietnamese queries, extracts destination,
   * category, amenities, detects itinerary/FAQ requests, and finds matching stays.
   * GUARANTEES non-empty fallback so users never see an error or blank screen.
   */
  async processVoiceQuery(spokenText: string): Promise<VoiceSearchResult> {
    const raw = (spokenText || '').trim();
    const q = raw.toLowerCase();

    // 1. Fetch available accommodations
    let allStays: Accommodation[] = [];
    try {
      allStays = await mockApi.getAccommodations();
    } catch {
      allStays = INITIAL_ACCOMMODATIONS;
    }

    // Always sort by rating descending
    allStays.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // 2. Check if this is an Itinerary / FAQ question
    const isItineraryOrFaq =
      q.includes('lịch trình') ||
      q.includes('kế hoạch') ||
      q.includes('3n2đ') ||
      q.includes('2n1đ') ||
      q.includes('tour') ||
      q.includes('ăn gì') ||
      q.includes('chơi gì') ||
      q.includes('chính sách') ||
      q.includes('hoàn tiền') ||
      q.includes('hủy chuyến') ||
      q.includes('hủy phòng');

    if (isItineraryOrFaq) {
      return {
        rawQuery: raw,
        isItineraryOrFaq: true,
        matchingStays: allStays.slice(0, 4),
        aiMessage: `✨ AI đang hỗ trợ tư vấn: "${raw}"`,
      };
    }

    // 3. Extract Destination
    let destination: string | undefined = undefined;
    const destMap: [string[], string][] = [
      [['đà lạt', 'da lat'], 'Đà Lạt'],
      [['phú quốc', 'phu quoc'], 'Phú Quốc'],
      [['vũng tàu', 'vung tau'], 'Vũng Tàu'],
      [['đà nẵng', 'da nang'], 'Đà Nẵng'],
      [['nha trang'], 'Nha Trang'],
      [['hà nội', 'ha noi'], 'Hà Nội'],
      [['hội an', 'hoi an'], 'Hội An'],
      [['sa pa', 'sapa'], 'Sa Pa'],
      [['hạ long', 'ha long'], 'Hạ Long'],
      [['hồ chí minh', 'sài gòn', 'sai gon', 'tphcm'], 'Hồ Chí Minh'],
      [['quy nhơn', 'quy nhon'], 'Quy Nhơn'],
      [['côn đảo', 'con dao'], 'Côn Đảo'],
      [['mũi né', 'mui ne', 'phan thiết', 'phan thiet'], 'Mũi Né'],
      [['huế', 'hue'], 'Huế'],
      [['tam đảo', 'tam dao'], 'Tam Đảo'],
      [['hà giang', 'ha giang'], 'Hà Giang'],
      [['mù cang chải', 'mu cang chai'], 'Mù Cang Chải'],
      [['pù luông', 'pu luong'], 'Pù Luông'],
      [['phong nha', 'quảng bình'], 'Phong Nha'],
      [['bali'], 'Bali'],
    ];

    for (const [aliases, standardName] of destMap) {
      if (aliases.some((alias) => q.includes(alias))) {
        destination = standardName;
        break;
      }
    }

    // 4. Extract Category
    let category: 'Beach' | 'Mountain' | 'Camping' | 'City' | 'Villa' | undefined = undefined;
    if (
      q.includes('bãi biển') ||
      q.includes('sát biển') ||
      q.includes('biển') ||
      q.includes('beach') ||
      q.includes('đảo')
    ) {
      category = 'Beach';
    } else if (
      q.includes('núi') ||
      q.includes('view đồi') ||
      q.includes('đồi') ||
      q.includes('săn mây') ||
      q.includes('rừng') ||
      q.includes('thung lũng')
    ) {
      category = 'Mountain';
    } else if (
      q.includes('cắm trại') ||
      q.includes('lều') ||
      q.includes('camping') ||
      q.includes('glamping') ||
      q.includes('bờ suối')
    ) {
      category = 'Camping';
    } else if (
      q.includes('thành phố') ||
      q.includes('trung tâm') ||
      q.includes('phố cổ') ||
      q.includes('city')
    ) {
      category = 'City';
    } else if (q.includes('villa') || q.includes('biệt thự')) {
      category = 'Villa';
    }

    // 5. Extract Amenities
    const amenities: string[] = [];
    if (q.includes('hồ bơi') || q.includes('bể bơi') || q.includes('pool')) {
      amenities.push('Hồ bơi');
    }
    if (q.includes('bữa sáng') || q.includes('buffet') || q.includes('ăn sáng')) {
      amenities.push('Bao gồm bữa sáng');
    }
    if (q.includes('view biển') || q.includes('ngắm hoàng hôn')) {
      amenities.push('Tầm nhìn');
    }
    if (q.includes('bbq') || q.includes('nướng')) {
      amenities.push('BBQ');
    }

    // 6. Smart Multi-tier Filtering
    let matched = allStays;

    // Filter by destination if identified
    if (destination) {
      const destLower = destination.toLowerCase();
      const destMatches = matched.filter((s) => {
        const full = `${s.title} ${s.location} ${s.city} ${s.country}`.toLowerCase();
        return full.includes(destLower);
      });
      if (destMatches.length > 0) {
        matched = destMatches;
      }
    }

    // Filter by category if identified
    if (category) {
      const catMatches = matched.filter((s) => s.category?.toLowerCase() === category?.toLowerCase());
      if (catMatches.length > 0) {
        matched = catMatches;
      }
    }

    // Filter by amenities if identified
    if (amenities.length > 0) {
      const amenityMatches = matched.filter((s) =>
        amenities.some((req) =>
          s.amenities.some((a) => a.toLowerCase().includes(req.toLowerCase()))
        )
      );
      if (amenityMatches.length > 0) {
        matched = amenityMatches;
      }
    }

    // 7. Compose friendly AI message
    let aiMessage = '';
    if (destination && category) {
      aiMessage = `✨ AI đã lọc ${matched.length} chỗ nghỉ ${category === 'Beach' ? 'ven biển' : category === 'Mountain' ? 'ngắm cảnh núi/đồi' : category === 'Villa' ? 'biệt thự' : 'chất lượng'} tại ${destination}`;
    } else if (destination) {
      aiMessage = `✨ AI đã tìm thấy ${matched.length} chuyến đi xuất sắc nhất tại ${destination}`;
    } else if (category) {
      aiMessage = `✨ AI đã lọc ${matched.length} chuyến đi thuộc danh mục ${category === 'Beach' ? 'Bãi biển' : category === 'Mountain' ? 'Núi non' : category === 'Camping' ? 'Cắm trại' : category === 'Villa' ? 'Biệt thự' : 'Thành phố'}`;
    } else if (amenities.length > 0) {
      aiMessage = `✨ AI đã tìm thấy ${matched.length} chuyến đi có tiện ích ${amenities.join(', ')}`;
    } else {
      aiMessage = `✨ AI đã nhận diện: "${raw}". Đang đề xuất các chuyến đi được đánh giá cao nhất:`;
    }

    return {
      rawQuery: raw,
      isItineraryOrFaq: false,
      destination,
      category,
      amenities,
      matchingStays: matched,
      aiMessage,
    };
  }

  // --- PERSISTENCE (AsyncStorage) ---
  async getStoredChatHistory(): Promise<AiChatMessage[]> {
    try {
      const raw = await AsyncStorage.getItem(AI_CHAT_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      return [];
    } catch {
      return [];
    }
  }

  async saveChatHistory(messages: AiChatMessage[]): Promise<void> {
    try {
      // Keep up to 50 latest messages to maintain optimal performance
      const trimmed = messages.slice(-50);
      await AsyncStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Lỗi lưu lịch sử chat AI:', e);
    }
  }

  async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AI_CHAT_STORAGE_KEY);
    } catch (e) {
      console.warn('Lỗi xóa lịch sử chat AI:', e);
    }
  }
}

export const aiService = new AiService();
