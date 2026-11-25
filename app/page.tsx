import IntroSpacer from "./components/IntroSpacer";
import GallerySlider from "./components/GallerySlider";
import SlideSizeTweaks from "./components/SlideSizeTweaks";

export default function Home() {
  return (
    <>
      <SlideSizeTweaks />
      <IntroSpacer />
      <div className="flex flex-1 items-center justify-center">
        <GallerySlider />
      </div>
      <div className="flex h-screen w-full items-center justify-center text-7xl font-bold">
        spacer
      </div>
    </>
  );
}
