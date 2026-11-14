// Configuração dinâmica: recebe o app.json e injeta o hash do commit,
// exibido na tela "Sobre o App" (exigência da publicação no Firebase).
const { execSync } = require('child_process');

function obterHashDoCommit() {
  // No EAS Build a variável já vem preenchida com o commit do build.
  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    return process.env.EAS_BUILD_GIT_COMMIT_HASH.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'desenvolvimento';
  }
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    commitHash: obterHashDoCommit(),
  },
});
