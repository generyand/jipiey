import GPACalculator from '@/components/GPACalculator';
import ScrollButtons from '@/components/ScrollButtons';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="container mx-auto py-8">
        <GPACalculator />
        
        {/* Added content to make page scrollable for testing */}
        {/* <div className="mt-20 p-8">
          <h2 className="text-2xl font-bold">Additional Content</h2>
          <p className="my-4">This content is added to ensure the page is scrollable for testing the scroll buttons.</p>
          <div className="h-[50vh]"></div>
          <p className="my-4">Scroll down to see more content...</p>
          <div className="h-[50vh]"></div>
          <p className="mt-4">Bottom of the page reached!</p>
        </div> */}
      </div>
      
      <ScrollButtons 
        className="z-50" 
        buttonClassName="shadow-xl border-2 border-white/20"
        topOffset={200}
      />
    </div>
  );
}
