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
