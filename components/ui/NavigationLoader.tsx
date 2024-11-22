type Props = {
  visible: boolean;
};
const NavigationLoader = ({ visible }: Props) => {
  return (
    <div
      className={`fixed flex inset-0 bg-white z-50 flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>
      <p className="mt-4 text-gray-700">Please Wait</p>
    </div>
  );
};

export default NavigationLoader;
