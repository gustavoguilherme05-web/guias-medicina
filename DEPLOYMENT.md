# Configuração do fórum e da autenticação

O fórum e as contas usam Cloudflare D1. As Cloudflare Pages Functions dependem de um binding D1 chamado `DB`. Sem ele, cadastro, login e discussões retornam erro de configuração.

## Criar o banco e aplicar a migração

1. Crie um banco D1 no painel Cloudflare ou execute `npx wrangler d1 create guias-medicina`.
2. No projeto Pages, acesse **Settings → Functions → D1 database bindings**, adicione o binding `DB` e selecione o banco criado. Faça um novo deploy depois de salvar o binding.
3. Na raiz do repositório, aplique as tabelas ao banco remoto:

   ```sh
   npx wrangler d1 migrations apply guias-medicina --remote --directory=./migrations
   ```

   Se o banco tiver outro nome, substitua `guias-medicina` pelo nome escolhido.

4. Confirme no painel Cloudflare que as tabelas `users`, `sessions` e `comments` foram criadas.

Para desenvolvimento local com `wrangler pages dev`, configure também o binding `DB` no arquivo local de configuração do Wrangler, usando o ID do banco criado. Não publique credenciais ou configurações privadas em arquivos versionados sem necessidade.

## Contas existentes

As contas da versão anterior existem somente no `localStorage` de cada navegador, sem credenciais que o servidor possa verificar. Por segurança, elas não autenticam no fórum nem podem ser migradas automaticamente. Cada pessoa precisa criar uma nova conta depois da configuração do D1. Favoritos, tema e histórico locais continuam no navegador.

## Dados e privacidade

O banco armazena nome, e-mail, hash de senha com salt, sessões com expiração e comentários públicos ligados ao identificador de cada diretriz. Os comentários são limitados a 2.000 caracteres. Oriente os participantes a não publicar informações identificáveis de pacientes.

## Simulador OSCE com Google AI Studio

O atendimento e o debriefing usam `functions/api/osce-ai.js`, que chama o endpoint compatível com OpenAI do Google AI Studio. A chave é lida por `context.env` no servidor e não é enviada ao navegador.

Para publicar por upload direto e incluir a Cloudflare Pages Function, execute a partir da raiz do repositório:

```sh
npx wrangler pages deploy ./public --project-name=guias-medicina
```

No PowerShell do Windows, se a política de execução bloquear `npx.ps1`, use o executável `.cmd`:

```powershell
npx.cmd wrangler pages deploy ./public --project-name=guias-medicina
```

O upload manual somente da pasta `public` envia os arquivos estáticos, mas não atualiza `functions/api/osce-ai.js`. Se o projeto usa integração com Git, o deploy precisa incluir o repositório completo e manter `public` como diretório de saída.

Para desenvolvimento local, copie `.dev.vars.example` para `.dev.vars`, preencha `API_KEY` com uma chave do Google AI Studio e execute:

```sh
npx wrangler pages dev
```

O arquivo `.dev.vars` deve definir `BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/`, `API_KEY` e `MODEL=gemini-3.8-flash`. O `wrangler.json` define a URL e o modelo para deploys que usam Wrangler; a Function também usa esses valores como padrão quando o Pages publicado pelo painel não injeta `vars` do arquivo. Em **Pages → Settings → Variables and Secrets**, configure `API_KEY` separadamente para Production e Preview e marque-a como segredo. Não coloque a chave em `wrangler.json` nem no código.
