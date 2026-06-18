import Image from "next/image";

interface TypingIndicatorProps {
  userPhotoUrl?: string;
  userName?: string;
  showAvatar?: boolean;
}

export default function TypingIndicator({
  userPhotoUrl,
  userName,
  showAvatar = true,
}: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="flex w-fit max-w-[75%] gap-1.5">
        {showAvatar ? (
          userPhotoUrl ? (
            <div className="relative mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-neutral-200">
              <Image
                src={userPhotoUrl}
                alt={userName ?? "Contact"}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
          ) : (
            <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-neutral-200" />
          )
        ) : (
          <div className="mt-0.5 h-6 w-6 shrink-0" />
        )}

        <div className="w-fit">
          {userName ? (
            <p className="mb-0.5 text-[11px] font-medium text-black/55">{userName}</p>
          ) : null}
          <div className="w-fit rounded-xl bg-black/5 px-4 py-3">
            <div className="flex items-center gap-1.5" aria-label="En train d'écrire">
              <span className="typing-dot typing-dot-1" />
              <span className="typing-dot typing-dot-2" />
              <span className="typing-dot typing-dot-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
