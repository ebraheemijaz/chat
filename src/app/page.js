import Image from 'next/image';
import Button from './components/Button';

export default function HomePage() {
  return (
    <div className="w-full text-center flex flex-col items-center justify-center min-h-screen">
      {/* GIF Section */}
      <div className="flex justify-center mb-8">
        <Image
          src="/csb-1.gif" // Replace with your actual GIF path in the `public` folder
          alt="Animated coursebuddy banner"
          width={400} // Adjust width as needed
          height={300} // Adjust height as needed
        />
      </div>

      {/* Header Section */}
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Get advice, share your experience</h2>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        { /* <Button href="/browseprofiles">Browse Profiles</Button> */}
           <Button href="/learnmore">Learn More</Button>
        </div>
      </div>
    </div>
  );
}
