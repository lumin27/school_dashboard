const Loader = () => {
  return (
    <div className='min-h-[200px] w-full flex items-center justify-center'>
      <div className='flex justify-center gap-2 items-center'>
        <div className='w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin' />
        <span className='text-gray-700 text-sm'>Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
