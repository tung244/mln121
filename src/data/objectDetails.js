export const getObjectDetail = (category, year) => {
    // Determine historical period based on year
    let period = '1986';
    if (year >= 1991 && year < 2001) period = '1991';
    else if (year >= 2001 && year < 2011) period = '2001';
    else if (year >= 2011 && year < 2021) period = '2011';
    else if (year >= 2021) period = '2021';

    const library = {
        store: {
            '1986': {
                title: 'Cửa Hàng Mậu Dịch Quốc Doanh',
                desc: 'Hàng hóa khan hiếm, phân phối qua tem phiếu. Người dân phải xếp hàng dài từ mờ sáng. Cảnh mua bán diễn ra trầm lắng dưới sự quản lý chặt chẽ của nhà nước.',
                icon: '🏪'
            },
            '1991': {
                title: 'Cửa Hàng Tư Nhân & Chợ Trời',
                desc: 'Xóa bỏ tem phiếu, cơ chế thị trường hé mở. Hàng hóa đa dạng hơn, bắt đầu xuất hiện các tiệm tạp hóa tư nhân nhỏ lẻ rộn ràng tiếng mua bán.',
                icon: '🛒'
            },
            '2001': {
                title: 'Siêu Thị & Trung Tâm Thương Mại',
                desc: 'Làn sóng hội nhập WTO mang theo các chuỗi siêu thị hiện đại, cửa hàng tiện lợi bắt đầu mọc lên, thay đổi hoàn toàn thói quen tiêu dùng.',
                icon: '🛍️'
            },
            '2011': {
                title: 'Cửa Hàng Tiện Lợi & Thương Mại Điện Tử',
                desc: 'Sự bùng nổ của smartphone kéo theo các ứng dụng giao hàng, mua sắm online. Cửa hàng truyền thống bắt đầu chuyển đổi số mạnh mẽ.',
                icon: '📦'
            },
            '2021': {
                title: 'Cửa Hàng Thông Minh Không Tiền Mặt',
                desc: 'Thanh toán quét mã QR, mua sắm qua livestream, AI tư vấn bán hàng. Không gian mua sắm giờ đây là sự kết hợp giữa thực và ảo.',
                icon: '💎'
            }
        },
        vehicle: {
            '1986': {
                title: 'Xe Đạp Thống Nhất & Xe Cub Cũ',
                desc: 'Phương tiện di chuyển chủ yếu là xe đạp. Những chiếc xe máy Honda Cub 50 là cả một gia tài lớn đối với bất kỳ gia đình nào.',
                icon: '🚲'
            },
            '1991': {
                title: 'Thời Kỳ Bùng Nổ Xe Máy',
                desc: 'Làn sóng xe máy từ Nhật Bản (Honda Dream, Wave...) bắt đầu tràn vào, thay thế xe đạp và trở thành biểu tượng của sự dư dả, thành đạt.',
                icon: '🛵'
            },
            '2001': {
                title: 'Xe Hơi Cá Nhân Chớm Xuất Hiện',
                desc: 'Kinh tế phát triển, đường phố mở rộng. Xe hơi cá nhân không còn là điều quá xa xỉ, kéo theo sự thay đổi về quy hoạch giao thông bến bãi.',
                icon: '🚗'
            },
            '2011': {
                title: 'Xe Công Nghệ & Cao Tốc',
                desc: 'Grab, Uber thay thế taxi truyền thống. Cao tốc được xây dựng liên tục, kết nối các vùng miền kinh tế trọng điểm.',
                icon: '🚕'
            },
            '2021': {
                title: 'Xe Điện VinFast & Metro',
                desc: 'Kỷ nguyên xe điện thông minh, thân thiện với môi trường do chính người Việt sản xuất. Hệ thống đường sắt trên cao (Metro) giải quyết bài toán kẹt xe.',
                icon: '🚄'
            }
        },
        road: {
            '1986': {
                title: 'Đường Nhựa Xuống Cấp, Ít Đèn Đỏ',
                desc: 'Đường phố nhỏ hẹp, nhiều ổ gà. Đèn giao thông hiếm hoi và buổi tối thường rất tối do thiếu lưới điện hạ thế.',
                icon: '🛣️'
            },
            '1991': {
                title: 'Nâng Cấp Hạ Tầng Đô Thị',
                desc: 'Nhà nước tập trung rải nhựa lại các tuyến đường huyết mạch. Cột điện và dây điện giăng mắc chằng chịt bắt đầu xuất hiện khắp nơi.',
                icon: '🚧'
            },
            '2001': {
                title: 'Đại Lộ Mênh Mông',
                desc: 'Quy hoạch lại thủ đô, các đại lộ lớn được xây dựng. Đường sá bắt đầu phải đối mặt với áp lực kẹt xe giờ cao điểm do lượng xe máy tăng đột biến.',
                icon: '🛣️'
            },
            '2011': {
                title: 'Hạ Tầng Giao Thông Đa Tầng',
                desc: 'Cầu vượt thép, hầm chui, cao tốc quy mô lớn được khánh thành thần tốc, thay đổi diện mạo các đô thị lớn như Hà Nội và TP.HCM.',
                icon: '🌉'
            },
            '2021': {
                title: 'Đô Thị Thông Minh (Smart City)',
                desc: 'Camera AI giám sát và điều phối giao thông tự động. Vỉa hè được quy hoạch xanh sạch đẹp, đường xá tích hợp sạc điện cho xe EV.',
                icon: '🚥'
            }
        },
        person: {
            '1986': {
                title: 'Trang Phục Giản Dị, Đồng Điệu',
                desc: 'Người dân thường mặc quần áo màu sắc tối giản (xanh công nhân, bộ đội, áo trắng). Đời sống còn nhiều lo toan, vất vả.',
                icon: '👔'
            },
            '1991': {
                title: 'Đa Dạng Hóa Lối Sống',
                desc: 'Văn hóa phương Tây du nhập. Giới trẻ bắt đầu mặc quần jeans, áo thun màu sắc. Đời sống tinh thần phong phú hơn.',
                icon: '👕'
            },
            '2001': {
                title: 'Phong Cách Thời Trang Tự Do',
                desc: 'Người dân mua sắm quần áo theo xu hướng đa quốc gia. Nhịp sống công sở và giải trí trở nên năng động, hối hả hơn.',
                icon: '👗'
            },
            '2011': {
                title: 'Kết Nối Số',
                desc: 'Bất cứ ai cũng có smartphone trên tay. Đám đông trên đường thường vừa đi vừa nhìn màn hình. Thông tin lan truyền với tốc độ ánh sáng.',
                icon: '📱'
            },
            '2021': {
                title: 'Công Dân Toàn Cầu',
                desc: 'Chất lượng sống nâng cao, mọi người quan tâm đến sức khỏe, môi trường và cân bằng công việc. Thời trang đề cao sự thoải mái và cá tính riêng.',
                icon: '🧑'
            }
        }
    };

    return library[category]?.[period] || null;
}
