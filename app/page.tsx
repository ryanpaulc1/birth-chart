import InputForm from "@/components/InputForm";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Golden gradient glow at bottom - mostly cut off */}
      <div
        className="fixed left-1/2 -translate-x-1/2 w-[523px] h-[523px] pointer-events-none"
        style={{
          bottom: '-350px',
          background: 'radial-gradient(circle, rgba(208, 209, 201, 0.9) 0%, rgba(208, 209, 201, 0.6) 25%, rgba(208, 209, 201, 0.3) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-md w-full relative z-10">
        <h1 className="text-4xl md:text-6xl text-cream text-center mb-8">
          Birth Chart
        </h1>
        <p className="text-center text-white/80 mb-8">
          Enter your birth details to discover your astrological chart
        </p>
        <InputForm />
      </div>
    </main>
  );
}
