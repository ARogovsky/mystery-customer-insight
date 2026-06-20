import { test as teardown } from '@playwright/test';

// БД тестов — PGLite в памяти pglite-server, она исчезает при остановке dev-сервера,
// поэтому отдельная очистка не нужна. Файл существует, чтобы проект `teardown`
// (на который ссылается `setup`) был валиден.
teardown('noop teardown', async () => {
  // intentionally empty
});
