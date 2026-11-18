# Configuração do fórum e da autenticação

O fórum e as contas usam Cloudflare D1. As Cloudflare Pages Functions dependem de um binding D1 chamado `DB`. Sem ele, cadastro, login e discussões retornam erro de configuração.

## Criar o banco e aplicar a migração

1. O projeto está configurado para usar o banco D1 `guias-medicina-db` pelo binding `DB` definido em `wrangler.json`.
2. No projeto Pages, confirme em **Settings → Functions → D1 database bindings** que `DB` aponta para esse banco. Faça um novo deploy depois de salvar o binding.
3. Na raiz do repositório, aplique as migrações ao banco remoto:

   ```sh
   npx wrangler d1 migrations apply guias-medicina-db --remote
   ```

4. Confirme no painel Cloudflare que as tabelas `users`, `sessions` e `comments` foram criadas e que as migrações de assinatura foram aplicadas.

Para desenvolvimento local com `wrangler pages dev`, o binding D1 já está definido no `wrangler.json`. Não publique credenciais ou configurações privadas em arquivos versionados sem necessidade.

O banco de produção já existia antes do controle de migrações do Wrangler. O histórico foi reconciliado após verificar o schema existente, e a migração `0003_stripe_subscriptions.sql` foi aplicada. Não insira registros manualmente em `d1_migrations` em outros bancos; em um D1 novo, aplique as migrações normalmente pelo comando acima.

## Contas existentes

As contas da versão anterior existem somente no `localStorage` de cada navegador, sem credenciais que o servidor possa verificar. Por segurança, elas não autenticam no fórum nem podem ser migradas automaticamente. Cada pessoa precisa criar uma nova conta depois da configuração do D1. Favoritos, tema e histórico locais continuam no navegador.

## Dados e privacidade

O banco armazena nome, e-mail, hash de senha com salt, sessões com expiração e comentários públicos ligados ao identificador de cada diretriz. Os comentários são limitados a 2.000 caracteres. Oriente os participantes a não publicar informações identificáveis de pacientes.

## Simulador OSCE com Google AI Studio

O atendimento e o debriefing usam `functions/api/osce-ai.js`, e a análise de prescrição usa `functions/api/prescricao.js`; ambos chamam o endpoint compatível com OpenAI do Google AI Studio e leem a mesma chave `API_KEY` por `context.env`, sem enviá-la ao navegador.

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

O arquivo `.dev.vars` deve definir `BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/`, `API_KEY` e `MODEL=gemini-3.8-flash`. O `wrangler.json` define a URL e o modelo para deploys que usam Wrangler; a Function também usa esses valores como padrão quando o Pages publicado pelo painel não injeta `vars` do arquivo. Em **Pages → Settings → Variables and Secrets**, configure `API_KEY` separadamente para Production e Preview e marque-a como segredo. Também é possível gravar o segredo diretamente no projeto Pages pelo Wrangler:

```powershell
npx.cmd wrangler pages secret put API_KEY --project-name=guias-medicina
```

O Wrangler pedirá o valor no terminal. Não o inclua no comando, em `wrangler.json` nem no código. Faça uma nova implantação depois de atualizar o segredo.

Depois de adicionar ou alterar `API_KEY`, faça uma nova implantação para que o segredo seja vinculado às Functions. O domínio de produção deste projeto é `pegadiretriz.com.br`.

## Assinaturas Stripe e cotas de IA

A migração `migrations/0002_subscription_and_ai_quotas.sql` adiciona à tabela `users` o vínculo com o cliente Stripe, o status de assinatura e os contadores de uso. Contas existentes recebem `subscription_status='free'`, `osce_trial_used=0` e `prescriptions_today_count=0`.

Confira o nome do banco D1 vinculado ao binding `DB` e aplique a migração remota a partir da raiz:

```powershell
npx.cmd wrangler d1 migrations apply guias-medicina-db --remote
```

O banco D1 remoto já foi reconciliado com o histórico de migrações e recebeu a migração de assinatura. Para uma nova configuração do checkout — chaves, preço, webhook, testes e fluxo — consulte [STRIPE_INTEGRATION_TODO.md](./STRIPE_INTEGRATION_TODO.md), a fonte única para os próximos passos de Stripe.

A migração `0004_osce_trial_sessions.sql` adiciona o plano de acesso sincronizado pelo webhook Stripe e o vínculo temporário necessário para permitir que o teste gratuito do OSCE continue durante uma simulação completa. Aplique-a em cada banco D1 antes de publicar as mudanças:

```powershell
npx.cmd wrangler d1 migrations apply guias-medicina-db --remote
```

Após a migração, reenvie os eventos `customer.subscription.updated` das assinaturas já existentes para preencher `subscription_plan`. O webhook usa o metadado do plano ou compara o preço da assinatura com os IDs configurados no ambiente.

A migração `0005_unique_cpf.sql` adiciona um identificador HMAC único por CPF. Aplique-a antes de publicar a atualização do cadastro:

```powershell
npx.cmd wrangler d1 migrations apply guias-medicina-db --remote
```

Configure `CPF_HASH_SECRET` como secret com pelo menos 32 caracteres aleatórios em **Pages → Settings → Variables and Secrets** (Production e Preview) e em `.dev.vars` para desenvolvimento local. Mantenha o mesmo valor em ambientes que compartilham o mesmo banco e não o rotacione sem um plano de migração; a aplicação não armazena CPF em texto puro. Contas já existentes informarão o CPF ao acessar recursos sujeitos a limites ou iniciar uma assinatura.

A migração `0006_experience_access.sql` registra o prazo de expiração do plano EXPERIÊNCIA e a idempotência das compras recebidas pelo webhook. Aplique-a antes de publicar a nova versão:

```powershell
npx.cmd wrangler d1 migrations apply guias-medicina-db --remote
```

Configure `STRIPE_PRICE_EXPERIENCIA` no Stripe como preço único (não recorrente) de R$ 14,90 e informe o respectivo ID no ambiente do Cloudflare e em `.dev.vars`.
