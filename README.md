# Ressoa · App Mobile

> Matar a larva do Aedes com som antes que a seca vire epidemia.

App em React Native (Expo) da Global Solution 2026/2 (FIAP · CitizenTech). O morador cadastra os aparelhos Ressoa instalados nos recipientes de água guardada, acompanha o status de cada um (bateria, temperatura da água e pulso diário), vê o nível de risco de dengue do bairro e recebe uma orientação gerada por IA. O gestor da vigilância vê todos os aparelhos e recebe um plano de ação.

- **Vídeo de demonstração:** _(link do YouTube)_
- **Grupo:** _(nome do grupo)_

## Integrantes

| Nome     | RM     | Turma     |
| -------- | ------ | --------- |
| _(nome)_ | _(RM)_ | _(turma)_ |

## Funcionalidades

| Requisito                            | Onde está                                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 6+ telas com navegação (Expo Router) | Login, Cadastro, Início, Meus aparelhos, Novo/editar aparelho, Detalhe do aparelho, Orientações, Perfil (+ Sobre o App)                   |
| CRUD via API (Axios)                 | Aparelhos: listar com paginação, criar, editar e excluir em `/api/dispositivos` (API Java)                                                |
| Autenticação                         | Cadastro e login reais com JWT (`/api/auth/*`), sessão no SecureStore, rotas protegidas com `Stack.Protected` e logout que limpa a sessão |
| Segunda API                          | Status e histórico do aparelho vêm da API .NET (`/api/v1/dispositivos/{id}/status` e `/leituras`)                                         |
| Feedback visual                      | Loaders, mensagens de erro por campo, alerta de erro da API, "tentar de novo", pull-to-refresh                                            |
| Identidade visual                    | Paleta própria, fonte Inter, logo, ícone e splash do Ressoa                                                                               |
| Publicação                           | Firebase App Distribution; a tela **Sobre o App** mostra o hash do commit do build                                                        |

## Telas

| Tela                         | Rota                                  | API                                               |
| ---------------------------- | ------------------------------------- | ------------------------------------------------- |
| Login                        | `/login`                              | `POST /api/auth/login`                            |
| Cadastro                     | `/cadastro`                           | `GET /api/bairros`, `POST /api/auth/registro`     |
| Início (risco do meu bairro) | `/inicio`                             | `GET /api/bairros/{id}`                           |
| Meus aparelhos               | `/aparelhos`                          | `GET /api/dispositivos?page&size`                 |
| Novo/editar aparelho         | `/aparelho/form` (`?id=` para editar) | `POST` / `PUT /api/dispositivos`                  |
| Detalhe do aparelho          | `/aparelho/[id]`                      | `GET`, `DELETE /api/dispositivos/{id}` + API .NET |
| Orientações (IA)             | `/orientacoes`                        | `POST /api/bairros/{id}/orientacao`               |
| Perfil                       | `/perfil`                             | sessão local + logout                             |
| Sobre o App                  | `/sobre`                              | hash do commit (não conta para as 6 telas)        |

## Arquitetura

```text
src/
├── app/                # Navegação (Expo Router): cada arquivo é uma tela
│   ├── _layout.tsx     # Fontes, AuthProvider e proteção de rotas
│   ├── index.tsx       # Entrada: redireciona para /inicio ou /login
│   ├── (auth)/         # Telas públicas: login e cadastro
│   └── (app)/          # Telas protegidas: abas, detalhe, formulário e "Sobre"
├── components/         # Componentes visuais reutilizáveis (Button, TextField, DeviceCard...)
├── contexts/           # AuthContext: sessão, login, cadastro e logout
├── hooks/              # Hooks de dados reutilizáveis (useBairros)
├── services/           # Acesso às APIs REST (Axios), um arquivo por recurso
│   └── mock/           # API simulada em memória (só para desenvolvimento)
├── theme/              # Cores, tipografia e espaçamentos
├── types/              # Tipos do modelo de dados comum do briefing
└── utils/              # Validações, formatação, erros, storage e JWT
assets/
├── fonts/              # Inter (TTF)
└── images/             # Logo, ícone, splash
```

