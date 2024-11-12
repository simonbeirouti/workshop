import { initSatellite } from "@junobuild/core";
import { useEffect } from "react";
import { Auth } from "./components/Auth";
import { Footer } from "./components/Footer";
import { Lobby } from "./components/Lobby";
import { Header } from "./components/Header";

function App() {
  useEffect(() => {
    (async () => {
      await initSatellite();
    })();
  }, []);

  return (
    <>
      <div className="relative isolate min-h-[100dvh]">
        <main className="mx-auto max-w-screen-2xl py-16 px-8 md:px-24 tall:min-h-[calc(100dvh-128px)]">
          <Auth>
            <Header />
            <Lobby />
            <Footer />
          </Auth>
        </main>
      </div>
    </>
  );
}

export default App;
