type Props = {
  children: React.ReactNode;
};

export default function TeknikResimStudyoLayout({ children }: Props) {
  return (
    <div className="flex h-[100svh] max-h-[100svh] min-h-0 w-full flex-col overflow-hidden">
      {children}
    </div>
  );
}
