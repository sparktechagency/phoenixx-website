import Image from 'next/image';
import React from 'react';

const Banner = () => {
    return (
       <>
        <div className="w-full relative px-3 sm:p-6">
            <Image 
                src={"/images/banner.png"} 
                width={100} 
                height={100} 
                alt='website banner'
                className="w-full h-auto"
                layout="responsive"
            />
        </div>
       </>
    );
};

export default Banner;