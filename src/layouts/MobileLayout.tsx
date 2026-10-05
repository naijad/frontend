interface Props {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: Props) {
  return (
    <div className="landing-layout flex min-h-screen justify-center bg-slate-100">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
