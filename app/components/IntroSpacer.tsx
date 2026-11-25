export default function IntroSpacer() {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          слайдер демо
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Embla-слайдер с размером от файла
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Горизонтальная галерея на Embla Carousel: картинки и видео в одном
          потоке. Ширина слайда берётся из медиа и упирается в общий потолок.
          Loop сохраняет отступы, активный слайд по центру.
        </p>
      </div>

      <ul className="grid w-full max-w-3xl gap-4 text-left sm:grid-cols-2">
        <li className="rounded-2xl border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Размер от файла
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Слайд с flex: 0 0 auto подстраивается под медиа. Ширина не больше
            min(85vw, 960px), высота — min(70vh, 640px). Панорама остаётся
            широкой, портрет — узким, без пустых полос.
          </p>
        </li>
        <li className="rounded-2xl border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Видео с превью
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            До старта меряем превью и ставим video aspect-ratio, чтобы коробка
            не прыгала. Пока ролик вне viewport — poster и размытый фон; src
            ставится через DOM после Intersection Observer и фейковой задержки.
          </p>
        </li>
        <li className="rounded-2xl border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Embla spacing
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Вместо CSS gap — padding-left на слайде и отрицательный margin на
            контейнере, чтобы отступ не пропадал между последним и первым при
            loop.
          </p>
        </li>
        <li className="rounded-2xl border border-zinc-200 bg-white/70 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            Скролл-тест
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Блоки сверху и снизу имитируют длинную страницу — удобно проверить
            lazy-load видео при появлении секции в зоне видимости.
          </p>
        </li>
      </ul>

      <p className="text-sm text-zinc-500">листай вниз →</p>
    </section>
  );
}