- **Telas não chamam o Axios diretamente.** Elas usam os `services`, que conhecem as rotas do briefing. Se uma rota mudar, muda só o service.
- **Um único JWT para as duas APIs.** O `api.ts` cria duas instâncias do Axios (Java e .NET) com o mesmo interceptor, que envia o `Authorization: Bearer`. Uma resposta 401 encerra a sessão.
- **Proteção de rotas.** O layout raiz usa `Stack.Protected`: sem sessão só o grupo `(auth)` existe; com sessão, só o `(app)`.

### Bibliotecas (e por quê)

| Biblioteca            | Para quê                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| `expo-router`         | Navegação por arquivos (requisito 1)                                           |
| `axios`               | Cliente HTTP com interceptors para o token e o tratamento de 401 (requisito 2) |
| `expo-secure-store`   | Guardar o JWT no Keychain/Keystore, e não em texto aberto                      |
| `expo-font`           | Carregar a fonte Inter de `assets/fonts`                                       |
| `@expo/vector-icons`  | Ícones das abas e dos cards                                                    |
| `eslint` + `prettier` | Padronização e formatação do código                                            |

As demais dependências vêm do template oficial do Expo e são exigidas pelo Expo Router.

## Como rodar

Pré-requisitos: Node.js LTS e o app **Expo Go** no celular (ou um emulador Android).

```bash
npm install
cp .env.example .env      # preencha as URLs das APIs
npx expo start            # leia o QR code com o Expo Go
```

### Variáveis de ambiente

| Variável                     | Descrição                                                       |
| ---------------------------- | --------------------------------------------------------------- |
| `EXPO_PUBLIC_JAVA_API_URL`   | URL da API Java (sem barra no final)                            |
| `EXPO_PUBLIC_DOTNET_API_URL` | URL da API .NET (sem barra no final)                            |
| `EXPO_PUBLIC_USE_MOCK`       | `true` usa a API simulada em memória; `false` usa as APIs reais |

Variáveis `EXPO_PUBLIC_` ficam embutidas no app: só URLs, nunca senhas ou chaves. O `.env` não vai para o Git.

### Modo simulado (enquanto o backend não sobe)

Com `EXPO_PUBLIC_USE_MOCK=true`, o Axios usa um adaptador que responde nas mesmas rotas do briefing com dados em memória. Usuários de teste:

| Papel   | E-mail               | Senha    |
| ------- | -------------------- | -------- |
| Cidadão | `cidadao@ressoa.com` | `123456` |
| Gestor  | `gestor@ressoa.com`  | `123456` |

**Antes do build publicado, deixe `EXPO_PUBLIC_USE_MOCK=false`:** a avaliação exige os dados vindos da API.

### Scripts

```bash
npm run lint        # ESLint
npm run format      # Prettier
npm run typecheck   # TypeScript
```

## Publicação (Firebase App Distribution)

1. `npm i -g eas-cli` e `eas login`.
2. No `eas.json`, perfil `preview`, troque as URLs de exemplo pelas URLs reais das APIs na Azure. O EAS Build não lê o `.env` (ele está no `.gitignore`), por isso as URLs públicas ficam no `eas.json`.
3. Faça o commit e gere o APK a partir desse commit limpo:
   ```bash
   eas build -p android --profile preview
   ```
4. No Firebase: crie um projeto, adicione um app Android com o pacote `br.com.fiap.ressoa`, abra **App Distribution**, envie o APK e adicione o e-mail do professor como tester.
5. Marque o commit publicado: `git tag v1.0.0 && git push --tags`. A tela **Sobre o App** mostra o mesmo hash.

## Contrato com o backend

Os tipos em `src/types/index.ts` seguem o modelo de dados comum do briefing em camelCase. Pontos a confirmar no Swagger da API Java:

- O login devolve `{ token, papel }`. Se também devolver `nome` e `bairroId`, o app usa; se não, o usuário escolhe o bairro uma vez na tela Início.
- O cadastro recebe `{ nome, email, senha, bairroId }`.
- As listas paginadas seguem o formato `Page` do Spring (`content`, `number`, `last`...).
- A orientação da IA vem como texto ou como `{ orientacao }`.

## Declaração de uso de IA

| Ferramenta         | Uso                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude (Anthropic) | Estrutura inicial do projeto, organização de pastas, componentes base e revisão de código. Todo o código foi revisado e testado pelo grupo. |
