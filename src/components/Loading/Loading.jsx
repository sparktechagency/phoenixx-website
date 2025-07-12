import './Loading.css';

const Loading = () => {
  return (
    <div className="flex justify-center items-center">
      <svg className='loading-svg' viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  );
};

export default Loading;