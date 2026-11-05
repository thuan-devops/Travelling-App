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
    "title": "Sunset Beachfront Bungalow Phú Quốc",
    "description": "Bungalow tre kính sinh thái ngay trên bãi cát vàng óng ả, lắng nghe sóng vỗ rì rào và ngắm hoàng hôn rực rỡ bên biển Phú Quốc.",
    "fullDescription": "Bungalow tre kính sinh thái ngay trên bãi cát vàng óng ả, lắng nghe sóng vỗ rì rào và ngắm hoàng hôn rực rỡ bên biển Phú Quốc.\n\nTọa lạc tại Bãi Ông Lang, Cửa Dương, TP. Phú Quốc, Kiên Giang, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi Ông Lang, Cửa Dương, TP. Phú Quốc, Kiên Giang",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-2": {
    "title": "Hạ Long Bay Heritage Eco-Lodge",
    "description": "Nhà gỗ sinh thái nổi giữa lòng di sản thiên nhiên vịnh Hạ Long, trải nghiệm chèo thuyền kayak và tiệc hải sản tươi sống ngắm vịnh kỳ vĩ.",
    "fullDescription": "Nhà gỗ sinh thái nổi giữa lòng di sản thiên nhiên vịnh Hạ Long, trải nghiệm chèo thuyền kayak và tiệc hải sản tươi sống ngắm vịnh kỳ vĩ.\n\nTọa lạc tại Vịnh Hạ Long, TP. Hạ Long, Quảng Ninh, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Vịnh Hạ Long, TP. Hạ Long, Quảng Ninh",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-3": {
    "title": "An Bàng Oceanfront Retreat Hội An",
    "description": "Biệt thự nhiệt đới nép mình bên hàng dừa xanh mát bãi biển An Bàng, có hồ bơi riêng và hiên tắm nắng ngắm bình minh trên biển.",
    "fullDescription": "Biệt thự nhiệt đới nép mình bên hàng dừa xanh mát bãi biển An Bàng, có hồ bơi riêng và hiên tắm nắng ngắm bình minh trên biển.\n\nTọa lạc tại Bãi biển An Bàng, Cẩm An, TP. Hội An, Quảng Nam, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi biển An Bàng, Cẩm An, TP. Hội An, Quảng Nam",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-4": {
    "title": "Nha Trang Ocean View Suite & Spa",
    "description": "Căn hộ cao cấp trên trục đường vàng Trần Phú, ban công đón gió biển lộng gió cùng tầm nhìn trọn vẹn vịnh ngọc Nha Trang.",
    "fullDescription": "Căn hộ cao cấp trên trục đường vàng Trần Phú, ban công đón gió biển lộng gió cùng tầm nhìn trọn vẹn vịnh ngọc Nha Trang.\n\nTọa lạc tại Đường Trần Phú, Lộc Thọ, TP. Nha Trang, Khánh Hòa, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trần Phú, Lộc Thọ, TP. Nha Trang, Khánh Hòa",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-5": {
    "title": "Quy Nhơn Cliffside Breeze Villa",
    "description": "Biệt thự lưng tựa núi mặt hướng biển tọa lạc tại Bãi Xép, tận hưởng không gian đại dương nguyên sơ và tiếng sóng biển vỗ về.",
    "fullDescription": "Biệt thự lưng tựa núi mặt hướng biển tọa lạc tại Bãi Xép, tận hưởng không gian đại dương nguyên sơ và tiếng sóng biển vỗ về.\n\nTọa lạc tại Bãi Xép, Ghềnh Ráng, TP. Quy Nhơn, Bình Định, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi Xép, Ghềnh Ráng, TP. Quy Nhơn, Bình Định",
    "maxGuests": 5,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-6": {
    "title": "Mũi Né Palm Haven Beach Resort",
    "description": "Khu nghỉ dưỡng nép mình bên rặng dừa thơ mộng Mũi Né, chỉ vài bước chân là đến biển xanh cát trắng, trải nghiệm lướt ván diều.",
    "fullDescription": "Khu nghỉ dưỡng nép mình bên rặng dừa thơ mộng Mũi Né, chỉ vài bước chân là đến biển xanh cát trắng, trải nghiệm lướt ván diều.\n\nTọa lạc tại Đường Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết, Bình Thuận, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Nguyễn Đình Chiểu, Hàm Tiến, Phan Thiết, Bình Thuận",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-7": {
    "title": "Vũng Tàu Coastal Horizon Condotel",
    "description": "Căn hộ condotel hiện đại sát bờ biển Bãi Sau Vũng Tàu, view trọn vẹn biển Đông và đồi hoa sứ, đầy đủ tiện nghi cho gia đình nghỉ ngơi.",
    "fullDescription": "Căn hộ condotel hiện đại sát bờ biển Bãi Sau Vũng Tàu, view trọn vẹn biển Đông và đồi hoa sứ, đầy đủ tiện nghi cho gia đình nghỉ ngơi.\n\nTọa lạc tại Đường Thùy Vân, Phường Thắng Tam, TP. Vũng Tàu, Bà Rịa - Vũng Tàu, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Thùy Vân, Phường Thắng Tam, TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-8": {
    "title": "Phú Yên Wild Beach Eco-Hut",
    "description": "Túp lều mộc mạc hướng biển hoang sơ Phú Yên, ngắm ghềnh đá hùng vĩ và đón những tia nắng đầu tiên trên dải đất hình chữ S.",
    "fullDescription": "Túp lều mộc mạc hướng biển hoang sơ Phú Yên, ngắm ghềnh đá hùng vĩ và đón những tia nắng đầu tiên trên dải đất hình chữ S.\n\nTọa lạc tại Gành Đỏ, Sông Cầu, Phú Yên, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Gành Đỏ, Sông Cầu, Phú Yên",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-9": {
    "title": "Đà Nẵng Mỹ Khê Luxury Beach Studio",
    "description": "Studio thiết kế tinh tế bên cung đường biển Mỹ Khê đẹp nhất hành tinh, ngắm trọn vẹn bình minh và ngâm mình trong hồ bơi vô cực.",
    "fullDescription": "Studio thiết kế tinh tế bên cung đường biển Mỹ Khê đẹp nhất hành tinh, ngắm trọn vẹn bình minh và ngâm mình trong hồ bơi vô cực.\n\nTọa lạc tại Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "beach-10": {
    "title": "Côn Đảo Hidden Lagoon Villa",
    "description": "Biệt thự biệt lập ẩn mình giữa vịnh biển ngọc ngà Côn Đảo, trải nghiệm nghỉ dưỡng xa hoa, riêng tư tuyệt đối hòa cùng thiên nhiên.",
    "fullDescription": "Biệt thự biệt lập ẩn mình giữa vịnh biển ngọc ngà Côn Đảo, trải nghiệm nghỉ dưỡng xa hoa, riêng tư tuyệt đối hòa cùng thiên nhiên.\n\nTọa lạc tại Bãi Đầm Trầu, Huyện Côn Đảo, Bà Rịa - Vũng Tàu, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi Đầm Trầu, Huyện Côn Đảo, Bà Rịa - Vũng Tàu",
    "maxGuests": 5,
    "bedrooms": 2,
    "beds": 3,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-1": {
    "title": "The Cloud Nest Sapa Chalet",
    "description": "Nhà gỗ pơ-mu ấm áp nằm lưng chừng bản Tả Van, ngắm nhìn biển mây bồng bềnh và thung lũng ruộng bậc thang Mường Hoa tuyệt mỹ.",
    "fullDescription": "Nhà gỗ pơ-mu ấm áp nằm lưng chừng bản Tả Van, ngắm nhìn biển mây bồng bềnh và thung lũng ruộng bậc thang Mường Hoa tuyệt mỹ.\n\nTọa lạc tại Bản Tả Van, Thị xã Sapa, Lào Cai, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bản Tả Van, Thị xã Sapa, Lào Cai",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-2": {
    "title": "Đà Lạt Pine Forest Glasshouse",
    "description": "Ngôi nhà kính giữa đồi thông rì rào của xứ sở sương mù Đà Lạt, thưởng thức tách trà atiso nóng và ngắm sương sớm luồn qua khe lá.",
    "fullDescription": "Ngôi nhà kính giữa đồi thông rì rào của xứ sở sương mù Đà Lạt, thưởng thức tách trà atiso nóng và ngắm sương sớm luồn qua khe lá.\n\nTọa lạc tại Đồi Robin, Phường 3, TP. Đà Lạt, Lâm Đồng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đồi Robin, Phường 3, TP. Đà Lạt, Lâm Đồng",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-3": {
    "title": "Tam Đảo Mist Valley Wooden Villa",
    "description": "Biệt thự gỗ phong cách Bắc Âu nằm chênh vênh trên sườn núi Tam Đảo mù sương, sở hữu hồ bơi nước ấm nhìn xuống toàn cảnh thung lũng.",
    "fullDescription": "Biệt thự gỗ phong cách Bắc Âu nằm chênh vênh trên sườn núi Tam Đảo mù sương, sở hữu hồ bơi nước ấm nhìn xuống toàn cảnh thung lũng.\n\nTọa lạc tại Tổ dân phố 2, Thị trấn Tam Đảo, Vĩnh Phúc, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Tổ dân phố 2, Thị trấn Tam Đảo, Vĩnh Phúc",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-4": {
    "title": "Hà Giang Rocky Plateau Homestay",
    "description": "Homestay nhà trình tường độc đáo giữa lòng cao nguyên đá Đồng Văn, trải nghiệm văn hóa bản địa mộc mạc và cung đường đèo Mã Pí Lèng.",
    "fullDescription": "Homestay nhà trình tường độc đáo giữa lòng cao nguyên đá Đồng Văn, trải nghiệm văn hóa bản địa mộc mạc và cung đường đèo Mã Pí Lèng.\n\nTọa lạc tại Thị trấn Đồng Văn, Tỉnh Hà Giang, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Thị trấn Đồng Văn, Tỉnh Hà Giang",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-5": {
    "title": "Mộc Châu Highland Pine Cabin",
    "description": "Cabin gỗ hình tam giác xinh xắn giữa rừng thông bản Áng thơ mộng, không khí trong lành, ngắm đồi chè trái tim và thung lũng mận.",
    "fullDescription": "Cabin gỗ hình tam giác xinh xắn giữa rừng thông bản Áng thơ mộng, không khí trong lành, ngắm đồi chè trái tim và thung lũng mận.\n\nTọa lạc tại Rừng thông Bản Áng, Đông Sang, Mộc Châu, Sơn La, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Rừng thông Bản Áng, Đông Sang, Mộc Châu, Sơn La",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-6": {
    "title": "Pù Luông Terraced Paddy Eco-Lodge",
    "description": "Khu nghỉ dưỡng sinh thái bằng gỗ tre nằm giữa ruộng bậc thang ngát hương lúa chín Pù Luông, có hồ bơi vô cực ngắm trọn núi non hùng vĩ.",
    "fullDescription": "Khu nghỉ dưỡng sinh thái bằng gỗ tre nằm giữa ruộng bậc thang ngát hương lúa chín Pù Luông, có hồ bơi vô cực ngắm trọn núi non hùng vĩ.\n\nTọa lạc tại Bản Đôn, Thành Lâm, Bá Thước, Thanh Hóa, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bản Đôn, Thành Lâm, Bá Thước, Thanh Hóa",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-7": {
    "title": "Mai Châu Valley View Bamboo Lodge",
    "description": "Nhà sàn gỗ tre thoáng mát nhìn ra cánh đồng lúa thanh bình bản Lác Mai Châu, cùng người dân bản địa thưởng thức rượu cần ấm tình người.",
    "fullDescription": "Nhà sàn gỗ tre thoáng mát nhìn ra cánh đồng lúa thanh bình bản Lác Mai Châu, cùng người dân bản địa thưởng thức rượu cần ấm tình người.\n\nTọa lạc tại Bản Lác, Thị trấn Mai Châu, Hòa Bình, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bản Lác, Thị trấn Mai Châu, Hòa Bình",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-8": {
    "title": "Ba Vì Hillside Cedar Cottage",
    "description": "Căn cottage gỗ tuyết tùng nép mình dưới chân núi Ba Vì, không gian yên bình cho kỳ nghỉ trốn khói bụi thành phố dịp cuối tuần.",
    "fullDescription": "Căn cottage gỗ tuyết tùng nép mình dưới chân núi Ba Vì, không gian yên bình cho kỳ nghỉ trốn khói bụi thành phố dịp cuối tuần.\n\nTọa lạc tại Vân Hòa, Ba Vì, Hà Nội, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Vân Hòa, Ba Vì, Hà Nội",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-9": {
    "title": "Đà Lạt Sunset Valley Bungalow",
    "description": "Bungalow phong cách vintage đón trọn khoảnh khắc hoàng hôn nhuộm tím thung lũng đèn lồng Đà Lạt, một góc sống ảo cực chill.",
    "fullDescription": "Bungalow phong cách vintage đón trọn khoảnh khắc hoàng hôn nhuộm tím thung lũng đèn lồng Đà Lạt, một góc sống ảo cực chill.\n\nTọa lạc tại Đường An Bình, Phường 3, TP. Đà Lạt, Lâm Đồng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường An Bình, Phường 3, TP. Đà Lạt, Lâm Đồng",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "mountain-10": {
    "title": "Bạch Mã Peak Heritage Lodge",
    "description": "Dinh thự kiến trúc Pháp cổ kính trên độ cao 1.400m tại vườn quốc gia Bạch Mã, khí hậu mát lạnh quanh năm với thảm thực vật kỳ thú.",
    "fullDescription": "Dinh thự kiến trúc Pháp cổ kính trên độ cao 1.400m tại vườn quốc gia Bạch Mã, khí hậu mát lạnh quanh năm với thảm thực vật kỳ thú.\n\nTọa lạc tại Vườn quốc gia Bạch Mã, Phú Lộc, Thừa Thiên Huế, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Vườn quốc gia Bạch Mã, Phú Lộc, Thừa Thiên Huế",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-1": {
    "title": "Tuyền Lâm Lakeview Glamping Đà Lạt",
    "description": "Khu lều Glamping sang trọng bên bờ hồ Tuyền Lâm phẳng lặng, ngắm sương bay lãng đãng và nướng thịt trò chuyện quanh đống lửa bập bùng.",
    "fullDescription": "Khu lều Glamping sang trọng bên bờ hồ Tuyền Lâm phẳng lặng, ngắm sương bay lãng đãng và nướng thịt trò chuyện quanh đống lửa bập bùng.\n\nTọa lạc tại Khu du lịch Hồ Tuyền Lâm, Phường 4, TP. Đà Lạt, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Khu du lịch Hồ Tuyền Lâm, Phường 4, TP. Đà Lạt",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-2": {
    "title": "Trị An Lake Eco Safari Camp",
    "description": "Cắm trại thư giãn bên mặt nước hồ Trị An bao la, đón những cơn gió mát rượi và ngắm bầu trời hoàng hôn cam rực rỡ cách Sài Gòn chỉ 2 giờ chạy xe.",
    "fullDescription": "Cắm trại thư giãn bên mặt nước hồ Trị An bao la, đón những cơn gió mát rượi và ngắm bầu trời hoàng hôn cam rực rỡ cách Sài Gòn chỉ 2 giờ chạy xe.\n\nTọa lạc tại Hồ Trị An, Xã Mã Đà, Vĩnh Cửu, Đồng Nai, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Hồ Trị An, Xã Mã Đà, Vĩnh Cửu, Đồng Nai",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-3": {
    "title": "Sapa Cloud Meadow Glamping",
    "description": "Cắm trại trên triền đồi ngập tràn hoa cỏ Sín Chải, nhìn thẳng lên đỉnh Fansipan hùng vĩ, thưởng thức lẩu cá hồi nóng hổi giữa sương lạnh.",
    "fullDescription": "Cắm trại trên triền đồi ngập tràn hoa cỏ Sín Chải, nhìn thẳng lên đỉnh Fansipan hùng vĩ, thưởng thức lẩu cá hồi nóng hổi giữa sương lạnh.\n\nTọa lạc tại Bản Sín Chải, Thị xã Sapa, Lào Cai, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bản Sín Chải, Thị xã Sapa, Lào Cai",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-4": {
    "title": "Mũi Dinh Desert Oasis Camp",
    "description": "Trải nghiệm cắm trại độc lạ giữa sa mạc cát mênh mông sát bờ biển Mũi Dinh, ngắm triệu vì sao lấp lánh không vướng bụi đô thị.",
    "fullDescription": "Trải nghiệm cắm trại độc lạ giữa sa mạc cát mênh mông sát bờ biển Mũi Dinh, ngắm triệu vì sao lấp lánh không vướng bụi đô thị.\n\nTọa lạc tại Mũi Dinh, Xã Phước Dinh, Thuận Nam, Ninh Thuận, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Mũi Dinh, Xã Phước Dinh, Thuận Nam, Ninh Thuận",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-5": {
    "title": "Hòa Bình Stream Forest Camp",
    "description": "Khu cắm trại nép mình bên dòng suối róc rách trong veo mát lạnh, thả chân xuống nước và thưởng thức đồ nướng thơm lừng cùng bạn bè.",
    "fullDescription": "Khu cắm trại nép mình bên dòng suối róc rách trong veo mát lạnh, thả chân xuống nước và thưởng thức đồ nướng thơm lừng cùng bạn bè.\n\nTọa lạc tại Kỳ Sơn, TP. Hòa Bình, Tỉnh Hòa Bình, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Kỳ Sơn, TP. Hòa Bình, Tỉnh Hòa Bình",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-6": {
    "title": "Phú Quốc Sunset Beachside Camp",
    "description": "Cắm trại bãi biển phong cách Bohemian tại bắc đảo Phú Quốc, ngắm mặt trời lặn từ từ xuống biển và lắng nghe âm nhạc acoustic êm dịu.",
    "fullDescription": "Cắm trại bãi biển phong cách Bohemian tại bắc đảo Phú Quốc, ngắm mặt trời lặn từ từ xuống biển và lắng nghe âm nhạc acoustic êm dịu.\n\nTọa lạc tại Bãi Thơm, TP. Phú Quốc, Kiên Giang, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi Thơm, TP. Phú Quốc, Kiên Giang",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-7": {
    "title": "Hồ Dầu Tiếng Starry Sky Camp",
    "description": "Địa điểm cắm trại hot nhất miền Nam với bãi cỏ xanh ngắt ven bờ hồ Dầu Tiếng, ngắm đỉnh núi Bà Đen sừng sững giữa bầu trời đêm.",
    "fullDescription": "Địa điểm cắm trại hot nhất miền Nam với bãi cỏ xanh ngắt ven bờ hồ Dầu Tiếng, ngắm đỉnh núi Bà Đen sừng sững giữa bầu trời đêm.\n\nTọa lạc tại Hồ Dầu Tiếng, Dương Minh Châu, Tây Ninh, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Hồ Dầu Tiếng, Dương Minh Châu, Tây Ninh",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-8": {
    "title": "Hà Giang Rocky Plateau Glamping",
    "description": "Lều vòm trong suốt tọa lạc trên đỉnh đèo Mã Pí Lèng, nhìn thẳng xuống hẻm Tu Sản và dòng sông Nho Quế màu xanh ngọc bích huyền ảo.",
    "fullDescription": "Lều vòm trong suốt tọa lạc trên đỉnh đèo Mã Pí Lèng, nhìn thẳng xuống hẻm Tu Sản và dòng sông Nho Quế màu xanh ngọc bích huyền ảo.\n\nTọa lạc tại Đèo Mã Pí Lèng, Huyện Mèo Vạc, Hà Giang, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đèo Mã Pí Lèng, Huyện Mèo Vạc, Hà Giang",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-9": {
    "title": "Đắk Lắk Coffee Hill Glamping",
    "description": "Hòa mình vào hương hoa cà phê thơm ngào ngạt của đất trời Tây Nguyên đại ngàn, thưởng thức ly Robusta thơm nồng mỗi sớm mai.",
    "fullDescription": "Hòa mình vào hương hoa cà phê thơm ngào ngạt của đất trời Tây Nguyên đại ngàn, thưởng thức ly Robusta thơm nồng mỗi sớm mai.\n\nTọa lạc tại Xã Ea Kao, TP. Buôn Ma Thuột, Đắk Lắk, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Xã Ea Kao, TP. Buôn Ma Thuột, Đắk Lắk",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "camping-10": {
    "title": "Cát Bà Jungle Island Camp",
    "description": "Cắm trại giữa rừng nhiệt đới đảo ngọc Cát Bà, lắng nghe bản hòa ca của muông thú và tham gia hành trình chèo kayak khám phá vịnh Lan Hạ.",
    "fullDescription": "Cắm trại giữa rừng nhiệt đới đảo ngọc Cát Bà, lắng nghe bản hòa ca của muông thú và tham gia hành trình chèo kayak khám phá vịnh Lan Hạ.\n\nTọa lạc tại Vườn quốc gia Cát Bà, Huyện Cát Hải, Hải Phòng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Vườn quốc gia Cát Bà, Huyện Cát Hải, Hải Phòng",
    "maxGuests": 4,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-1": {
    "title": "Landmark 81 Skyview Residence",
    "description": "Căn hộ cao cấp tầng cao nhìn thẳng tòa tháp Landmark 81 và sông Sài Gòn, nội thất hiện đại sang trọng chuẩn quốc tế giữa trung tâm năng động.",
    "fullDescription": "Căn hộ cao cấp tầng cao nhìn thẳng tòa tháp Landmark 81 và sông Sài Gòn, nội thất hiện đại sang trọng chuẩn quốc tế giữa trung tâm năng động.\n\nTọa lạc tại Vinhomes Central Park, Đường Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Vinhomes Central Park, Đường Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-2": {
    "title": "Hồ Tây Panoramic Luxury Duplex",
    "description": "Căn hộ duplex thông tầng tuyệt đẹp view ôm trọn mặt nước Hồ Tây mênh mông, ngắm hoàng hôn rực rỡ và đón gió mát trong lành thủ đô.",
    "fullDescription": "Căn hộ duplex thông tầng tuyệt đẹp view ôm trọn mặt nước Hồ Tây mênh mông, ngắm hoàng hôn rực rỡ và đón gió mát trong lành thủ đô.\n\nTọa lạc tại Đường Quảng An, Phường Quảng An, Tây Hồ, Hà Nội, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Quảng An, Phường Quảng An, Tây Hồ, Hà Nội",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-3": {
    "title": "Sài Gòn District 1 Art Deco Studio",
    "description": "Studio phong cách nghệ thuật cổ điển Sài Gòn xưa nằm tại trung tâm Quận 1, dễ dàng đi bộ đến phố đi bộ Nguyễn Huệ, chợ Bến Thành.",
    "fullDescription": "Studio phong cách nghệ thuật cổ điển Sài Gòn xưa nằm tại trung tâm Quận 1, dễ dàng đi bộ đến phố đi bộ Nguyễn Huệ, chợ Bến Thành.\n\nTọa lạc tại Đường Pasteur, Phường Bến Nghé, Quận 1, TP.HCM, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Pasteur, Phường Bến Nghé, Quận 1, TP.HCM",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-4": {
    "title": "Đà Nẵng Dragon Bridge Riverside Suite",
    "description": "Căn hộ bên dòng sông Hàn thơ mộng, thưởng thức màn trình diễn Cầu Rồng phun lửa nước ngay từ ban công phòng khách vào mỗi cuối tuần.",
    "fullDescription": "Căn hộ bên dòng sông Hàn thơ mộng, thưởng thức màn trình diễn Cầu Rồng phun lửa nước ngay từ ban công phòng khách vào mỗi cuối tuần.\n\nTọa lạc tại Đường Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-5": {
    "title": "Hà Nội Phố Cổ Heritage Loft",
    "description": "Căn loft mộc mạc lưu giữ nét duyên ngầm của 36 phố phường Hà Nội, bước chân ra ngõ là hòa mình vào thiên đường ẩm thực phở, bún chả trứ danh.",
    "fullDescription": "Căn loft mộc mạc lưu giữ nét duyên ngầm của 36 phố phường Hà Nội, bước chân ra ngõ là hòa mình vào thiên đường ẩm thực phở, bún chả trứ danh.\n\nTọa lạc tại Phố Hàng Bạc, Phường Hàng Bạc, Hoàn Kiếm, Hà Nội, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Phố Hàng Bạc, Phường Hàng Bạc, Hoàn Kiếm, Hà Nội",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-6": {
    "title": "Huế Sông Hương Imperial Suite",
    "description": "Không gian trang nhã nhìn thẳng ra cầu Tràng Tiền và dòng sông Hương êm đềm, mang đến sự tĩnh lặng đặc trưng của xứ Huế mộng mơ.",
    "fullDescription": "Không gian trang nhã nhìn thẳng ra cầu Tràng Tiền và dòng sông Hương êm đềm, mang đến sự tĩnh lặng đặc trưng của xứ Huế mộng mơ.\n\nTọa lạc tại Đường Lê Lợi, Phường Vĩnh Ninh, TP. Huế, Thừa Thiên Huế, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Lê Lợi, Phường Vĩnh Ninh, TP. Huế, Thừa Thiên Huế",
    "maxGuests": 3,
    "bedrooms": 1,
    "beds": 2,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-7": {
    "title": "Nha Trang Marina Skyline Apartment",
    "description": "Căn hộ 2 phòng ngủ hiện đại ngắm nhìn bến du thuyền quốc tế và đường chân trời vịnh Nha Trang lung linh ánh đèn thành phố.",
    "fullDescription": "Căn hộ 2 phòng ngủ hiện đại ngắm nhìn bến du thuyền quốc tế và đường chân trời vịnh Nha Trang lung linh ánh đèn thành phố.\n\nTọa lạc tại Đường Trần Phú, Phường Vĩnh Phước, TP. Nha Trang, Khánh Hòa, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trần Phú, Phường Vĩnh Phước, TP. Nha Trang, Khánh Hòa",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-8": {
    "title": "Cần Thơ Ninh Kiều Riverside Penthouse",
    "description": "Penthouse sân thượng độc nhất nhìn xuống ngã ba sông Hậu và cầu đi bộ Ninh Kiều, tận hưởng nhịp sống sông nước miền Tây hiền hòa.",
    "fullDescription": "Penthouse sân thượng độc nhất nhìn xuống ngã ba sông Hậu và cầu đi bộ Ninh Kiều, tận hưởng nhịp sống sông nước miền Tây hiền hòa.\n\nTọa lạc tại Đường Hai Bà Trưng, Phường Tân An, Ninh Kiều, Cần Thơ, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Hai Bà Trưng, Phường Tân An, Ninh Kiều, Cần Thơ",
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 2,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-9": {
    "title": "Hải Phòng Harbor View Luxury Suite",
    "description": "Suite sang trọng ngay trung tâm thành phố hoa phượng đỏ, ngắm nhìn nhịp sống sôi động của phố cảng và các công trình kiến trúc cổ.",
    "fullDescription": "Suite sang trọng ngay trung tâm thành phố hoa phượng đỏ, ngắm nhìn nhịp sống sôi động của phố cảng và các công trình kiến trúc cổ.\n\nTọa lạc tại Đường Lê Hồng Phong, Đông Khê, Ngô Quyền, TP. Hải Phòng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Lê Hồng Phong, Đông Khê, Ngô Quyền, TP. Hải Phòng",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "city-10": {
    "title": "Thủ Thiêm Modern Skyline Loft",
    "description": "Căn hộ loft với trần cao thoáng đãng tại đô thị sinh thái Sala, chỉ mất 5 phút qua hầm Thủ Thiêm là sang ngay trái tim Sài Gòn.",
    "fullDescription": "Căn hộ loft với trần cao thoáng đãng tại đô thị sinh thái Sala, chỉ mất 5 phút qua hầm Thủ Thiêm là sang ngay trái tim Sài Gòn.\n\nTọa lạc tại Khu đô thị Sala, Mai Chí Thọ, An Lợi Đông, TP. Thủ Đức, TP.HCM, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Khu đô thị Sala, Mai Chí Thọ, An Lợi Đông, TP. Thủ Đức, TP.HCM",
    "maxGuests": 2,
    "bedrooms": 1,
    "beds": 1,
    "bathrooms": 1,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-1": {
    "title": "Amalfi Grand Ocean Pool Villa Phú Quốc",
    "description": "Biệt thự nghỉ dưỡng đẳng cấp 5 sao bên bờ cát trắng mịn như kem của Bãi Khem, hồ bơi vô cực ngắm hoàng hôn biển đảo tráng lệ.",
    "fullDescription": "Biệt thự nghỉ dưỡng đẳng cấp 5 sao bên bờ cát trắng mịn như kem của Bãi Khem, hồ bơi vô cực ngắm hoàng hôn biển đảo tráng lệ.\n\nTọa lạc tại Bãi Khem, Phường An Thới, TP. Phú Quốc, Kiên Giang, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Bãi Khem, Phường An Thới, TP. Phú Quốc, Kiên Giang",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-2": {
    "title": "Đà Lạt Belle Epoque Pine Hill Villa",
    "description": "Dinh thự Pháp cổ giữa đồi thông di sản Trần Hưng Đạo, ngập tràn hoa hồng và cẩm tú cầu, không gian ấm cúng sang trọng cho đại gia đình.",
    "fullDescription": "Dinh thự Pháp cổ giữa đồi thông di sản Trần Hưng Đạo, ngập tràn hoa hồng và cẩm tú cầu, không gian ấm cúng sang trọng cho đại gia đình.\n\nTọa lạc tại Đường Trần Hưng Đạo, Phường 10, TP. Đà Lạt, Lâm Đồng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trần Hưng Đạo, Phường 10, TP. Đà Lạt, Lâm Đồng",
    "maxGuests": 10,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-3": {
    "title": "Hội An Ancient Riverside Pool Villa",
    "description": "Biệt thự phong cách kiến trúc Hội An xưa nép mình bên dòng sông Hoài thơ mộng, hồ bơi xanh mát nép mình dưới rặng cau và giàn hoa giấy.",
    "fullDescription": "Biệt thự phong cách kiến trúc Hội An xưa nép mình bên dòng sông Hoài thơ mộng, hồ bơi xanh mát nép mình dưới rặng cau và giàn hoa giấy.\n\nTọa lạc tại Đường Trần Nhân Tông, Cẩm Châu, TP. Hội An, Quảng Nam, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trần Nhân Tông, Cẩm Châu, TP. Hội An, Quảng Nam",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 3,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-4": {
    "title": "Vũng Tàu Oceanview Luxury Pool Villa",
    "description": "Biệt thự sát biển trên cung đường Trần Phú Vũng Tàu, hồ bơi tràn ngắm hoàng hôn biển lộng gió, trang bị giải trí karaoke bida đỉnh cao.",
    "fullDescription": "Biệt thự sát biển trên cung đường Trần Phú Vũng Tàu, hồ bơi tràn ngắm hoàng hôn biển lộng gió, trang bị giải trí karaoke bida đỉnh cao.\n\nTọa lạc tại Đường Trần Phú, Phường 5, TP. Vũng Tàu, Bà Rịa - Vũng Tàu, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trần Phú, Phường 5, TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
    "maxGuests": 12,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 4,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-5": {
    "title": "Ninh Bình Lotus Garden Valley Villa",
    "description": "Biệt thự sinh thái nép mình bên dãy núi đá vôi kỳ vĩ và đầm sen Tam Cốc, không gian thanh tịnh như lạc vào chốn bồng lai tiên cảnh.",
    "fullDescription": "Biệt thự sinh thái nép mình bên dãy núi đá vôi kỳ vĩ và đầm sen Tam Cốc, không gian thanh tịnh như lạc vào chốn bồng lai tiên cảnh.\n\nTọa lạc tại Khu du lịch Tam Cốc - Bích Động, Hoa Lư, Ninh Bình, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Khu du lịch Tam Cốc - Bích Động, Hoa Lư, Ninh Bình",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-6": {
    "title": "Đà Nẵng Beachfront Horizon Villa",
    "description": "Dinh thự mặt biển sang trọng trên dải resort tỷ đô Đà Nẵng - Hội An, hồ bơi rộng lớn hòa cùng làn nước biển xanh ngát của biển Non Nước.",
    "fullDescription": "Dinh thự mặt biển sang trọng trên dải resort tỷ đô Đà Nẵng - Hội An, hồ bơi rộng lớn hòa cùng làn nước biển xanh ngát của biển Non Nước.\n\nTọa lạc tại Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng",
    "maxGuests": 10,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 5,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-7": {
    "title": "Nha Trang Private Hilltop Pool Villa",
    "description": "Biệt thự đồi An Viên cao cấp nhìn toàn cảnh vịnh Nha Trang và cáp treo vượt biển lung linh, bể bơi riêng tư tuyệt đối cho gia đình.",
    "fullDescription": "Biệt thự đồi An Viên cao cấp nhìn toàn cảnh vịnh Nha Trang và cáp treo vượt biển lung linh, bể bơi riêng tư tuyệt đối cho gia đình.\n\nTọa lạc tại Khu biệt thự An Viên, Vĩnh Nguyên, TP. Nha Trang, Khánh Hòa, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Khu biệt thự An Viên, Vĩnh Nguyên, TP. Nha Trang, Khánh Hòa",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 4,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-8": {
    "title": "Tam Đảo Sky Infinity Pool Villa",
    "description": "Biệt thự hiện đại trên vách núi Tam Đảo sở hữu bể bơi vô cực nước ấm đón biển mây bồng bềnh ùa vào tận hiên nhà.",
    "fullDescription": "Biệt thự hiện đại trên vách núi Tam Đảo sở hữu bể bơi vô cực nước ấm đón biển mây bồng bềnh ùa vào tận hiên nhà.\n\nTọa lạc tại Khu du lịch sinh thái Tam Đảo, Huyện Tam Đảo, Vĩnh Phúc, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Khu du lịch sinh thái Tam Đảo, Huyện Tam Đảo, Vĩnh Phúc",
    "maxGuests": 8,
    "bedrooms": 3,
    "beds": 4,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-9": {
    "title": "Quy Nhơn Emerald Bay Pool Villa",
    "description": "Biệt thự ngọc bích sát biển Ghềnh Ráng Quy Nhơn, lắng nghe tiếng sóng vỗ vào vách đá ngắm nhìn làn nước trong vắt màu ngọc bích.",
    "fullDescription": "Biệt thự ngọc bích sát biển Ghềnh Ráng Quy Nhơn, lắng nghe tiếng sóng vỗ vào vách đá ngắm nhìn làn nước trong vắt màu ngọc bích.\n\nTọa lạc tại Ghềnh Ráng, TP. Quy Nhơn, Bình Định, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Ghềnh Ráng, TP. Quy Nhơn, Bình Định",
    "maxGuests": 6,
    "bedrooms": 3,
    "beds": 3,
    "bathrooms": 3,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  },
  "villa-10": {
    "title": "Sài Gòn Thảo Điền Riverside Mansion",
    "description": "Dinh thự triệu đô ven sông Sài Gòn tại bán đảo Thảo Điền danh giá, sở hữu hồ bơi sinh thái và bến du thuyền riêng tư thượng lưu.",
    "fullDescription": "Dinh thự triệu đô ven sông Sài Gòn tại bán đảo Thảo Điền danh giá, sở hữu hồ bơi sinh thái và bến du thuyền riêng tư thượng lưu.\n\nTọa lạc tại Đường Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP.HCM, nơi đây mang đến không gian nghỉ dưỡng lý tưởng với tầm nhìn tuyệt đẹp, tiện nghi chuẩn mực cùng dịch vụ tận tâm cho kỳ nghỉ hoàn hảo của bạn và gia đình.",
    "location": "Đường Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP.HCM",
    "maxGuests": 12,
    "bedrooms": 4,
    "beds": 5,
    "bathrooms": 5,
    "checkIn": "14:00",
    "checkOut": "12:00",
    "policyNote": "Nhận phòng trực tiếp với lễ tân hoặc chủ nhà. Vui lòng xuất trình CCCD/Hộ chiếu khi nhận phòng.",
    "services": [
      "Dọn phòng hàng ngày theo yêu cầu",
      "Lễ tân hỗ trợ 24/7",
      "Wifi cáp quang tốc độ cao miễn phí",
      "Hỗ trợ tư vấn tour và đặt xe"
    ],
    "bathroom": [
      "Khăn tắm cao cấp mềm mịn",
      "Vòi sen nóng lạnh áp lực cao",
      "Máy sấy tóc công suất lớn",
      "Đồ vệ sinh cá nhân miễn phí"
    ]
  }
};
