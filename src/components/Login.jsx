import { signIn } from "@junobuild/core";
import { Button } from "./Button";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useEffect, useState } from "react";

export const Login = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-32 h-32">
          <DotLottieReact
            src="/animation.lottie"
            autoplay
            loop
          />
        </div>
        <p className="text-black text-xl">Checking credentials...</p>
      </div>
    );
  }

  return <Button onClick={signIn}>Sign in</Button>;
};
