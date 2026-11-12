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

## Simulador OSCE com Ollama

O atendimento e o debriefing usam a função `functions/api/osce-ai.js`, que mantém a chave no servidor e chama a API compatível com OpenAI. Para desenvolvimento local, inicie o Ollama e baixe o modelo (`ollama pull llama3.1`); depois execute:

```sh
npx wrangler pages dev public --env-file ollama.env
```

O arquivo local `ollama.env` deve definir `VITE_AI_BASE_URL=http://localhost:11434/v1`, `VITE_AI_API_KEY=ollama` e `VITE_AI_MODEL=llama3.1`. Para outros ambientes, configure as mesmas variáveis em **Pages → Settings → Variables and Secrets**. Não use uma chave real em arquivo versionado.

Como a URL padrão aponta para `localhost`, a função precisa executar na mesma máquina do Ollama. Um deploy remoto do Pages não consegue acessar o Ollama do computador de quem abre a página; nesse caso, configure uma API acessível ao ambiente da função e mantenha a chave como variável secreta.
