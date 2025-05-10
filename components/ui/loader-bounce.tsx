const LoaderBounce = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <div
      key={index}
      className="w-2 h-2 rounded-full bg-orange-600 animate-bounce"
      style={{
        animationDelay: `${index * 0.2}s`,
        animationDuration: `0.8s`, // Optional override
      }}
    />
  ));
};

export default LoaderBounce;
