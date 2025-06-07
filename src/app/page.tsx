import GPACalculator from '@/components/GPACalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="container mx-auto py-8">
        <GPACalculator />
      </div>
    </div>
  );
}
