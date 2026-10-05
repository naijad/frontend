import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { useNavigate } from "react-router-dom";

import Slide1 from "../Onboarding/onboarding1.png";
import Slide2 from "../Onboarding/onboarding2.png";
import Slide3 from "../Onboarding/onboarding3.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    image: Slide1,
    title: "Manage Your Money",
    text: "Track your spending, income and savings effortlessly.",
  },
  {
    image: Slide2,
    title: "Transfer Instantly",
    text: "Send money to friends and family in seconds.",
  },
  {
    image: Slide3,
    title: "Secure Banking",
    text: "Your funds are protected with bank-level encryption.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative h-screen overflow-hidden bg-[#F7F8FF]">

      {/* Floating Background */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#6D5EF8]/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#6D5EF8]/10 blur-3xl"></div>

      {/* Skip */}
      {active !== 2 && (
        <button
          onClick={() => navigate("/login")}
          className="absolute top-8 right-6 z-50 text-[#6D5EF8] font-bold"
        >
          Skip
        </button>
      )}

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        modules={[Pagination]}
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setActive(swiper.activeIndex)}
        className="h-full"
      >
        {slides.map((item) => (
          <SwiperSlide key={item.title}>

            <div className="flex h-full flex-col items-center justify-center px-8">

              <motion.div
                initial={{ opacity: 0, y: 40, scale: .9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: .5 }}
                className="flex h-64 w-64 items-center justify-center rounded-[38px] bg-white shadow-xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-52 w-52 object-contain"
                />
              </motion.div>

              <h1 className="mt-10 text-center text-4xl font-black text-gray-800">
                {item.title}
              </h1>

              <p className="mt-4 max-w-[310px] text-center text-lg leading-8 text-gray-500">
                {item.text}
              </p>

            </div>

          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom Button */}
      <div className="absolute bottom-10 left-0 right-0 z-50 px-8">

        {active === 2 ? (
          <button
            onClick={() => navigate("/login")}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D5EF8] to-[#5A49F5] text-lg font-bold text-white shadow-xl transition hover:scale-[1.02]"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D5EF8] to-[#5A49F5] text-lg font-bold text-white shadow-xl transition hover:scale-[1.02]"
          >
            Next
          </button>
        )}

      </div>

    </div>
  );
}