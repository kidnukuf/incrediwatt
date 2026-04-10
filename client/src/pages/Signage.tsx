import { useEffect, useRef, useState } from "react";

const SLIDES = [
  // Origin Story — 3 slides
  {
    id: "story-1",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_story_1-FYhUP8wGrghwiBsuU8sBNs.png",
    duration: 10000,
  },
  // Video: restaurant footage 1
  {
    id: "vid-1",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011602_fe6ec497.mp4",
    duration: 15000,
  },
  {
    id: "story-2",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_story_2-8EpprZCh4HENGVeLDebY59.png",
    duration: 10000,
  },
  // Video: restaurant footage 2
  {
    id: "vid-2",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011603_65dd56af.mp4",
    duration: 12000,
  },
  {
    id: "story-3",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_story_3-JCWkGvnEH77VeDksdKeCCV.png",
    duration: 10000,
  },
  // Street Tacos
  {
    id: "street-tacos",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_street_tacos-m7qPBeLV54nfuR2c8gugEE.png",
    duration: 10000,
  },
  // Video: food footage 3
  {
    id: "vid-3",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011605_91615fe3.mp4",
    duration: 15000,
  },
  // Taco Tuesday
  {
    id: "taco-tuesday",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_taco_tuesday-B4Rr5HWgo2zmELwzFqvfCF.png",
    duration: 10000,
  },
  // Video: food footage 4
  {
    id: "vid-4",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011606_0d852c0b.mp4",
    duration: 15000,
  },
  // Cheese Enchiladas
  {
    id: "enchiladas",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_enchiladas-JogGQVFATShNT57exDA2do.png",
    duration: 10000,
  },
  // Review Request with QR codes (user-provided card image)
  {
    id: "reviews",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/review_qr_card_7b806831.png",
    duration: 20000,
  },
  // Video: food footage 5
  {
    id: "vid-5",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011607_fdd47dd5.mp4",
    duration: 15000,
  },
  // Prime Rib Dinner
  {
    id: "prime-rib",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_prime_rib-b6ZBMT94tW64ckMqsQahrz.png",
    duration: 10000,
  },
  // Video: food footage 6
  {
    id: "vid-6",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011608_d40fdc87.mp4",
    duration: 12000,
  },
  // Happy Hour
  {
    id: "happy-hour",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_happy_hour-cQ5fgLqq9Db4wtRimYf4Wq.png",
    duration: 10000,
  },
  // 4/20 Weekend
  {
    id: "420-event",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_420_event-m7JzpkkfiBKpSa3fQ3AYe3.png",
    duration: 10000,
  },
  // Video: food footage 7
  {
    id: "vid-7",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011609_8bf61c0e.mp4",
    duration: 15000,
  },
  // Border Boost and Brew™ Grand Opening Ad
  {
    id: "bbb-grand-opening",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_bbb_grand_opening-DViYa2hT5Cqnpx8NdmwreH.png",
    duration: 12000,
  },
  // Video: food footage 8
  {
    id: "vid-8",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011610_890203c4.mp4",
    duration: 12000,
  },
  // 2-Year Anniversary
  {
    id: "anniversary",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_anniversary-4Dtdc8iiRt53CwNTgKFVqQ.png",
    duration: 10000,
  },
  // Cinco de Mayo
  {
    id: "cinco",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_cinco-XtGoxPYZWzjD3SPNi5vaGo.png",
    duration: 10000,
  },
  // Video: food footage 9
  {
    id: "vid-9",
    type: "video",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/1000011611_f23ef9bc.mp4",
    duration: 15000,
  },
  // Border Boost and Brew™ original ad (second BBB slot)
  {
    id: "bbb-ad",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/signage_bbb_ad-KtV4CmkbP8WFjedHNLMKpU.png",
    duration: 10000,
  },
  // Burger Ad
  {
    id: "burger-ad",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/img_burger_ad_276c62af.png",
    duration: 12000,
  },
  // Catering & Private Events
  {
    id: "catering",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/img_catering_71a1de98.png",
    duration: 12000,
  },
  // Review Request again (shown twice per loop)
  {
    id: "reviews-2",
    type: "image",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/review_qr_card_7b806831.png",
    duration: 20000,
  },
];

