/**
 * Dữ liệu kinh tế Việt Nam theo từng kỳ Đại hội (1986–2026)
 * Nguồn tham khảo: Tổng cục Thống kê, IMF, World Bank
 */

export const CONGRESSES = [
    { year: 1986, name: "Đại hội VI", label: "VI" },
    { year: 1991, name: "Đại hội VII", label: "VII" },
    { year: 1996, name: "Đại hội VIII", label: "VIII" },
    { year: 2001, name: "Đại hội IX", label: "IX" },
    { year: 2006, name: "Đại hội X", label: "X" },
    { year: 2011, name: "Đại hội XI", label: "XI" },
    { year: 2016, name: "Đại hội XII", label: "XII" },
    { year: 2021, name: "Đại hội XIII", label: "XIII" },
    { year: 2026, name: "Đại hội XIV", label: "XIV" },
]

export const ECONOMIC_DATA = {
    1986: {
        inflation: 774.7,
        gdpGrowth: -2.0,
        exportBillion: 0.4,
        fdi: 0,
        povertyRate: 75,
        headline: "Khủng hoảng bao cấp — Lạm phát phi mã",
        description:
            "Nền kinh tế kế hoạch hóa tập trung bước vào giai đoạn khủng hoảng trầm trọng. Lạm phát vượt 700%, hàng hóa khan hiếm, tem phiếu chi phối đời sống.",
        color: "#ff2200",
        era: 0,
    },
    1991: {
        inflation: 67.5,
        gdpGrowth: 6.0,
        exportBillion: 2.1,
        fdi: 0.4,
        povertyRate: 58,
        headline: "Bứt phá đầu tiên — Kinh tế nhiều thành phần",
        description:
            "Cơ chế thị trường bước đầu phát huy. Lạm phát được kiểm soát, xuất khẩu gạo lần đầu đạt 1 triệu tấn. FDI bắt đầu chảy vào.",
        color: "#ff7700",
        era: 0.15,
    },
    1996: {
        inflation: 4.5,
        gdpGrowth: 9.3,
        exportBillion: 7.3,
        fdi: 8.6,
        povertyRate: 37,
        headline: "Thập kỷ vàng — Tăng trưởng cao nhất lịch sử",
        description:
            "GDP đạt 9.3% — kỷ lục lịch sử. Bình thường hóa quan hệ Mỹ–Việt (1995), gia nhập ASEAN. Xuất hiện xe máy và chợ dân sinh khắp nơi.",
        color: "#ffcc00",
        era: 1,
    },
    2001: {
        inflation: -0.4,
        gdpGrowth: 7.5,
        exportBillion: 15.0,
        fdi: 3.1,
        povertyRate: 29,
        headline: "Hội nhập sâu — Ký BTA Mỹ–Việt",
        description:
            "Hiệp định Thương mại Song phương với Hoa Kỳ có hiệu lực. Xuất khẩu tăng vọt. Xe máy trở thành phương tiện phổ biến nhất cả nước.",
        color: "#88dd00",
        era: 1.5,
    },
    2006: {
        inflation: 7.5,
        gdpGrowth: 8.2,
        exportBillion: 39.8,
        fdi: 12.0,
        povertyRate: 16,
        headline: "Bùng nổ hội nhập — Gia nhập WTO",
        description:
            "Việt Nam chính thức vào WTO (2007). Đô thị hóa mạnh, nhà cao tầng mọc lên khắp nơi, ô tô cá nhân bắt đầu phổ biến.",
        color: "#00cc88",
        era: 2,
    },
    2011: {
        inflation: 18.6,
        gdpGrowth: 6.2,
        exportBillion: 96.9,
        fdi: 11.0,
        povertyRate: 12,
        headline: "25 năm Đổi Mới — Nền tảng công nghiệp vững chắc",
        description:
            "25 năm Đổi Mới: GDP tăng gấp 30 lần, XK gần 100 tỉ USD. Samsung, Intel đầu tư lớn. Smartphone bắt đầu thay đổi lối sống.",
        color: "#00aaff",
        era: 2.5,
    },
    2016: {
        inflation: 4.74,
        gdpGrowth: 6.2,
        exportBillion: 176.6,
        fdi: 15.8,
        povertyRate: 6.7,
        headline: "Kỷ nguyên số — Kinh tế chia sẻ bùng nổ",
        description:
            "Grab, Shopee, Tiki thay đổi cách người Việt mua sắm và di chuyển. Startup ecosystem hình thành. 4G phủ sóng toàn quốc, smartphone khắp nơi.",
        color: "#4488ff",
        era: 3,
    },
    2021: {
        inflation: 1.84,
        gdpGrowth: 2.6,
        exportBillion: 336.0,
        fdi: 19.7,
        povertyRate: 3.4,
        headline: "Chuyển đổi số — Vượt COVID bằng công nghệ",
        description:
            "COVID-19 thúc đẩy chuyển đổi số mạnh mẽ. Làm việc từ xa, học online, thanh toán số bùng nổ. Xuất khẩu công nghệ vượt 100 tỉ USD.",
        color: "#8855ff",
        era: 3.5,
    },
    2026: {
        inflation: 3.5,
        gdpGrowth: 6.8,
        exportBillion: 450.0,
        fdi: 25.0,
        povertyRate: 1.8,
        headline: "Đại hội XIV — Kỷ nguyên xanh & thông minh",
        description:
            "Xe điện VinFast tràn đường phố. Metro Hà Nội & TP.HCM vận hành. Năng lượng tái tạo chiếm 30% sản lượng. Việt Nam — trung tâm bán dẫn Đông Nam Á.",
        color: "#00ffcc",
        era: 4,
    },
}

/** Nội suy tuyến tính giữa 2 mốc thời gian */
export function getInterpolatedData(year) {
    const years = Object.keys(ECONOMIC_DATA).map(Number).sort((a, b) => a - b)

    if (year <= years[0]) return ECONOMIC_DATA[years[0]]
    if (year >= years[years.length - 1]) return ECONOMIC_DATA[years[years.length - 1]]

    let lo = years[0], hi = years[1]
    for (let i = 0; i < years.length - 1; i++) {
        if (year >= years[i] && year <= years[i + 1]) {
            lo = years[i]; hi = years[i + 1]; break
        }
    }

    const t = (year - lo) / (hi - lo)
    const d0 = ECONOMIC_DATA[lo]
    const d1 = ECONOMIC_DATA[hi]
    const lerp = (a, b) => a + (b - a) * t

    return {
        inflation: lerp(d0.inflation, d1.inflation),
        gdpGrowth: lerp(d0.gdpGrowth, d1.gdpGrowth),
        exportBillion: lerp(d0.exportBillion, d1.exportBillion),
        fdi: lerp(d0.fdi, d1.fdi),
        povertyRate: lerp(d0.povertyRate, d1.povertyRate),
        headline: t < 0.5 ? d0.headline : d1.headline,
        description: t < 0.5 ? d0.description : d1.description,
        color: d0.color,
        era: lerp(d0.era, d1.era),
    }
}

export const ALL_CHART_LABELS = Object.keys(ECONOMIC_DATA)
export const ALL_INFLATION = Object.values(ECONOMIC_DATA).map((d) => d.inflation)
export const ALL_GDP = Object.values(ECONOMIC_DATA).map((d) => d.gdpGrowth)
export const ALL_EXPORT = Object.values(ECONOMIC_DATA).map((d) => d.exportBillion)
