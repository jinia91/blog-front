'use client'
import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function SwiperCarousel (): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        loop={true}
      >
        <SwiperSlide>
          <div className="h-64 bg-blue-500 flex items-center justify-center text-white text-xl">
            Slide 1
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="h-64 bg-red-500 flex items-center justify-center text-white text-xl">
            Slide 2
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="h-64 bg-green-500 flex items-center justify-center text-white text-xl">
            Slide 3
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="h-64 bg-yellow-500 flex items-center justify-center text-white text-xl">
            Slide 4
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  )
}
