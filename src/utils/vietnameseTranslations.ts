export interface ItemTranslation {
  title: string;
  description: string;
  fullDescription: string;
  location: string;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  checkIn?: string;
  checkOut?: string;
  policyNote?: string;
  services?: string[];
  bathroom?: string[];
}

export const AMENITY_TRANSLATIONS: Record<string, string> = {
  "breakfast included": "Bao gồm bữa sáng",
  "breakfast": "Bao gồm bữa sáng",
  "ocean view": "Tầm nhìn hướng biển",
  "paddle boards": "Ván chèo đứng (SUP)",
  "paddle board": "Ván chèo đứng (SUP)",
  "wifi": "Wifi tốc độ cao",
  "kayaks": "Chèo thuyền Kayak",
  "kayak": "Chèo thuyền Kayak",
  "seafood dinner": "Bữa tối hải sản",
  "sun deck": "Boong tắm nắng",
  "panoramic bay view": "Toàn cảnh vịnh biển",
  "private pool": "Hồ bơi riêng",
  "beachfront": "Sát bờ biển",
  "bbq area": "Khu nướng BBQ ngoài trời",
  "bbq setup": "Khu nướng BBQ ngoài trời",
  "bbq patio": "Sân nướng BBQ ngoài trời",
  "bbq": "Tiệc nướng BBQ",
  "kitchen": "Bếp đầy đủ tiện nghi",
  "infinity pool": "Hồ bơi vô cực",
  "gym": "Phòng tập Gym",
  "ocean view balcony": "Ban công ngắm biển",
  "beach towels": "Khăn tắm biển",
  "private infinity pool": "Hồ bơi vô cực riêng biệt",
  "cliffside view": "Tầm nhìn vách đá",
  "air conditioning": "Điều hòa 2 chiều",
  "private beach": "Bãi biển riêng tư",
  "luxury spa": "Dịch vụ Spa cao cấp",
  "private butler": "Quản gia riêng",
  "balcony": "Ban công ngắm cảnh",
  "mountain view": "Tầm nhìn núi hùng vĩ",
  "fireplace": "Lò sưởi củi ấm cúng",
  "trekking guides": "Hướng dẫn viên trekking",
  "valley view": "Tầm nhìn thung lũng mây",
  "heated indoor pool": "Hồ bơi nước ấm trong nhà",
  "pool table": "Bàn bida giải trí",
  "outdoor pool": "Hồ bơi ngoài trời",
  "swimming pool": "Hồ bơi ngoài trời",
  "karaoke": "Dàn karaoke gia đình",
  "koi fish pond": "Hồ cá Koi Nhật",
  "zen courtyard": "Khu vườn thiền Zen",
  "royal breakfast": "Bữa sáng hoàng gia",
  "tea ceremony": "Thưởng thức trà đạo",
  "24/7 security": "Bảo vệ an ninh 24/7",
  "large garden": "Sân vườn nhiệt đới rộng",
  "room service": "Dịch vụ phục vụ tại phòng",
  "private chef on request": "Đầu bếp riêng theo yêu cầu"
};

