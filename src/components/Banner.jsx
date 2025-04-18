import { useSilderQuery } from '@/features/report/reportApi';
import React, { useState, useEffect } from 'react';
import { baseURL } from '../../utils/BaseURL';

const CarouselBanner = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const {data } = useSilderQuery();
  
  const bannerItems = [
    {
      imagePath: "/images/banner.png"
    },
    {
      imagePath: "/images/banner.png"
    },
    {
      imagePath: "/images/banner.png"
    }
  ];

  // Handle slide transition
  const handleSlideChange = (newIndex) => {
    if (isTransitioning) return;
    
    setPrevSlide(activeSlide);
    setIsTransitioning(true);
    setActiveSlide(newIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  useEffect(() => {
    // Auto-slide every 2 seconds, regardless of transition state
    const interval = setInterval(() => {
      const nextSlide = activeSlide === data?.data.length - 1 ? 0 : activeSlide + 1;
      
      setPrevSlide(activeSlide);
      setActiveSlide(nextSlide);
      setIsTransitioning(true);
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700);
      
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [activeSlide]);

  // Calculate transition direction
  const getTransitionDirection = (current, previous) => {
    if (current === previous) return '';
    
    // Handle wrap-around case
    if (current === 0 && previous === data?.data?.length - 1) return 'right';
    if (current === data?.data?.length - 1 && previous === 0) return 'left';
    
    return current > previous ? 'right' : 'left';
  };

  const direction = getTransitionDirection(activeSlide, prevSlide);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-xl sm:my-2">
      {/* Carousel slides */}
      {data?.data?.map((item, index) => {
        // Determine slide animation classes
        let positionClass = '';
        let opacityClass = '';
        
        if (index === activeSlide) {
          opacityClass = 'opacity-100';
          positionClass = direction === 'right' ? 'translate-x-0' : direction === 'left' ? 'translate-x-0' : '';
        } else if (index === prevSlide && isTransitioning) {
          opacityClass = 'opacity-0';
          positionClass = direction === 'right' ? '-translate-x-full' : direction === 'left' ? 'translate-x-full' : '';
        } else {
          opacityClass = 'opacity-0';
        }
        
        return (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform ${opacityClass} ${positionClass}`}
          >
            {/* Banner image with subtle zoom effect */}
            <div className="absolute inset-0 w-full h-full  px-3 sm:px-10 rounded-xl overflow-hidden">
              <img 
                src={`${baseURL}${item.image}`} 
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover rounded-xl transition-transform duration-5000 ease-out"
                style={{ transform: index === activeSlide ? 'scale(1.01)' : 'scale(1)' }}
              />
            </div>
          </div>
        );
      })}
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center rounded-xl space-x-3">
        {data?.data?.map((_, index) => (
         data?.data?.length === 1 ? "" :  <button
         key={index}
         onClick={() => handleSlideChange(index)}
         className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'}`}
         aria-label={`Go to slide ${index + 1}`}
       />
        ))}
      </div>
    </div>
  );
};

export default CarouselBanner;