const QR_CODES = [
  {
    platform: "Facebook",
    handle: "Sopris Restaurant",
    url: "https://www.facebook.com/profile.php?id=1099719276547374",
    qr: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/qr_facebook_73553a70.png",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    platform: "Google",
    handle: "Sopris Restaurant Jackpot NV",
    url: "https://share.google/vWRZNQ1AVWwxkufnq",
    qr: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/qr_google_98d78bd1.png",
    color: "#4285F4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    platform: "Yelp",
    handle: "Sopris Restaurant",
    url: "https://share.google/vC0dQ8znjelJBJ6Do",
    qr: "https://d2xsxph8kpxj0f.cloudfront.net/118351434/CyaqFioxWNTNQC4ZpfULjM/qr_yelp_2cd82d85.png",
    color: "#D32323",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current text-[#D32323]">
        <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-2.447-3.827l-.633-1.032c-.244-.37-.199-.868.104-1.229.297-.354.78-.49 1.205-.34l1.13.4c3.561 1.26 3.815 1.386 3.961 1.51.265.216.354.543.259.761zM12.9 14.99c-.031.459-.356.842-.8.944l-1.179.271c-3.708.852-3.981.88-4.166.862-.334-.033-.602-.24-.697-.533-.067-.206-.036-.44.439-4.456l.15-1.233c.057-.448.408-.8.868-.868.453-.067.888.167 1.085.576l.55 1.1c1.733 3.476 1.823 3.744 1.795 4.337zm7.274-4.413c-.088.925-2.508 2.919-3.44 3.181-.32.09-.618.029-.831-.169-.14-.131-.257-.368-1.54-3.937l-.399-1.1c-.154-.425-.003-.907.37-1.174.366-.261.861-.271 1.237-.025l1.024.659c3.226 2.078 3.455 2.232 3.58 2.38.22.26.27.617.199.885zM11.08 11.61c.016.46-.265.882-.7 1.043l-1.14.421c-3.585 1.325-3.856 1.396-4.044 1.364-.33-.055-.585-.278-.658-.576-.051-.205-.004-.441 1.097-4.325l.337-1.207c.13-.44.519-.757.979-.768.453-.011.862.276 1.014.703l.43 1.167c1.357 3.676 1.42 3.952 1.685 4.178zm-.68-7.31c.162.924-.924 3.756-1.604 4.376-.234.213-.519.286-.785.2-.175-.056-.395-.2-2.87-2.923l-.787-.9c-.295-.327-.327-.807-.079-1.178.24-.358.678-.527 1.098-.42l1.175.299c3.7.941 3.962 1.056 4.118 1.197.264.236.337.578.234.849z" />
      </svg>
    ),
  },
];

function ReviewsSlide() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#8B1A1A] via-[#6B1414] to-[#3D0C0C] px-16 py-10">
      <div className="text-center mb-10">
        <h1 className="text-6xl font-black text-[#FFD700] drop-shadow-lg tracking-wide mb-3">
          LOVED YOUR MEAL?
        </h1>
        <p className="text-2xl text-white/90 font-medium">
          Your review helps our family restaurant grow. Thank you! ❤️
        </p>
      </div>
      <div className="grid grid-cols-3 gap-10 w-full max-w-5xl">
        {QR_CODES.map((item) => (
          <div
            key={item.platform}
            className="flex flex-col items-center bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
          >
            <div className="mb-3">{item.icon}</div>
            <p className="text-xl font-bold text-white mb-1">{item.platform}</p>
            <p className="text-sm text-white/70 mb-4 text-center">{item.handle}</p>
            <img
              src={item.qr}
              alt={`QR code for ${item.platform}`}
              className="w-36 h-36 rounded-lg bg-white p-2"
            />
            <p className="text-sm text-[#FFD700] mt-3 font-semibold">Scan to Review</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-white/60 text-lg">
        Sopris Restaurant | 1702 US-93, Jackpot, NV
      </div>
    </div>
  );
}

function VideoSlide({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      loop
    />
  );
}

export default function Signage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentSlide = SLIDES[currentIndex];

  useEffect(() => {
    const duration = currentSlide.duration;
    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        setIsTransitioning(false);
      }, 600);
    }, duration - 600);
    return () => clearTimeout(timer);
  }, [currentIndex, currentSlide.duration]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Slide content */}
      <div
        className="w-full h-full transition-opacity duration-500"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {currentSlide.type === "image" && (
          <img
            src={(currentSlide as { src: string }).src}
            alt="Signage slide"
            className="w-full h-full object-cover"
          />
        )}
        {currentSlide.type === "video" && (
          <VideoSlide src={(currentSlide as { src: string }).src} />
        )}
        {currentSlide.type === "reviews" && <ReviewsSlide />}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center max-w-lg">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === currentIndex ? "#FFD700" : "rgba(255,255,255,0.3)",
              transform: i === currentIndex ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