export const translateAmenity = (name: string): string => {
  if (!name) return '';
  const key = name.toLowerCase().trim();
  if (AMENITY_TRANSLATIONS[key]) {
    return AMENITY_TRANSLATIONS[key];
  }
  for (const [k, v] of Object.entries(AMENITY_TRANSLATIONS)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return name;
};

export const ITEM_TRANSLATIONS: Record<string, ItemTranslation> = {
  "beach-1": {
    "title": "Sunset Beach Bungalow (Bungalow Ngắm Hoàng Hôn)",
    "description": "Thức giấc trong tiếng sóng biển rì rào tại bungalow sinh thái bằng tre và kính ngay trên bờ cát vàng óng ả của vịnh Đà Nẵng.",
    "fullDescription": "Thức giấc trong tiếng sóng biển rì rào tại bungalow sinh thái bằng tre và kính ngay trên bờ cát vàng óng ả của vịnh Đà Nẵng. Không gian đón gió biển trong lành, ban công hướng thẳng ra biển mở ra khung cảnh hoàng hôn đẹp mê hồn.\n\nBungalow được trang bị đầy đủ tiện nghi với giường nệm cao cấp, bồn tắm hướng biển và khu vực thư giãn ngoài trời. Bạn có thể sử dụng miễn phí ván chèo đứng (SUP), thưởng thức bữa sáng nhiệt đới thơm ngon và ngắm nhìn đại dương bao la.",
    "location": "Vịnh Đà Nẵng, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Hỗ trợ xe điện đưa đón bãi tắm miễn phí. Vui lòng rửa sạch cát biển tại vòi tráng ngoài trời trước khi vào phòng ngủ.",
    "services": [
      "Miễn phí ván chèo đứng (SUP)",
      "Bữa sáng phục vụ tại hiên biển",
      "Hỗ trợ thuê xe máy đi bán đảo Sơn Trà",
      "Dọn phòng hàng ngày"
    ],
    "bathroom": [
      "Bồn tắm ngâm hướng biển",
      "Vòi sen tắm hoa sen ngoài trời",
      "Khăn tắm biển và áo choàng tắm",
      "Máy sấy tóc ion"
    ]
  },
  "beach-2": {
    "title": "Ha Long Bay Eco-Lodge (Nhà Nổi Sinh Thái Vịnh Hạ Long)",
    "description": "Bungalow gỗ nổi độc bản nép mình giữa những hòn đảo đá vôi kỳ vĩ của Vịnh Hạ Long, trải nghiệm chèo kayak và thưởng thức hải sản tươi ngon.",
    "fullDescription": "Bungalow gỗ nổi độc bản nép mình giữa những hòn đảo đá vôi kỳ vĩ của Vịnh Hạ Long, mang đến trải nghiệm chèo thuyền kayak và thưởng thức ẩm thực hải sản tươi ngon giữa kỳ quan thế giới.\n\nĐược thiết kế từ gỗ tự nhiên hòa quyện với làn nước xanh ngọc bích, khu nghỉ dưỡng nổi này có boong tắm nắng riêng biệt, thuyền kayak phục vụ miễn phí và bữa tối hải sản nướng thơm lừng dưới bầu trời sao.",
    "location": "Vịnh Hạ Long, Quảng Ninh, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "12:30",
    "checkOut": "11:00",
    "policyNote": "Tàu trung chuyển đón khách từ bến Tuần Châu lúc 12:00. Bắt buộc mặc áo phao khi chèo thuyền kayak và tắm biển trên vịnh.",
    "services": [
      "Thuyền kayak đáy kính miễn phí",
      "Bữa tối hải sản nướng trên boong tàu",
      "Câu mực đêm cùng ngư dân",
      "Trà chiều ngắm hoàng hôn vịnh"
    ],
    "bathroom": [
      "Phòng tắm vách kính ngắm vịnh",
      "Nước ngọt áp lực mạnh 24/7",
      "Đồ vệ sinh cá nhân thân thiện môi trường",
      "Khăn tắm cotton cao cấp"
    ]
  },
  "beach-3": {
    "title": "Phu Quoc Beach Villa (Biệt Thự Biển Bãi Ông Lang Phú Quốc)",
    "description": "Biệt thự biển riêng tư được bao quanh bởi rặng dừa xanh mát tại bãi biển Ông Lang, sở hữu hồ bơi riêng, vườn võng và view hoàng hôn tráng lệ.",
    "fullDescription": "Biệt thự biển riêng tư được bao quanh bởi rặng dừa xanh mát tại bãi biển Ông Lang, sở hữu hồ bơi riêng, vườn võng thư giãn và tầm nhìn ngắm hoàng hôn đảo ngọc tráng lệ.\n\nChỉ cách mép sóng vài bước chân, biệt thự có không gian bếp mở, sân vườn tiệc nướng BBQ và hồ bơi ngoài trời xanh biếc. Đây là chốn dừng chân lý tưởng cho các gia đình và nhóm bạn tìm kiếm sự yên bình.",
    "location": "Bãi biển Ông Lang, Phú Quốc, Kiên Giang, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Miễn phí đón tiễn sân bay Phú Quốc cho đặt phòng từ 2 đêm. Giữ yên lặng sau 22:30 để bảo đảm không gian thư thái chung cho khu nghỉ dưỡng.",
    "services": [
      "Hồ bơi riêng vệ sinh hàng ngày",
      "Dụng cụ tiệc nướng BBQ sân vườn",
      "Xe đưa đón sân bay Phú Quốc 2 chiều",
      "Dịch vụ giặt sấy theo yêu cầu"
    ],
    "bathroom": [
      "Bồn sục Jacuzzi ngoài trời",
      "3 Phòng tắm khép kín tiện nghi",
      "Khăn tắm lớn & tinh dầu sả chanh",
      "Vòi sen tắm đứng hiện đại"
    ]
  },
  "beach-4": {
    "title": "Nha Trang Ocean Suite (Căn Hộ Nghỉ Dưỡng Biển Nha Trang)",
    "description": "Căn hộ view biển ngập tràn ánh sáng với ban công rộng rãi, tiện nghi cao cấp và lối đi thẳng ra bờ cát trắng mịn đường Trần Phú, Nha Trang.",
    "fullDescription": "Căn hộ view biển ngập tràn ánh sáng với ban công rộng rãi, tiện nghi cao cấp và lối đi thẳng ra bờ cát trắng mịn đường Trần Phú, Nha Trang.\n\nTọa lạc tại tầng cao tòa nhà cao cấp, căn hộ sở hữu tầm nhìn ôm trọn vịnh Nha Trang xanh ngắt. Tiện ích tòa nhà bao gồm hồ bơi vô cực trên tầng thượng, phòng tập gym hiện đại và quầy bar ngắm biển.",
    "location": "Đường Trần Phú, TP. Nha Trang, Khánh Hòa, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng tự động bằng thẻ từ tại sảnh lễ tân tòa nhà. Không hút thuốc trong phòng và ban công.",
    "services": [
      "Hồ bơi vô cực tầng thượng tòa nhà",
      "Phòng Gym cao cấp miễn phí",
      "Lễ tân và bảo vệ túc trực 24/7",
      "Wifi cáp quang tốc độ cao"
    ],
    "bathroom": [
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc ion",
      "Gương led trang điểm",
      "Bộ đồ dùng cá nhân dùng một lần"
    ]
  },
  "beach-5": {
    "title": "Quy Nhon Cliff Villa (Biệt Thự Vách Đá Ghềnh Ráng Quy Nhơn)",
    "description": "Biệt thự vách đá tuyệt mỹ nhìn thẳng ra làn nước biển xanh ngọc bích Ghềnh Ráng, có hồ bơi vô cực riêng và boong tắm nắng ngắm bình minh.",
    "fullDescription": "Biệt thự vách đá tuyệt mỹ nhìn thẳng ra làn nước biển xanh ngọc bích Ghềnh Ráng, sở hữu hồ bơi vô cực riêng và boong tắm nắng ngắm bình minh tuyệt đỉnh.\n\nKiến trúc hiện đại hòa quyện với đá tự nhiên ven biển tạo nên một không gian nghỉ dưỡng biệt lập đẳng cấp. Du khách có thể thư giãn trong làn nước ấm, thưởng thức đồ uống cocktail mát lạnh và tận hưởng hương vị biển cả mặn mà.",
    "location": "Ghềnh Ráng, Quy Nhơn, Bình Định, Việt Nam",
    "maxGuests": 5,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 2,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policyNote": "Do địa hình vách đá ngắm cảnh, trẻ em vui lòng luôn có người lớn đi kèm khi ra khu vực lan can hồ bơi vô cực.",
    "services": [
      "Boong tắm nắng ngắm bình minh",
      "Phục vụ cocktail chiều bên hồ bơi",
      "Tư vấn tour Kỳ Co - Eo Gió",
      "Bếp nướng BBQ ngoài trời"
    ],
    "bathroom": [
      "Bồn tắm đá nguyên khối hướng biển",
      "Vòi sen trần Rain-shower",
      "Áo choàng lụa cao cấp",
      "Máy sấy tóc & sữa tắm thảo mộc"
    ]
  },
  "beach-6": {
    "title": "Con Dao Beach House (Nhà Nghỉ Dưỡng Biển Côn Đảo)",
    "description": "Ngôi nhà ven biển sang trọng và yên tĩnh trên bờ đảo nguyên sơ, trang bị sẵn kính lặn ngắm san hô và hồ bơi vô cực nhìn ra đại dương.",
    "fullDescription": "Ngôi nhà ven biển sang trọng và yên tĩnh trên bờ đảo hoang sơ được bảo tồn nghiêm ngặt của Côn Đảo, trang bị sẵn kính lặn ngắm san hô và hồ bơi vô cực nhìn ra đại dương.\n\nKhông gian riêng tư tuyệt đối không tiếng ồn xe cộ, chỉ có tiếng thông reo và sóng vỗ. Buổi chiều bạn có thể dạo bước trên bãi cát mịn màng hoặc lặn biển khám phá hệ sinh thái rạn san hô nguyên sơ.",
    "location": "Quần đảo Côn Đảo, Bà Rịa - Vũng Tàu, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "13:30",
    "checkOut": "11:00",
    "policyNote": "Khu vực bảo tồn rùa biển và san hô nghiêm ngặt. Tuyệt đối không xả rác và không chạm tay vào các rạn san hô tự nhiên.",
    "services": [
      "Bộ kính lặn và ống thở chuyên nghiệp",
      "Xe máy miễn phí đi vòng quanh đảo",
      "Dịch vụ trà chiều hoàng hôn",
      "Đón tiễn sân bay Côn Đảo"
    ],
    "bathroom": [
      "Phòng tắm lộ thiên giữa vườn nhiệt đới",
      "Muối tắm biển Côn Đảo",
      "Máy sấy tóc & khăn mềm cao cấp",
      "Dầu gội bồ kết thiên nhiên"
    ]
  },
  "beach-7": {
    "title": "Lan Ha Bay Eco-House (Nhà Sinh Thái Nổi Vịnh Lan Hạ)",
    "description": "Ngôi nhà nổi thanh bình giữa vịnh Lan Hạ êm đềm với cầu nhảy trực tiếp xuống làn nước trong veo, thuyền kayak đáy kính và view núi đá vôi kỳ ảo.",
    "fullDescription": "Ngôi nhà nổi thanh bình giữa vịnh Lan Hạ êm đềm với cầu nhảy trực tiếp xuống làn nước trong veo, thuyền kayak đáy kính và view núi đá vôi kỳ ảo.\n\nTránh xa sự ồn ào của phố thị, du khách sẽ được tận hưởng cảm giác hòa mình trọn vẹn vào thiên nhiên, ngắm nhìn đàn cá bơi lội dưới làn nước và thưởng thức bữa tối hải sản tươi rói do ngư dân địa phương phục vụ.",
    "location": "Vịnh Lan Hạ, Cát Bà, Hải Phòng, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "12:00",
    "checkOut": "10:30",
    "policyNote": "Ca nô trung chuyển đón tại Bến Bèo (Cát Bà) vào lúc 11:30. Khách vui lòng mang theo hành lý gọn nhẹ để di chuyển an toàn trên bè.",
    "services": [
      "Cầu nhảy tắm biển trực tiếp từ bè",
      "Thuyền kayak đôi không giới hạn",
      "Phục vụ cơm hải sản làng chài",
      "Trà sáng đón bình minh vịnh"
    ],
    "bathroom": [
      "Nhà tắm gỗ nước ngọt sinh hoạt",
      "Dầu gội xà phòng hữu cơ tan sinh học",
      "Khăn tắm cotton sạch",
      "Gương soi mini"
    ]
  },
  "beach-8": {
    "title": "Mui Ne Beachside Bungalow (Bungalow Bờ Biển Mũi Né)",
    "description": "Bungalow gỗ mộc mạc sát mép biển gần làng chài Mũi Né, địa điểm lý tưởng để đón ánh bình minh rực rỡ và ngắm nhìn thuyền thúng cập bến.",
    "fullDescription": "Bungalow gỗ mộc mạc sát mép biển gần làng chài Mũi Né, địa điểm lý tưởng để đón ánh bình minh rực rỡ và ngắm nhìn thuyền thúng cập bến mỗi sớm mai.\n\nCăn phòng mang hơi thở truyền thống miền biển với mái lợp lá cọ mát rượi, hiên nhà rộng rợp bóng dừa và chỉ cách đồi cát bay Mũi Né vài phút di chuyển.",
    "location": "Hòn Rơm, Mũi Né, Bình Thuận, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:30",
    "policyNote": "Gần làng chài Mũi Né nên sáng sớm có chợ hải sản họp bờ kè. Khách có thể mua hải sản tươi và nhờ bếp nướng hỗ trợ.",
    "services": [
      "Hỗ trợ thuê xe Jeep ngắm đồi cát",
      "Bếp nướng hải sản ngoài trời",
      "Võng nằm dưới bóng dừa",
      "Cho thuê xe máy tự lái"
    ],
    "bathroom": [
      "Vòi sen nước ấm năng lượng mặt trời",
      "Khăn tắm biển",
      "Đồ vệ sinh cá nhân cơ bản",
      "Gương soi"
    ]
  },
  "beach-9": {
    "title": "My Khe Ocean Apartment (Căn Hộ Biển Mỹ Khê Đà Nẵng)",
    "description": "Căn hộ hiện đại nhìn thẳng ra bãi biển Mỹ Khê - một trong những bờ biển quyến rũ nhất hành tinh, đầy đủ tiện nghi nghỉ dưỡng.",
    "fullDescription": "Căn hộ hiện đại nhìn thẳng ra bãi biển Mỹ Khê - một trong những bờ biển quyến rũ nhất châu Á, nội thất sang trọng và đầy đủ tiện nghi sinh hoạt gia đình.\n\nNằm sát bãi tắm chính, căn hộ có cửa kính lớn chạm trần thu trọn vẻ đẹp của biển xanh và bán đảo Sơn Trà. Phía dưới tòa nhà là hàng loạt nhà hàng hải sản tươi ngon và quán cà phê sầm uất.",
    "location": "Bãi biển Mỹ Khê, Ngũ Hành Sơn, Đà Nẵng, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Tự nhận phòng bằng mã khóa số Smart Lock gửi qua tin nhắn. Cung cấp chỗ đỗ xe ô tô tầng hầm miễn phí.",
    "services": [
      "Khóa cửa thông minh Smart Lock",
      "Máy giặt sấy trong phòng",
      "Bản đồ ẩm thực Đà Nẵng do chủ nhà gợi ý",
      "Bảo vệ tòa nhà 24/24"
    ],
    "bathroom": [
      "2 Phòng tắm đứng vách kính",
      "Máy sấy tóc công suất lớn",
      "Khăn tắm và dép đi trong nhà",
      "Bình nước nóng tự động"
    ]
  },
  "beach-10": {
    "title": "Nha Trang Coral Bay Villa (Biệt Thự Vịnh San Hô Ninh Vân)",
    "description": "Biệt thự nghỉ dưỡng cao cấp ẩn mình tại vịnh Ninh Vân với kiến trúc gỗ tự nhiên mộc mạc, hồ bơi đá và không gian yên tĩnh tuyệt đối.",
    "fullDescription": "Biệt thự nghỉ dưỡng cao cấp ẩn mình tại vịnh Ninh Vân với kiến trúc gỗ tự nhiên mộc mạc, hồ bơi đá và không gian yên tĩnh tuyệt đối bên bờ vịnh biển.\n\nChỉ có thể tiếp cận bằng tàu cao tốc riêng, nơi đây mang đến sự tách biệt hoàn hảo để phục hồi năng lượng. Lặn ngắm san hô ngay trước hiên biệt thự và thưởng thức bữa tối lãng mạn dưới ánh nến ven biển.",
    "location": "Vịnh Ninh Vân, Ninh Hòa, Khánh Hòa, Việt Nam",
    "maxGuests": 8,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policyNote": "Tàu cao tốc đón tiễn riêng từ cảng bến tàu Ninh Vân. Không gian nghỉ dưỡng tĩnh lặng, cấm sử dụng loa kéo công suất lớn.",
    "services": [
      "Quản gia riêng chăm sóc 24/7",
      "Tàu cao tốc đưa đón riêng 2 chiều",
      "Trải nghiệm lặn biển cùng chuyên gia",
      "Bữa sáng nổi trên hồ bơi"
    ],
    "bathroom": [
      "Bồn tắm gỗ thảo mộc ngoài hiên",
      "Vòi sen tắm đôi view vịnh",
      "Mỹ phẩm hữu cơ cao cấp",
      "Áo choàng nhung cao cấp"
    ]
  },
  "mountain-1": {
    "title": "Cloud View Chalet (Nhà Gỗ Mây Ngàn Đà Lạt)",
    "description": "Ngắm nhìn thung lũng mây mờ ảo của Đà Lạt từ căn nhà gỗ tường kính ấm cúng với lò sưởi củi và góc ban công ngắm hoàng hôn 360 độ.",
    "fullDescription": "Ngắm nhìn thung lũng mây mờ ảo của Đà Lạt từ căn nhà gỗ tường kính ấm cúng với lò sưởi củi và góc ban công ngắm hoàng hôn 360 độ giữa đồi thông reo.\n\nVào buổi sáng sớm, bạn có thể thưởng thức ly cà phê Arabica nóng hổi trong khi những dải mây trắng bồng bềnh lướt qua khung cửa sổ. Buổi tối ấm áp bên bếp lửa bập bùng nướng khoai nướng ngô.",
    "location": "Đồi thông Đà Lạt, Lâm Đồng, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Nhiệt độ đồi thông ban đêm có thể xuống 12°C. Nhà có trang bị sẵn nệm sưởi điện và củi sưởi miễn phí.",
    "services": [
      "Cung cấp củi đốt lò sưởi miễn phí",
      "Bếp nướng khoai & bắp nướng ngoài hiên",
      "Xe máy số cho thuê giá ưu đãi",
      "Trà atiso tươi đón tiếp"
    ],
    "bathroom": [
      "Bồn tắm ngâm ngắm thung lũng",
      "Máy nước nóng áp lực mạnh",
      "Máy sấy tóc và khăn len",
      "Xà phòng tinh dầu thông"
    ]
  },
  "mountain-2": {
    "title": "Sapa Terraced Stilt House (Nhà Sàn Ruộng Bậc Thang Sapa)",
    "description": "Nhà sàn gỗ truyền thống bản địa nhìn thẳng ra thung lũng ruộng bậc thang Mường Hoa hùng vĩ và dải sương mù huyền ảo.",
    "fullDescription": "Nhà sàn gỗ truyền thống của đồng bào bản địa nhìn thẳng ra thung lũng ruộng bậc thang Mường Hoa hùng vĩ và những dải sương mù huyền ảo quanh năm.\n\nĐược làm từ gỗ sa mu thơm ngát, căn nhà giữ ấm cực tốt vào mùa đông. Bạn sẽ được thưởng thức đặc sản lẩu cá hồi nóng hổi, rượu ngô ấm nồng và tham gia các cung đường trekking bản làng thú vị.",
    "location": "Thung lũng Mường Hoa, Sa Pa, Lào Cai, Việt Nam",
    "maxGuests": 5,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 2,
    "checkIn": "13:00",
    "checkOut": "11:00",
    "policyNote": "Nhà sàn gỗ người Giáy truyền thống, vui lòng tháo giày dép trước khi bước lên sàn gỗ. Có phục vụ lẩu cá hồi Tây Bắc theo yêu cầu.",
    "services": [
      "Hướng dẫn viên bản địa dẫn trekking bản Tả Van",
      "Đặt tiệc lẩu cá hồi & gà đồi Tây Bắc",
      "Tắm lá thuốc người Dao đỏ",
      "Cho thuê trang phục dân tộc"
    ],
    "bathroom": [
      "Thùng tắm gỗ pơ-mu lá thuốc Dao đỏ",
      "Nước nóng 24/24",
      "Khăn ấm thảo mộc",
      "Gương gỗ soi mặt"
    ]
  },
  "mountain-3": {
    "title": "Ba Na Pine Chalet (Biệt Thự Gỗ Rừng Thông Bà Nà)",
    "description": "Căn nhà gỗ ấm cúng nép mình giữa rừng thông bạt ngàn mát lạnh của đỉnh Bà Nà, sở hữu lò sưởi trong nhà và ban công gỗ ngắm mây trôi.",
    "fullDescription": "Căn nhà gỗ ấm cúng nép mình giữa rừng thông bạt ngàn mát lạnh của đỉnh Bà Nà, sở hữu lò sưởi trong nhà và ban công gỗ ngắm mây trôi bềnh bồng.\n\nKhông khí quanh năm trong lành mát mẻ tựa như một góc châu Âu thu nhỏ. Bạn có thể dễ dàng ghé thăm Cầu Vàng nổi tiếng thế giới và làng Pháp chỉ trong ít phút di chuyển.",
    "location": "Đỉnh Bà Nà Hills, Hòa Vang, Đà Nẵng, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "11:00",
    "policyNote": "Thời tiết đỉnh núi thay đổi 4 mùa trong ngày. Vui lòng mang theo áo khoác ấm khi ra ban công ban đêm.",
    "services": [
      "Lò sưởi củi ấm cúng trong phòng khách",
      "Cung cấp áo ấm choàng đi dạo",
      "Hỗ trợ đặt vé Cáp treo Bà Nà",
      "Phục vụ điểm tâm sáng"
    ],
    "bathroom": [
      "Phòng tắm ốp đá tự nhiên ấm áp",
      "Hệ thống sưởi phòng tắm",
      "Đồ vệ sinh cá nhân cao cấp",
      "Khăn tắm lớn dày dặn"
    ]
  },
  "mountain-4": {
    "title": "Ha Giang Rocky Plateau (Nhà Pháo Đài Đá Đồng Văn Hà Giang)",
    "description": "Ngôi nhà pháo đài đá truyền thống độc đáo của người H’Mông giữa những rặng núi đá tai mèo hùng vĩ của cao nguyên Đồng Văn.",
    "fullDescription": "Ngôi nhà pháo đài đá truyền thống độc đáo của người H’Mông tọa lạc giữa những rặng núi đá tai mèo hùng vĩ kỳ vĩ của cao nguyên Đồng Văn.\n\nTường trình đất dày kết hợp xếp đá thủ công giúp căn nhà mát rượi vào mùa hè và ấm áp giữa mùa đông giá rét. Khởi đầu hoàn hảo cho hành trình chinh phục đèo Mã Pí Lèng và dòng sông Nho Quế.",
    "location": "Cao nguyên đá Đồng Văn, Hà Giang, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 2,
    "checkIn": "13:30",
    "checkOut": "11:00",
    "policyNote": "Nhà trình tường đất nện dày giữ nhiệt tuyệt đối. Nằm cạnh trục đường đi Mã Pí Lèng, có sân đỗ cho đoàn xe máy phượt.",
    "services": [
      "Bữa tối lẩu gà đen và rượu ngô men lá",
      "Gara sửa chữa và bảo dưỡng xe máy",
      "Bản đồ phượt Mã Pí Lèng - Sông Nho Quế",
      "Cho thuê xe máy chuyên phượt"
    ],
    "bathroom": [
      "Bình nước nóng công suất lớn",
      "Khăn tắm bông dày",
      "Dép đi trong nhà ấm chân",
      "Đồ dùng vệ sinh"
    ]
  },
  "mountain-5": {
    "title": "Da Lat Pine Treehouse (Nhà Trên Cây Rừng Thông Trại Mát)",
    "description": "Ngôi nhà trên cây bằng gỗ mộc mạc dựng giữa những tán thông cổ thụ, mở ra tầm nhìn toàn cảnh thung lũng hoa và bầu trời đầy sao lấp lánh.",
    "fullDescription": "Ngôi nhà trên cây bằng gỗ mộc mạc dựng giữa những tán thông cổ thụ tại Trại Mát, mở ra tầm nhìn toàn cảnh thung lũng hoa và bầu trời đêm lấp lánh ánh đèn lồng.\n\nThiết kế sáng tạo với cầu thang gỗ uốn lượn, xích đu trên mây và võng lưới ngoài trời để bạn thỏa sức chụp những bức hình kỷ niệm đậm chất thơ Đà Lạt.",
    "location": "Trại Mát, TP. Đà Lạt, Lâm Đồng, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhà trên cây cách mặt đất 4m, có cầu thang gỗ an toàn. Vui lòng không bước ra ngoài khu vực lưới an toàn ban đêm.",
    "services": [
      "Võng lưới ngắm biển mây Trại Mát",
      "Trà atiso tươi nóng mỗi sáng",
      "Góc chụp ảnh check-in sống ảo",
      "Bếp nướng BBQ ngoài hiên"
    ],
    "bathroom": [
      "Buồng tắm đứng vách kính nhìn ra đồi thông",
      "Bình nóng lạnh 30L",
      "Khăn tắm thơm mùi tinh dầu",
      "Máy sấy tóc"
    ]
  },
  "mountain-6": {
    "title": "Tam Dao Misty Villa (Biệt Thự Trong Sương Tam Đảo)",
    "description": "Biệt thự phong cách châu Âu giữa thị trấn mờ sương Tam Đảo, ngắm nhìn biển mây bồng bềnh và đỉnh tháp truyền hình sừng sững.",
    "fullDescription": "Biệt thự phong cách châu Âu giữa thị trấn mờ sương Tam Đảo, ngắm nhìn biển mây bồng bềnh và đỉnh tháp truyền hình sừng sững trong sương mờ.\n\nSân thượng rộng rãi thích hợp tổ chức tiệc BBQ ngoài trời se lạnh. Không gian phòng khách có cửa kính panorama đón trọn ánh nắng ban mai và sương mù lãng đãng.",
    "location": "Thị trấn Tam Đảo, Vĩnh Phúc, Việt Nam",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Được phép tổ chức tiệc BBQ sân thượng đến 22:30. Cho phép mang thú cưng nhỏ (có phụ phí dọn dẹp nhẹ).",
    "services": [
      "Bếp nướng BBQ sân thượng view mây",
      "Loa bluetooth giải trí nhẹ nhàng",
      "Bàn bi lắc cho trẻ em",
      "Đỗ xe ô tô 7 chỗ miễn phí"
    ],
    "bathroom": [
      "3 Phòng tắm nước nóng riêng từng tầng",
      "Máy sấy tóc",
      "Bộ vệ sinh cá nhân",
      "Khăn tắm kháng khuẩn"
    ]
  },
  "mountain-7": {
    "title": "Bach Ma Forest Lodge (Lodge Rừng Nguyên Sinh Bạch Mã)",
    "description": "Khu nghỉ dưỡng gỗ biệt lập sâu trong rừng nguyên sinh núi Bạch Mã, nơi bạn được hít thở bầu không khí tinh khiết và tắm thác nước tự nhiên.",
    "fullDescription": "Khu nghỉ dưỡng gỗ biệt lập sâu trong rừng nguyên sinh núi Bạch Mã, nơi bạn được hít thở bầu không khí tinh khiết và lắng nghe bản hòa ca của muôn loài chim rừng.\n\nVị trí tuyệt đẹp gần Ngũ Hồ và Thác Đỗ Quyên hùng tráng, là nơi ẩn náu hoàn hảo để tái tạo năng lượng thể chất và tinh thần.",
    "location": "Vườn quốc gia Bạch Mã, Thừa Thiên Huế, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:00",
    "policyNote": "Nằm trong vùng lõi vườn quốc gia Bạch Mã. Không săn bắt hay hái lan rừng, giữ gìn môi trường sinh thái nguyên sơ.",
    "services": [
      "Hướng dẫn viên khám phá Thác Đỗ Quyên & Ngũ Hồ",
      "Ống nhòm ngắm chim rừng Bạch Mã",
      "Bữa ăn thực dưỡng rau củ sạch",
      "Đốt lửa trại sinh hoạt chung"
    ],
    "bathroom": [
      "Phòng tắm nước suối khoáng tự nhiên",
      "Nước nóng năng lượng mặt trời",
      "Xà phòng quế hữu cơ",
      "Khăn tắm cotton"
    ]
  },
  "mountain-8": {
    "title": "Mu Cang Chai Haven (Homestay Mâm Xôi Mù Cang Chải)",
    "description": "Homestay nằm ngay cạnh đồi Mâm Xôi trứ danh, điểm dừng chân lý tưởng nhất để ngắm trọn mùa lúa chín vàng óng ả bậc nhất Tây Bắc.",
    "fullDescription": "Homestay nằm ngay cạnh đồi Mâm Xôi trứ danh, điểm dừng chân lý tưởng nhất để ngắm trọn mùa lúa chín vàng óng ả rực rỡ bậc nhất Tây Bắc.\n\nĐược xây dựng theo kiến trúc nhà gỗ truyền thống người Thái, phục vụ những món ăn dân dã đặc sản vùng cao như gà đồi nướng mác khén, xôi nếp nương thơm dẻo.",
    "location": "Mù Cang Chải, Yên Bái, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "12:00",
    "checkOut": "11:00",
    "policyNote": "Ngay cạnh đồi Mâm Xôi, mùa lúa chín tháng 9-10 lượng khách đông, vui lòng thông báo trước giờ ăn cơm với chủ nhà.",
    "services": [
      "Cho thuê trang phục dân tộc H’Mông chụp ảnh",
      "Cho thuê xe máy cào cào vượt dốc",
      "Bữa tối xôi nếp nương và gà đồi",
      "Hướng dẫn điểm săn ảnh đẹp"
    ],
    "bathroom": [
      "Phòng tắm nước nóng sạch sẽ",
      "Dầu gội bồ kết truyền thống",
      "Khăn tắm cá nhân",
      "Gương soi"
    ]
  },
  "mountain-9": {
    "title": "Pu Luong Nature Bungalow (Bungalow Sinh Thái Pù Luông)",
    "description": "Quần thể bungalow tre mộc mạc nhìn ra thung lũng Pù Luông thanh bình, sở hữu hồ bơi dẫn nước nguồn tự nhiên mát rượi quanh năm.",
    "fullDescription": "Quần thể bungalow tre mộc mạc nhìn ra thung lũng Pù Luông thanh bình, sở hữu hồ bơi dẫn nước suối nguồn tự nhiên mát rượi quanh năm.\n\nTừng căn bungalow đều có ban công hướng ra ruộng bậc thang xanh ngát và những guồng nước khổng lồ quay đều bên dòng suối hiền hòa.",
    "location": "Khu bảo tồn Pù Luông, Bá Thước, Thanh Hóa, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Bungalow tre lợp cọ sinh thái, ban công view trực diện ruộng bậc thang bản Đôn. Vui lòng đóng cửa lưới chống muỗi khi bật đèn tối.",
    "services": [
      "Hồ bơi vô cực dẫn nước suối tự nhiên",
      "Xe đạp địa hình miễn phí dạo bản",
      "Tour chèo bè tre trên sông Mã",
      "Bữa sáng cơm lam thịt nướng"
    ],
    "bathroom": [
      "Bồn tắm bằng đá ngắm ruộng lúa",
      "Vòi sen tắm hoa sen ngoài trời",
      "Khăn tắm mềm",
      "Đồ vệ sinh cá nhân hữu cơ"
    ]
  },
  "mountain-10": {
    "title": "Y Ty Cloud Cottage (Nhà Trình Tường Săn Mây Y Tý)",
    "description": "Điểm săn mây trứ danh quanh năm với kiến trúc nhà trình tường đất dày giữ ấm tuyệt vời của đồng bào Hà Nhì vùng biên cương.",
    "fullDescription": "Điểm săn mây trứ danh quanh năm với kiến trúc nhà trình tường đất nện dày độc đáo của đồng bào Hà Nhì, giữ ấm tuyệt vời giữa biển mây bạt ngàn.\n\nVào mùa lúa chín hoặc mùa mây cuộn sóng, bạn chỉ cần mở then cửa sổ là thấy mây luồn vào tận giường ngủ, tạo nên cảm giác bồng bềnh tựa chốn bồng lai.",
    "location": "Y Tý, Bát Xát, Lào Cai, Việt Nam",
    "maxGuests": 5,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 1,
    "checkIn": "12:30",
    "checkOut": "10:30",
    "policyNote": "Độ cao trên 2000m, mây tràn vào hiên sáng sớm. Nhà trình tường truyền thống nắp rơm giữ ấm tuyệt đối.",
    "services": [
      "Bếp lửa sưởi trung tâm nhà",
      "Nước trà táo mèo nóng uống tự do",
      "Tư vấn điểm săn mây Choản Thèn đẹp nhất",
      "Phục vụ bữa cơm gia đình vùng cao"
    ],
    "bathroom": [
      "Thùng tắm nước nóng lá rừng",
      "Khăn tắm ấm",
      "Đồ dùng vệ sinh cơ bản",
      "Gương soi"
    ]
  },
  "camping-1": {
    "title": "Phong Nha Jungle Camp (Glamping Rừng Hang Động Phong Nha)",
    "description": "Trải nghiệm glamping sang trọng nằm ngay gần cửa ngõ hệ thống hang động và dòng sông ngầm kỳ quan Vườn quốc gia Phong Nha - Kẻ Bàng.",
    "fullDescription": "Trải nghiệm cắm trại glamping sang trọng nằm ngay gần cửa ngõ hệ thống hang động và dòng sông ngầm kỳ quan thế giới Vườn quốc gia Phong Nha - Kẻ Bàng.\n\nLều trại canvas cao cấp có điều hòa không khí, giường nệm êm ái, khu lửa trại nướng thịt và các tour thám hiểm chèo thuyền kayak trên sông Son thơ mộng.",
    "location": "Vườn quốc gia Phong Nha - Kẻ Bàng, Quảng Bình, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "11:00",
    "policyNote": "Lều canvas chống nước trang bị điều hòa 2 chiều. Tuyệt đối không đốt lửa ngoài khu vực bếp trại đã quy định.",
    "services": [
      "Bếp lửa trại ngắm sao ban đêm",
      "Thuyền kayak chèo sông Son",
      "Set nướng s’mores và khoai nướng",
      "Tour thám hiểm hang Tối"
    ],
    "bathroom": [
      "Nhà tắm ngoài trời vòi sen nóng lạnh",
      "Khăn tắm và dầu gội tràm gió chống muỗi",
      "Máy sấy tóc",
      "Dép đi trong lều"
    ]
  },
  "camping-2": {
    "title": "Mui Ne Dune Dome (Mái Vòm Glamping Đồi Cát Mũi Né)",
    "description": "Mái vòm glamping độc đáo giữa đồi cát sa mạc với tầm nhìn ngắm sao đêm huyền ảo và nội thất bohemian lãng mạn.",
    "fullDescription": "Mái vòm glamping độc đáo giữa đồi cát đỏ và cát trắng với tầm nhìn ngắm sao đêm sa mạc và nội thất bohemian ấm cúng, lãng mạn.\n\nTrải nghiệm đón bình minh ngoạn mục trên sa mạc cát ven biển, lái xe địa hình vượt cồn cát và thưởng thức tiệc nướng BBQ bên bếp lửa lung linh.",
    "location": "Đồi cát Mũi Né, Phan Thiết, Bình Thuận, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "15:00",
    "checkOut": "11:00",
    "policyNote": "Mái vòm ngắm sao có kính thiên văn và máy lạnh. Vui lòng tắt đèn ngoại thất sau 22:30 để chiêm ngưỡng dải ngân hà Milky Way.",
    "services": [
      "Kính thiên văn ngắm sao chuyên dụng",
      "Tour xe Jeep đón bình minh đồi cát trắng",
      "Tiệc BBQ sa mạc lãng mạn",
      "Máy điều hòa mát lạnh"
    ],
    "bathroom": [
      "Buồng tắm riêng biệt khép kín",
      "Nước nóng áp lực cao",
      "Bộ đồ vệ sinh du lịch",
      "Khăn tắm mềm mại"
    ]
  },
  "camping-3": {
    "title": "Nha Trang Island Camp (Glamping Đảo Vịnh Nha Phu)",
    "description": "Khu lều chuông glamping ven biển trên hòn đảo yên tĩnh với làn nước trong vắt nhìn thấy đáy, đêm tiệc BBQ lửa trại sôi động.",
    "fullDescription": "Khu lều chuông glamping ven biển trên hòn đảo yên tĩnh của vịnh Nha Phu với làn nước trong vắt nhìn thấy đáy cùng những đêm tiệc BBQ lửa trại sôi động.\n\nTách biệt khỏi đất liền, bạn sẽ được tận hưởng không gian biển riêng tư, lặn ngắm san hô và nghe tiếng đàn guitar bập bùng bên bờ sóng.",
    "location": "Vịnh Nha Phu, Ninh Hòa, Khánh Hòa, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:30",
    "checkOut": "11:00",
    "policyNote": "Tàu đón khách tại cảng Đá Chồng lúc 13:00. Bãi biển riêng tư, không tiếp khách vãng lai sau 18:00.",
    "services": [
      "Tiệc nướng BBQ hải sản bãi biển",
      "Lửa trại đàn hát acoustic buổi tối",
      "Bộ dụng cụ chèo SUP và lặn ngắm cá",
      "Tàu cano đưa đón đảo"
    ],
    "bathroom": [
      "Khu vệ sinh nhà tắm riêng sạch bóng",
      "Vòi sen tắm hoa sen ngoài trời",
      "Khăn tắm biển",
      "Xà phòng hữu cơ"
    ]
  },
  "camping-4": {
    "title": "Tuyen Lam Lake Camp (Glamping Hồ Tuyền Lâm Đà Lạt)",
    "description": "Khu cắm trại nghỉ dưỡng cao cấp bên hồ Tuyền Lâm thơ mộng, trải nghiệm chèo thuyền SUP sáng sớm và đốt lửa trại quây quần sưởi ấm.",
    "fullDescription": "Khu cắm trại nghỉ dưỡng cao cấp bên bờ hồ Tuyền Lâm thơ mộng, trải nghiệm chèo thuyền SUP đón sương sớm và quây quần bên đống lửa sưởi ấm trong cái lạnh se se của Đà Lạt.\n\nLều trang bị nệm ấm, chăn điện, nhà tắm riêng biệt sạch sẽ và phục vụ bữa tiệc nướng BBQ thịt rừng cùng rượu vang thơm nồng.",
    "location": "Hồ Tuyền Lâm, TP. Đà Lạt, Lâm Đồng, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:30",
    "checkOut": "11:30",
    "policyNote": "Trại ven bờ hồ Tuyền Lâm, buổi tối se lạnh 14°C. Trang bị sẵn chăn nệm điện sưởi ấm bên trong lều.",
    "services": [
      "Chèo SUP đón bình minh hồ Tuyền Lâm",
      "Bếp nướng BBQ bò tơ Tây Nguyên",
      "Rượu vang Đà Lạt ấm cúng",
      "Lửa trại quây quần ban đêm"
    ],
    "bathroom": [
      "Nhà tắm kính riêng biệt có nước nóng",
      "Máy sấy tóc",
      "Khăn tắm bông ấm",
      "Bộ vệ sinh cá nhân cao cấp"
    ]
  },
  "camping-5": {
    "title": "Madagui Forest Hub (Cắm Trại Khám Phá Rừng Madagui)",
    "description": "Hòa mình vào thiên nhiên rừng nhiệt đới nguyên sinh với hàng loạt hoạt động thể thao mạo hiểm ngoài trời đầy phấn khích.",
    "fullDescription": "Hòa mình vào thiên nhiên rừng nhiệt đới nguyên sinh Madagui với hàng loạt hoạt động thể thao mạo hiểm ngoài trời như đu dây zipline, chèo bè vượt ghềnh thác và bắn súng sơn.\n\nKhu lều trại ẩn mình dưới bóng cây râm mát, có suối nước chảy róc rách và thảm cỏ xanh êm ái cho các buổi dã ngoại.",
    "location": "Madagui, Đạ Huoai, Lâm Đồng, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Khu cắm trại dã ngoại thể thao rừng nhiệt đới. Tuân thủ hướng dẫn an toàn của huấn luyện viên khi tham gia zipline và leo núi.",
    "services": [
      "Vé chơi chèo bè vượt thác ghềnh",
      "Hướng dẫn viên sinh tồn trong rừng",
      "Khu tiệc nướng BBQ ngoài trời",
      "Lều bạt dã ngoại chống muỗi"
    ],
    "bathroom": [
      "Khu tắm nóng lạnh tiện nghi",
      "Khăn tắm dã ngoại",
      "Xà phòng sinh học",
      "Gương treo ngoài trời"
    ]
  },
  "camping-6": {
    "title": "Soc Son Pine Glamping (Cắm Trại Rừng Thông Sóc Sơn)",
    "description": "Khu cắm trại glamping dưới tán rừng thông xanh ngát, điểm đến lý tưởng chỉ cách trung tâm thủ đô Hà Nội chưa đầy một giờ lái xe.",
    "fullDescription": "Khu cắm trại glamping dưới tán rừng thông xanh ngát, điểm đến nghỉ dưỡng cuối tuần lý tưởng chỉ cách trung tâm thủ đô Hà Nội chưa đầy một giờ lái xe.\n\nKhông gian rộng lớn ven hồ nước trong lành, thích hợp cho nhóm bạn hoặc gia đình tụ họp, tổ chức tiệc BBQ ngoài trời và ngắm sao đêm.",
    "location": "Sóc Sơn, Hà Nội, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Thích hợp cho gia đình có trẻ nhỏ. Không mang loa thùng công suất lớn để giữ không gian yên tĩnh thư giãn.",
    "services": [
      "Sân chơi cỏ tự nhiên cho trẻ em",
      "Bếp nướng than hoa ngoài trời",
      "Cho thuê cần câu cá ven hồ",
      "Đốt lửa trại buổi tối"
    ],
    "bathroom": [
      "Nhà tắm khép kín vòi sen nóng lạnh",
      "Máy sấy tóc",
      "Bộ vệ sinh cá nhân",
      "Khăn tắm sạch"
    ]
  },
  "camping-7": {
    "title": "Cat Tien Safari Camp (Cắm Trại Thám Hiểm Rừng Cát Tiên)",
    "description": "Trải nghiệm cắm trại khám phá đời sống động vật hoang dã với tour xe Jeep xem thú đêm độc đáo ngay trong Vườn quốc gia Cát Tiên.",
    "fullDescription": "Trải nghiệm cắm trại khám phá đời sống động vật hoang dã với tour xe Jeep xem thú đêm độc đáo ngay trong Vườn quốc gia Cát Tiên.\n\nTận hưởng không khí rừng già tinh khiết, đạp xe qua những tán cây cổ thụ hàng trăm năm tuổi và ngắm nhìn các loài bướm rừng rực rỡ sắc màu.",
    "location": "Vườn quốc gia Cát Tiên, Tân Phú, Đồng Nai, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:00",
    "policyNote": "Vườn quốc gia Cát Tiên, xe Jeep xem thú đêm xuất phát lúc 19:30. Yêu cầu giữ im lặng tuyệt đối khi xem thú rừng.",
    "services": [
      "Tour xe Jeep ban đêm xem hươu, nai hoang dã",
      "Xe đạp leo núi khám phá Bàu Sấu",
      "Bữa tối ẩm thực rừng Nam Bộ",
      "Ống nhòm chuyên dụng quan sát chim"
    ],
    "bathroom": [
      "Phòng tắm vòi sen sạch sẽ",
      "Kem bôi chống muỗi và vắt rừng",
      "Khăn tắm sạch",
      "Xà phòng"
    ]
  },
  "camping-8": {
    "title": "Co To Island Camp (Cắm Trại Bãi Biển Đảo Cô Tô)",
    "description": "Cắm trại ngay cạnh bờ cát trắng mịn của bãi tắm Hồng Vàn hoang sơ, tận hưởng làn gió biển mát lành và bữa tiệc hải sản tươi sống.",
    "fullDescription": "Cắm trại ngay cạnh bờ cát trắng mịn của bãi tắm Hồng Vàn hoang sơ trên đảo Cô Tô, tận hưởng làn gió biển mát lành và bữa tiệc hải sản tươi sống nướng ngay trên bờ biển.\n\nNước biển trong xanh êm ả không sóng lớn, rất thích hợp tắm biển, chèo thuyền kayak và ngắm bình minh trên biển Đông.",
    "location": "Bãi biển Hồng Vàn, Đảo Cô Tô, Quảng Ninh, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "13:30",
    "checkOut": "11:00",
    "policyNote": "Lều trại trên bãi cát biển Hồng Vàn. Có sẵn ổ cắm sạc điện và quạt gió trong lều. Đón bình minh tuyệt đẹp ngay cửa lều.",
    "services": [
      "Bữa tiệc BBQ mực một nắng và ốc móng tay",
      "Thuyền kayak dạo biển sáng sớm",
      "Đốt lửa trại bãi biển",
      "Thuê xe máy đi ngọn hải đăng Cô Tô"
    ],
    "bathroom": [
      "Khu nhà tắm nước ngọt tráng người sau tắm biển",
      "Khăn tắm lớn",
      "Xà phòng thiên nhiên",
      "Gương soi mini"
    ]
  },
  "camping-9": {
    "title": "Bau Trang Desert Camp (Cắm Trại Sa Mạc Bàu Trắng)",
    "description": "Trải nghiệm cắm trại ngắm sao sa mạc và đón bình minh huyền ảo bên cạnh hồ nước ngọt ốc đảo xanh giữa muôn trùng đồi cát trắng.",
    "fullDescription": "Trải nghiệm cắm trại ngắm sao sa mạc và đón bình minh huyền ảo bên cạnh hồ nước ngọt ốc đảo sen thơm mát giữa muôn trùng đồi cát Bàu Trắng.\n\nBan đêm ngắm nhìn dải ngân hà Milky Way rực rỡ, ban ngày lướt ván cát và vi vu trên những chiếc xe Jeep vượt địa hình phấn khích.",
    "location": "Bàu Trắng, Bắc Bình, Bình Thuận, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "15:30",
    "checkOut": "11:00",
    "policyNote": "Cắm trại ốc đảo hồ sen Bàu Trắng. Không xả rác ra cồn cát, giữ gìn cảnh quan thiên nhiên hoang sơ.",
    "services": [
      "Trải nghiệm lái xe địa hình ATV trên cát",
      "Chèo thuyền SUP ngắm hoa sen hồ Bàu Trắng",
      "Ngắm sao sa mạc",
      "Bữa tối BBQ thịt cừu nướng"
    ],
    "bathroom": [
      "Nhà tắm nước máy sạch sẽ",
      "Khăn tắm",
      "Đồ dùng vệ sinh cá nhân",
      "Gương soi"
    ]
  },
  "camping-10": {
    "title": "Ba Be Riverside Camp (Cắm Trại Bờ Hồ Ba Bể Bắc Kạn)",
    "description": "Cắm trại ven bờ hồ nước ngọt tự nhiên lớn nhất Việt Nam, khám phá hang động kỳ bí bằng thuyền độc mộc và thưởng thức cá hồ nướng than.",
    "fullDescription": "Cắm trại ven bờ hồ nước ngọt tự nhiên lớn nhất Việt Nam giữa lòng vườn quốc gia Ba Bể, khám phá các hòn đảo đá vôi và hang động kỳ vĩ bằng thuyền độc mộc truyền thống.\n\nBuổi chiều ngắm hoàng hôn buông trên mặt hồ phẳng lặng như gương soi, tối thưởng thức cá nướng thơm lừng và tôm hồ ngọt lịm.",
    "location": "Hồ Ba Bể, Nam Mẫu, Ba Bể, Bắc Kạn, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:00",
    "policyNote": "Trại ven hồ Ba Bể nguyên sơ. Áo phao cứu sinh được cấp phát miễn phí khi lên bè độc mộc dạo hồ.",
    "services": [
      "Thuyền độc mộc khám phá đảo Bà Góa",
      "Bữa tối cá hồ nướng và tôm chua Ba Bể",
      "Đốt lửa trại ven hồ",
      "Câu cá hồ tự nhiên"
    ],
    "bathroom": [
      "Nhà vệ sinh và phòng tắm nước nóng đầy đủ",
      "Khăn tắm",
      "Xà phòng thơm",
      "Gương soi"
    ]
  },
  "city-1": {
    "title": "Skyline Penthouse Loft (Penthouse View Thành Phố Quận 1)",
    "description": "Căn hộ áp mái bằng kính hiện đại ngay trung tâm Quận 1 với hồ bơi vô cực trên tầng thượng ngắm trọn vẹn đường chân trời thành phố.",
    "fullDescription": "Căn hộ áp mái bằng kính hiện đại ngay trung tâm Quận 1 sôi động với hồ bơi vô cực trên tầng thượng ngắm trọn vẹn đường chân trời thành phố lung linh ánh đèn đêm.\n\nThiết kế sang trọng với nội thất nhập khẩu, trần cao thoáng đãng và kính tràn viền view Landmark 81 cùng sông Sài Gòn thơ mộng.",
    "location": "Quận 1, TP. Hồ Chí Minh, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng bằng mật mã cửa Smart Lock và thẻ thang máy riêng. Cấm tổ chức tiệc quá 8 người và không hút thuốc trong nhà.",
    "services": [
      "Hồ bơi vô cực tầng mái view toàn cảnh TP",
      "Tự nhận phòng Smart Lock 24/7",
      "Phòng tập gym cao cấp tầng lửng",
      "Chỗ đỗ xe ô tô tầng hầm"
    ],
    "bathroom": [
      "Bồn tắm ngâm view Landmark 81",
      "Buồng tắm kính đứng vòi sen trần",
      "Máy sấy tóc Dyson & áo choàng",
      "Mỹ phẩm phòng tắm cao cấp"
    ]
  },
  "city-2": {
    "title": "Hanoi Old Quarter Loft (Căn Hộ Nghệ Thuật Phố Cổ Hà Nội)",
    "description": "Căn hộ vintage ấm cúng mang phong cách cổ điển Pháp trong tòa nhà cổ, cách Hồ Hoàn Kiếm và Chợ Đồng Xuân vài bước chân dạo bộ.",
    "fullDescription": "Căn hộ vintage ấm cúng mang phong cách cổ điển Pháp tọa lạc trong tòa nhà cổ kính, chỉ cách Hồ Hoàn Kiếm và Chợ Đồng Xuân vài bước chân dạo bộ.\n\nSàn gạch hoa cổ, tường gạch trần mộc mạc và góc ban công nhỏ rợp bóng hoa giấy nhìn xuống con ngõ nhỏ đặc trưng của 36 phố phường Hà Nội.",
    "location": "Quận Hoàn Kiếm, TP. Hà Nội, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:30",
    "checkOut": "11:30",
    "policyNote": "Tòa nhà kiến trúc Pháp cổ trong ngõ phố cổ Hoàn Kiếm. Cổng chung đóng lúc 23:30 (khách có chìa khóa riêng ra vào 24/7).",
    "services": [
      "Máy pha cà phê pha phin truyền thống",
      "Bản đồ 36 phố phường ẩm thực bỏ túi",
      "Dịch vụ giặt ủi lấy nhanh",
      "Trà sen Tây Hồ mời khách"
    ],
    "bathroom": [
      "Phòng tắm gạch bông hoài niệm",
      "Nước nóng tức thì",
      "Đồ vệ sinh cá nhân đầy đủ",
      "Máy sấy tóc mini"
    ]
  },
  "city-3": {
    "title": "Saigon Heritage Studio (Studio Di Sản Sài Gòn Quận 3)",
    "description": "Căn hộ studio mang âm hưởng Indochine Đông Dương giao thoa nghệ thuật bản địa, sàn gạch hoa cổ điển và ban công cây xanh mướt.",
    "fullDescription": "Căn hộ studio mang âm hưởng Indochine Đông Dương giao thoa nghệ thuật bản địa, sàn gạch hoa cổ điển và ban công cây xanh mướt mát giữa lòng Quận 3 yên tĩnh.\n\nNằm trong khu vực có nhiều biệt thự Pháp cổ kính, gần hồ Con Rùa và hàng loạt quán cà phê nghệ thuật nổi tiếng.",
    "location": "Quận 3, TP. Hồ Chí Minh, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Khu biệt thự Pháp cổ yên tĩnh đường Tú Xương. Giữ yên tĩnh chung sau 22:00 để cư dân xung quanh nghỉ ngơi.",
    "services": [
      "Ban công cây xanh uống trà chiều",
      "Smart TV 55 inch Netflix 4K",
      "Chỗ đỗ xe máy an ninh miễn phí",
      "Máy giặt trong phòng"
    ],
    "bathroom": [
      "Phòng tắm vòi sen đứng kính",
      "Khăn tắm mềm mại",
      "Dầu gội sữa tắm thảo mộc",
      "Gương led tròn"
    ]
  },
  "city-4": {
    "title": "Saigon Art Deco Suite (Căn Hộ Cổ Điển Quận 1)",
    "description": "Căn hộ mang nét quyến rũ lịch sử trong một tòa nhà Sài Gòn xưa với trần cao thoáng đãng, gạch lát họa tiết tinh tế và tiện nghi cao cấp.",
    "fullDescription": "Căn hộ mang nét quyến rũ lịch sử trong một tòa nhà Sài Gòn xưa với trần cao thoáng đãng, gạch lát họa tiết tinh tế và tiện nghi sinh hoạt hiện đại, cao cấp.\n\nĐịa điểm hoàn hảo để khám phá ẩm thực đường phố Sài Gòn, phố đi bộ Nguyễn Huệ và Nhà hát Thành phố.",
    "location": "Quận 1, TP. Hồ Chí Minh, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Căn hộ chung cư phong cách Art Deco phố đi bộ Nguyễn Huệ. Thang máy cổ điển hoạt động 24/7 có bảo vệ tòa nhà.",
    "services": [
      "Tự check-in tiện lợi bằng hộp khóa số",
      "Bếp đầy đủ gia vị nấu ăn",
      "Trà và cà phê rang xay miễn phí",
      "Wifi tốc độ 300Mbps"
    ],
    "bathroom": [
      "Bồn tắm kiểu cổ điển",
      "Vòi sen nóng lạnh",
      "Bàn ủi hơi nước và máy sấy tóc",
      "Khăn tắm cotton cao cấp"
    ]
  },
  "city-5": {
    "title": "Da Nang Han River Condo (Căn Hộ View Sông Hàn Đà Nẵng)",
    "description": "Căn hộ cao cấp nhìn thẳng ra dòng sông Hàn thơ mộng và những cây cầu biểu tượng rực rỡ sắc màu về đêm (Cầu Rồng, Cầu Quay).",
    "fullDescription": "Căn hộ cao cấp nhìn thẳng ra dòng sông Hàn thơ mộng và những cây cầu biểu tượng rực rỡ sắc màu về đêm, đặc biệt là vị trí vàng ngắm Cầu Rồng phun lửa và phun nước cuối tuần.\n\nNội thất trang nhã, hồ bơi tràn bờ tòa nhà và quầy sky lounge đẳng cấp.",
    "location": "Quận Hải Châu, TP. Đà Nẵng, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "View trực diện Cầu Rồng phun lửa lúc 21:00 thứ Bảy & Chủ Nhật. Cung cấp thẻ thang máy bảo mật từng tầng.",
    "services": [
      "Hồ bơi tràn bờ view sông Hàn",
      "Chỗ đỗ xe ô tô miễn phí tại hầm",
      "Lễ tân hỗ trợ 24/7",
      "Phòng tập thể hình tòa nhà"
    ],
    "bathroom": [
      "2 Phòng tắm đầy đủ tiện nghi",
      "Vòi sen áp lực cao",
      "Đồ vệ sinh cá nhân cao cấp",
      "Máy sấy tóc"
    ]
  },
  "city-6": {
    "title": "Hanoi West Lake Sunset (Căn Hộ Hoàng Hôn Hồ Tây Hà Nội)",
    "description": "Căn hộ lãng mạn ngập tràn gió hồ ngay sát bờ Hồ Tây, không gian tuyệt hảo để ngắm hoàng hôn ráng vàng buông xuống mặt nước mênh mông.",
    "fullDescription": "Căn hộ lãng mạn ngập tràn gió hồ ngay sát bờ Hồ Tây, không gian tuyệt hảo để ngắm hoàng hôn ráng vàng buông xuống mặt nước mênh mông.\n\nKhu vực Tây Hồ yên tĩnh, nhiều nhà hàng ẩm thực quốc tế, tiệm bánh Pháp và đường dạo bộ ven hồ trong lành.",
    "location": "Quận Tây Hồ, TP. Hà Nội, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:30",
    "policyNote": "Tòa nhà căn hộ ven bờ hồ Quảng Bá. Cửa sổ kính lớn chạm sàn ngắm hoàng hôn hồ Tây. Cho phép thú cưng nhỏ ngoan.",
    "services": [
      "Ban công ngắm trọn hoàng hôn Hồ Tây",
      "Máy giặt và máy sấy trong phòng",
      "Bếp nướng điện mini",
      "Xe đạp dạo quanh hồ miễn phí"
    ],
    "bathroom": [
      "Bồn tắm nằm ngắm hồ",
      "Máy sấy tóc",
      "Khăn tắm dày",
      "Dầu gội sữa tắm hương hoa sen"
    ]
  },
  "city-7": {
    "title": "Can Tho Riverside Suite (Căn Hộ Bến Ninh Kiều Cần Thơ)",
    "description": "Căn hộ nghỉ dưỡng ngay sát bến Ninh Kiều nhộn nhịp, vô cùng thuận tiện để đi thuyền tham quan chợ nổi Cái Răng và ẩm thực Tây Đô.",
    "fullDescription": "Căn hộ nghỉ dưỡng ngay sát bến Ninh Kiều nhộn nhịp của thủ phủ miền Tây, vô cùng thuận tiện để đi thuyền tham quan chợ nổi Cái Răng và thưởng thức bánh xèo, lẩu mắm đậm đà.\n\nBan công ngắm nhìn cầu đi bộ Cần Thơ lung linh ánh đèn hình hoa sen.",
    "location": "Bến Ninh Kiều, TP. Cần Thơ, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:30",
    "checkOut": "12:00",
    "policyNote": "Ngay cạnh bến Ninh Kiều. Hỗ trợ đặt thuyền riêng đi Chợ Nổi Cái Răng lúc 05:30 sáng đón tại bến ngay trước khách sạn.",
    "services": [
      "Hỗ trợ đặt tàu đi Chợ Nổi Cái Răng",
      "Bữa sáng bánh tét lá cẩm đặc sản",
      "Lễ tân hỗ trợ 24/7",
      "Cho thuê xe máy"
    ],
    "bathroom": [
      "Phòng tắm vách kính hiện đại",
      "Vòi sen nóng lạnh",
      "Bộ vệ sinh cá nhân",
      "Khăn tắm sạch"
    ]
  },
  "city-8": {
    "title": "Hai Phong Opera Studio (Studio Quảng Trường Nhà Hát Hải Phòng)",
    "description": "Căn hộ studio tối giản nhìn ra quảng trường Nhà hát lớn cổ kính ngay trung tâm thành phố hoa phượng đỏ Hải Phòng.",
    "fullDescription": "Căn hộ studio tối giản nhìn ra quảng trường Nhà hát lớn cổ kính ngay trung tâm thành phố hoa phượng đỏ Hải Phòng.\n\nVị trí đắc địa để bạn thực hiện tour ẩm thực Hải Phòng lừng danh: bánh đa cua, bánh mì cay, chè dừa dầm và dạo phố ngắm hàng phượng vĩ rực sắc.",
    "location": "Quận Hồng Bàng, TP. Hải Phòng, Việt Nam",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Vị trí trung tâm quảng trường Nhà hát lớn thành phố. Cấm mang giày dép bẩn vào sàn gỗ. Nhận phòng linh hoạt.",
    "services": [
      "Cẩm nang Food Tour Hải Phòng chi tiết",
      "Xe đạp dạo phố cổ miễn phí",
      "Tủ lạnh mini và máy sưởi mùa đông",
      "Smart TV kết nối internet"
    ],
    "bathroom": [
      "Phòng tắm đứng tiện nghi",
      "Khăn tắm kháng khuẩn",
      "Máy sấy tóc",
      "Bộ bàn chải kem đánh răng"
    ]
  },
  "city-9": {
    "title": "Hue Imperial View Loft (Loft Ngắm Kinh Thành Cố Đô Huế)",
    "description": "Căn hộ gác mái hiện đại gần Hoàng Thành Huế, kết hợp tinh tế giữa vẻ đẹp hoài niệm di sản và sự tiện nghi tươi trẻ.",
    "fullDescription": "Căn hộ gác mái hiện đại gần Hoàng Thành Huế, kết hợp tinh tế giữa vẻ đẹp hoài niệm di sản sông Hương núi Ngự và sự tiện nghi tươi trẻ.\n\nChỉ vài bước là đến Đại Nội Huế, cầu Tràng Tiền lịch sử và phố đi bộ về đêm sôi động.",
    "location": "TP. Huế, Thừa Thiên Huế, Việt Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "13:00",
    "checkOut": "11:30",
    "policyNote": "Cách Đại Nội Huế 500m. Quý khách vui lòng không gây ồn sau 22:00 để giữ vẻ thanh tịnh của mảnh đất cố đô.",
    "services": [
      "Cho thuê trang phục Cổ Phục chụp ảnh Đại Nội",
      "Trà cung đình Huế đón tiếp miễn phí",
      "Xe đạp dạo sông Hương",
      "Hỗ trợ đặt vé ca Huế trên sông Hương"
    ],
    "bathroom": [
      "Phòng tắm ốp gạch men mát mẻ",
      "Vòi sen áp lực cao",
      "Đồ vệ sinh cá nhân",
      "Máy sấy tóc"
    ]
  },
  "city-10": {
    "title": "Nha Trang Center Sea Loft (Loft Nghỉ Dưỡng Trung Tâm Nha Trang)",
    "description": "Căn hộ ngay trung tâm thành phố biển Nha Trang, cực kỳ thuận tiện để mua sắm, dạo phố đêm và đi bộ thẳng ra tắm biển.",
    "fullDescription": "Căn hộ ngay trung tâm thành phố biển Nha Trang, cực kỳ thuận tiện để mua sắm, dạo chợ đêm ẩm thực và đi bộ thẳng ra làn nước biển trong xanh chỉ trong 3 phút.",
    "location": "Phường Lộc Thọ, TP. Nha Trang, Khánh Hòa, Việt Nam",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Tầng cao tòa nhà phố biển đường Hùng Vương. Cách bãi tắm 3 phút đi bộ. Tự nhận phòng bằng mã Smart Lock.",
    "services": [
      "Khóa số tự nhận phòng 24/7",
      "Bể bơi tòa nhà tầng 28",
      "Dịch vụ giặt sấy tiện lợi",
      "Wifi cáp quang"
    ],
    "bathroom": [
      "Buồng tắm kính đứng sạch bóng",
      "Máy sấy tóc công suất lớn",
      "Khăn tắm & đồ dùng cá nhân",
      "Gương led"
    ]
  },
  "villa-1": {
    "title": "Hoi An Heritage Villa (Biệt Thự Di Sản Phố Cổ Hội An)",
    "description": "Biệt thự phong cách thuộc địa Pháp màu vàng truyền thống của Hội An với sân trong rợp bóng mát, lồng đèn lung linh và hồ sen riêng biệt.",
    "fullDescription": "Biệt thự phong cách thuộc địa Pháp màu vàng truyền thống của Hội An với sân trong rợp bóng mát, lồng đèn rực rỡ và hồ sen riêng biệt thanh tịnh.\n\nCung cấp xe đạp miễn phí để bạn dạo quanh các con hẻm cổ kính, thưởng thức cao lầu, mì Quảng và ngắm đèn hoa đăng trên sông Hoài.",
    "location": "Phố Cổ Hội An, Quảng Nam, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 3,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Biệt thự sân vườn phố cổ Hội An có hồ hoa sen. Cung cấp xe đạp dạo phố miễn phí. Giữ gìn các hiện vật gỗ cổ xưa.",
    "services": [
      "Xe đạp dạo phố cổ Hội An miễn phí",
      "Hồ hoa sen ngắm trăng thanh tịnh",
      "Bữa sáng mì Quảng truyền thống",
      "Dọn phòng hàng ngày"
    ],
    "bathroom": [
      "3 Phòng tắm khép kín bồn tắm gỗ",
      "Đồ vệ sinh hương quế Trà Bồng",
      "Khăn tắm cao cấp",
      "Áo choàng tắm"
    ]
  },
  "villa-2": {
    "title": "Vung Tau Pool Villa (Biệt Thự Biển Có Hồ Bơi Vũng Tàu)",
    "description": "Biệt thự biển hiện đại rộng rãi sở hữu hồ bơi riêng, sân vườn ngoài trời và tầm nhìn ngắm biển Bãi Sau chỉ cách bờ cát vài phút đi bộ.",
    "fullDescription": "Biệt thự biển hiện đại rộng rãi sở hữu hồ bơi riêng, sân tiệc BBQ ngoài trời và tầm nhìn ngắm biển Bãi Sau chỉ cách bờ cát vài phút đi bộ.\n\nKhông gian rộng rãi với 4 phòng ngủ lớn, bàn bida giải trí, karaoke gia đình rất thích hợp cho những chuyến nghỉ dưỡng cuối tuần.",
    "location": "Bãi Sau, TP. Vũng Tàu, Bà Rịa - Vũng Tàu, Việt Nam",
    "maxGuests": 12,
    "bedrooms": 4,
    "beds": 6,
    "bathrooms": 4,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Biệt thự gia đình có hồ bơi riêng và bàn bida. Tiệc BBQ và karaoke ngoài sân vườn vui lòng giảm âm lượng sau 22:30.",
    "services": [
      "Hồ bơi riêng có sục massage",
      "Bàn bida lỗ giải trí chuyên nghiệp",
      "Dàn karaoke gia đình âm thanh chuẩn",
      "Sân nướng BBQ rộng rãi"
    ],
    "bathroom": [
      "4 Phòng tắm riêng biệt bồn tắm sục",
      "Vòi sen nóng lạnh ngoài trời",
      "Khăn tắm cho đoàn đông",
      "Máy sấy tóc từng phòng"
    ]
  },
  "villa-3": {
    "title": "Da Lat Colonial Villa (Biệt Thự Cổ Kiểu Pháp Đà Lạt)",
    "description": "Biệt thự Pháp cổ kính nguyên bản với vườn hoa cẩm tú cầu rộng lớn, lò sưởi củi và nội thất gỗ sang trọng quý phái giữa rừng thông.",
    "fullDescription": "Biệt thự Pháp cổ kính nguyên bản với vườn hoa cẩm tú cầu rộng lớn, lò sưởi củi và nội thất gỗ sang trọng quý phái giữa rừng thông Đà Lạt ngát hương.\n\nNơi thời gian như lắng đọng để bạn thưởng thức tách trà atiso ấm nóng, lắng nghe bản nhạc cổ điển và tận hưởng không khí hoàng gia xưa.",
    "location": "Đường Trần Hưng Đạo, TP. Đà Lạt, Lâm Đồng, Việt Nam",
    "maxGuests": 8,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "14:30",
    "checkOut": "11:30",
    "policyNote": "Biệt thự Pháp cổ nguyên bản có vườn cẩm tú cầu. Lò sưởi củi cổ điển phòng khách được cung cấp củi sưởi miễn phí.",
    "services": [
      "Lò sưởi củi cổ điển phòng khách lớn",
      "Vườn hoa cẩm tú cầu chụp ảnh riêng tư",
      "Bữa sáng trà Atiso và bánh mì bơ Pháp",
      "Quản gia riêng phục vụ"
    ],
    "bathroom": [
      "Bồn tắm chân rồng kiểu Pháp quý phái",
      "Hệ thống sưởi sàn nhà tắm",
      "Áo choàng nhung ấm áp",
      "Mỹ phẩm phòng tắm thảo mộc"
    ]
  },
  "villa-4": {
    "title": "Da Nang Luxury Beach Villa (Biệt Thự Biển Cao Cấp Non Nước)",
    "description": "Biệt thự nghỉ dưỡng 5 sao ven biển Non Nước với hồ bơi vô cực riêng biệt, 4 phòng ngủ view đại dương và khu vườn xanh mát.",
    "fullDescription": "Biệt thự nghỉ dưỡng 5 sao ven biển Non Nước với hồ bơi vô cực riêng biệt, 4 phòng ngủ view đại dương và khu vườn nhiệt đới xanh mát.\n\nCó lối đi riêng ra bãi cát vàng tuyệt đẹp, dịch vụ đầu bếp phục vụ tiệc BBQ hải sản tại gia và bảo vệ 24/7 an ninh tuyệt đối.",
    "location": "Bãi biển Non Nước, Ngũ Hành Sơn, Đà Nẵng, Việt Nam",
    "maxGuests": 10,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policyNote": "Khu resort 5 sao bãi biển Non Nước. Có cổng mở thẳng ra bãi biển riêng. Quản gia túc trực hỗ trợ suốt kỳ nghỉ.",
    "services": [
      "Lối đi riêng thẳng ra bãi biển Non Nước",
      "Hồ bơi vô cực rộng 70m2 riêng biệt",
      "Đầu bếp phục vụ tiệc BBQ hải sản tại gia",
      "Bảo vệ an ninh 24/7"
    ],
    "bathroom": [
      "4 Phòng tắm xa hoa có bồn tắm ngâm đôi",
      "Vòi tắm mưa ngoài trời",
      "Mỹ phẩm L’Occitane cao cấp",
      "Áo choàng lụa cao cấp"
    ]
  },
  "villa-5": {
    "title": "Nha Trang Ocean Villa (Biệt Thự Đô Thị Biển An Viên)",
    "description": "Biệt thự hiện đại nằm trong khu đô thị sinh thái ven biển An Viên an ninh, có hồ bơi riêng và không gian thư giãn sum vầy cho gia đình.",
    "fullDescription": "Biệt thự hiện đại nằm trong khu đô thị sinh thái ven biển An Viên an ninh, có hồ bơi riêng và không gian thư giãn sum vầy lý tưởng cho gia đình.\n\nNằm cạnh bến cáp treo Vinpearl Nha Trang, không gian tĩnh lặng, trong lành và chỉ cách cảng du thuyền vài bước chân.",
    "location": "Khu đô thị An Viên, Vĩnh Tường, Nha Trang, Khánh Hòa, Việt Nam",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Khu biệt thự khép kín an ninh 24/7 cạnh bến cáp treo Vinpearl. Đỗ được 2 xe ô tô 7 chỗ trước cổng.",
    "services": [
      "Hồ bơi nước xanh mát trong sân",
      "Sân đậu xe ô tô rộng rãi",
      "Bếp nướng BBQ than hoa",
      "Bảo vệ an ninh KĐT 24/7"
    ],
    "bathroom": [
      "3 Phòng tắm rộng rãi bồn tắm đứng",
      "Máy sấy tóc",
      "Đồ dùng cá nhân đầy đủ",
      "Khăn tắm lớn"
    ]
  },
  "villa-6": {
    "title": "Sapa Valley Pool Villa (Biệt Thự Hồ Nước Ấm Thung Lũng Sapa)",
    "description": "Biệt thự núi cao sở hữu hồ bơi nước nóng trong nhà và thiết kế hoàn toàn bằng kính panorama ngắm nhìn thung lũng mây huyền ảo.",
    "fullDescription": "Biệt thự núi cao sở hữu hồ bơi nước ấm trong nhà và thiết kế hoàn toàn bằng kính panorama ngắm nhìn thung lũng mây huyền ảo và đỉnh Fansipan hùng vĩ.\n\nTrang bị bồn tắm sục lá thuốc người Dao đỏ, lò sưởi hiện đại và phục vụ bữa sáng kiểu Tây Bắc thơm lành.",
    "location": "Sa Pa, Lào Cai, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "11:00",
    "policyNote": "Biệt thự có hồ bơi nước ấm trong nhà duy trì 36°C quanh năm. Không hút thuốc trong phòng và khu vực hồ bơi.",
    "services": [
      "Hồ bơi nước nóng trong nhà nhiệt độ 36°C",
      "Thiết kế kính panorama ngắm đỉnh Fansipan",
      "Lò sưởi điện hiện đại ấm áp",
      "Phục vụ bữa sáng Tây Bắc"
    ],
    "bathroom": [
      "Bồn tắm ngâm thuốc bắc người Dao đỏ",
      "Sưởi ấm phòng tắm tự động",
      "Khăn sưởi điện mềm mại",
      "Máy sấy tóc cao cấp"
    ]
  },
  "villa-7": {
    "title": "Phu Quoc Tropical Villa (Biệt Thự Nghỉ Dưỡng Bãi Trường)",
    "description": "Biệt thự resort đảo ngọc xa hoa mang phong cách nhiệt đới mở cùng hồ bơi siêu lớn, bãi biển riêng và dịch vụ quản gia chu đáo.",
    "fullDescription": "Biệt thự resort đảo ngọc xa hoa mang phong cách nhiệt đới mở cùng hồ bơi siêu lớn, bãi biển riêng và dịch vụ quản gia chu đáo tận tâm.\n\nNằm tại Bãi Trường thơ mộng, nơi bạn có thể ngắm hoàng hôn đỏ rực buông xuống mặt biển phẳng lặng và thưởng thức cocktail bên bờ hồ.",
    "location": "Bãi Trường, Phú Quốc, Kiên Giang, Việt Nam",
    "maxGuests": 10,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policyNote": "Khu nghỉ dưỡng biệt lập Bãi Trường. Đưa đón sân bay 2 chiều bằng xe Limousine cao cấp. Check-in trực tiếp tại villa.",
    "services": [
      "Xe Limousine đưa đón sân bay riêng",
      "Hồ bơi tràn viền diện tích lớn",
      "Quản gia riêng phục vụ bữa sáng floating",
      "Khu nướng BBQ bãi biển"
    ],
    "bathroom": [
      "Bồn tắm Jacuzzi ngoài trời view biển",
      "Buồng xông hơi ướt riêng",
      "Bộ khăn và áo choàng lụa cao cấp",
      "Mỹ phẩm phòng tắm quốc tế"
    ]
  },
  "villa-8": {
    "title": "Tam Dao Pine Hill Villa (Biệt Thự Đồi Thông Tam Đảo)",
    "description": "Biệt thự nép mình giữa rừng thông Tam Đảo bạt ngàn, mang đến không gian rộng rãi, lãng mạn cho kỳ nghỉ của gia đình và bạn bè.",
    "fullDescription": "Biệt thự nép mình giữa rừng thông Tam Đảo bạt ngàn, mang đến không gian rộng rãi, lãng mạn cho kỳ nghỉ của gia đình và bạn bè.\n\nTrang bị bàn bida, phòng hát karaoke gia đình, hồ bơi ngoài trời nhìn ra thung lũng và sân nướng BBQ ngập tràn gió thông.",
    "location": "Thị trấn Tam Đảo, Vĩnh Phúc, Việt Nam",
    "maxGuests": 12,
    "bedrooms": 5,
    "beds": 7,
    "bathrooms": 5,
    "checkIn": "14:00",
    "checkOut": "11:30",
    "policyNote": "Biệt thự đồi thông thích hợp họp lớp, đại gia đình. Được phép mang đồ ăn bên ngoài vào nấu nướng tiệc BBQ.",
    "services": [
      "Bàn bi-da và dàn karaoke gia đình",
      "Sân nướng BBQ thoáng đãng view đồi thông",
      "Bếp công nghiệp đầy đủ nồi niêu bát đĩa",
      "Hồ bơi ngoài trời ngắm thung lũng"
    ],
    "bathroom": [
      "5 Phòng tắm riêng từng phòng",
      "Nước nóng công suất cao",
      "Đồ vệ sinh cá nhân",
      "Khăn tắm cho đoàn đông"
    ]
  },
  "villa-9": {
    "title": "Hue Royal Garden Villa (Biệt Thự Vườn Thượng Uyển Cố Đô)",
    "description": "Biệt thự sân vườn kiểu nhà rường Huế với không gian thiền tịnh an yên, hồ cá Koi uốn lượn và những cây bonsai quý hiếm.",
    "fullDescription": "Biệt thự sân vườn kiểu nhà rường Huế với không gian thiền tịnh an yên, hồ cá Koi uốn lượn và những cây bonsai quý hiếm hàng chục năm tuổi.\n\nTrải nghiệm trà đạo cung đình, thưởng thức bữa điểm tâm mang phong vị hoàng gia và lắng nghe tiếng nhã nhạc Huế thanh tao.",
    "location": "TP. Huế, Thừa Thiên Huế, Việt Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 3,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Khuôn viên nhà vườn truyền thống với hồ cá Koi quý. Quý khách vui lòng không tự ý cho cá ăn thức ăn lạ.",
    "services": [
      "Hồ cá Koi Nhật uốn lượn quanh sân",
      "Không gian trà đạo thiền định an yên",
      "Bữa điểm tâm phong vị cung đình Huế",
      "Trang phục áo dài dạo vườn"
    ],
    "bathroom": [
      "Bồn tắm bằng gốm Bát Tràng nghệ thuật",
      "Khăn tắm bông mềm mịn",
      "Tinh dầu sả chanh thư giãn",
      "Máy sấy tóc"
    ]
  },
  "villa-10": {
    "title": "Con Dao Heritage Villa (Biệt Thự Xa Hoa Đỉnh Cao Côn Đảo)",
    "description": "Biệt thự nghỉ dưỡng đẳng cấp thế giới tại Côn Đảo sở hữu tầm nhìn trực diện không giới hạn ra đại dương xanh thẳm vô tận.",
    "fullDescription": "Biệt thự nghỉ dưỡng đẳng cấp thế giới tại Côn Đảo sở hữu tầm nhìn trực diện không giới hạn ra đại dương xanh thẳm vô tận.\n\nBãi biển riêng tư tuyệt đối, hồ bơi vô cực tràn bờ, quản gia riêng túc trực và dịch vụ spa chăm sóc sức khỏe cao cấp giữa thiên nhiên hoang sơ.",
    "location": "Quần đảo Côn Đảo, Bà Rịa - Vũng Tàu, Việt Nam",
    "maxGuests": 8,
    "bedrooms": 4,
    "beds": 4,
    "bathrooms": 4,
    "checkIn": "15:00",
    "checkOut": "12:00",
    "policyNote": "Biệt thự nghỉ dưỡng đỉnh cao biệt lập sát biển Côn Đảo. Dịch vụ bảo vệ và quản gia túc trực phục vụ riêng biệt.",
    "services": [
      "Bãi biển riêng tư không có người ngoài",
      "Hồ bơi vô cực view trực diện đại dương",
      "Liệu trình massage spa thư giãn tại phòng",
      "Quản gia cao cấp túc trực 24/7"
    ],
    "bathroom": [
      "Bồn tắm hướng biển view chân trời",
      "Vòi sen trần ngoài trời giữa thiên nhiên",
      "Mỹ phẩm hữu cơ quốc tế cao cấp",
      "Áo choàng nhung"
    ]
  }
};
