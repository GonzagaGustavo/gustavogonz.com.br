/* eslint-disable @typescript-eslint/no-require-imports */
const { exec } = require('node:child_process');

let x = 0;
let date = Date.now();

function checkPostgres() {
  exec('docker exec postgres-dev pg_isready --host localhost', handleReturn);

  function handleReturn(_err: any, stdout: string) {
    function makeLoading() {
      if (Date.now() - date > 200) {
        const P = ['\\', '|', '/', '-'];

        process.stdout.write('\r' + P[x++]);

        x &= 3;
        date = Date.now();
      }
    }

    if (stdout.search('accepting connections') === -1) {
      makeLoading();

      checkPostgres();
      return;
    }

    process.stdout.write('\n🟢 Postgres is ready and accepting connections!\n');
  }
}

console.log('🔴 Waiting postgres accept connections');

checkPostgres();
