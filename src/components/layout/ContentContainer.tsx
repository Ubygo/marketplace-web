import { MAX_CONTENT_WIDTH } from "@/constants/theme";

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ContentContainer({
  children,
  className = "",
}: ContentContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-6 sm:px-8 lg:px-10 ${className}`}
      style={{ maxWidth: MAX_CONTENT_WIDTH }}
    >
      {children}
    </div>
  );
}
