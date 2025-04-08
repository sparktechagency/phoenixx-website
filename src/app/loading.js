import { Spin } from 'antd';
import React from 'react';

const loading = () => {
    return (
        <div className='h-screen flex items-center justify-center'>
            <Spin />
        </div>
    );
};

export default loading;