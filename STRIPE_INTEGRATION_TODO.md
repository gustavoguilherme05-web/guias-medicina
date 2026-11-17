# Stripe Checkout: configuração e próximos passos

Este arquivo reúne os valores e tarefas necessários para testar e publicar o checkout. Nunca compartilhe ou versione chaves secretas.

## Values to Replace

O código do endpoint não contém IDs de preço fixos. `mode=subscription` e `line_items[0][price]` usando `STRIPE_PRICE_ID` são intencionais. Substitua os valores de exemplo no arquivo local de configuração e configure os valores correspondentes no Cloudflare Pages.

**Arquivo com valores de exemplo:**
- [.dev.vars.example](./.dev.vars.example)

| Campo | Valor de exemplo | O que configurar |
|-------|-----------------|------------------|
| `STRIPE_SECRET_KEY` | `replace_with_stripe_test_secret_key` | Chave secreta do mesmo modo Stripe (`sk_test_...` ou `sk_live_...`); mantenha-a como secret no Cloudflare. |
| `STRIPE_PUBLISHABLE_KEY` | `replace_with_stripe_test_publishable_key` | Chave publicável correspondente (`pk_test_...` ou `pk_live_...`). |
| `STRIPE_PRICE_ID` | `replace_with_stripe_price_id` | ID de um preço recorrente (`price_...`) no mesmo modo Stripe. |
| `STRIPE_WEBHOOK_SECRET` | `replace_with_stripe_webhook_secret` | Signing secret do endpoint webhook (`whsec_...`); mantenha-o como secret. |

## Configured Parameters

Estes valores do Checkout Studio já estão configurados no endpoint:

**Arquivo com os parâmetros:**
- [functions/api/billing/checkout.js](./functions/api/billing/checkout.js)

| Parâmetro | Valor |
|-----------|-------|
| `ui_mode` | `form` |
| `mode` | `subscription` |
| `line_items` | `STRIPE_PRICE_ID`, quantidade `1` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `payment_method_collection` | `always` |
| `submit_type` | `auto` |
| `name_collection.individual.enabled` | `true` |
| `name_collection.individual.optional` | `true` |
| `saved_payment_method_options.payment_method_save` | `enabled` |
| `integration_identifier` | `custom_embedded_web_0001` |

A versão da API Stripe usada pelo servidor é `2026-03-25.dahlia`. O navegador carrega Stripe.js diretamente de `https://js.stripe.com/dahlia/stripe.js`.
Não é necessário instalar `stripe-node`: as Cloudflare Pages Functions chamam a API Stripe com `fetch`, e o formulário usa Stripe.js hospedado pela Stripe.

## Setup e próximos passos

1. No Stripe Dashboard, crie/valide um produto com preço recorrente e use o ID do preço em `STRIPE_PRICE_ID`.
2. Em **Cloudflare Pages → Settings → Variables and Secrets**, configure as quatro variáveis acima para cada ambiente usado (Preview e/ou Production). Use chaves, preço e webhook do mesmo modo (Test ou Live), marque `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` como secrets e faça um novo deploy.
3. Configure o webhook em `/api/webhook` para os eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated` e `customer.subscription.deleted`.
4. Para desenvolvimento local, copie `.dev.vars.example` para `.dev.vars`, preencha os valores de teste e use a Stripe CLI para encaminhar eventos a `http://localhost:8788/api/webhook`.
5. O banco remoto de produção já recebeu a migração 0003. Para um novo ambiente D1, aplique as migrações com `npx.cmd wrangler d1 migrations apply guias-medicina-db --remote`.

### Estrutura e fluxo

- `public/assinatura.html` carrega Stripe.js Dahlia e contém o ponto de montagem do formulário.
- `public/assinatura.js` solicita uma Checkout Session autenticada a `/api/billing/checkout`, monta `initCheckoutFormSdk` e confirma o pagamento.
- `functions/api/billing/checkout.js` cria a sessão no servidor com o preço configurado no ambiente.
- `functions/api/webhook.js` valida a assinatura do webhook e sincroniza o status da assinatura com a conta cujo e-mail foi coletado no Checkout. O e-mail informado no Checkout precisa ser o mesmo usado na conta PAD.
- `functions/_shared/stripe.js` chama a API Stripe com autenticação do lado do servidor e a versão Dahlia.

O backend já registra o status de assinatura no D1. A política de acesso e as cotas das ferramentas para os planos Free/Premium ainda precisam ser definidas antes de liberar recursos pagos.

### Testes

Use **Test mode** no Dashboard e um preço de teste. Exemplos de cartões de teste:

- Pagamento aprovado: `4242 4242 4242 4242`
- Exige autenticação 3D Secure: `4000 0025 0000 3155`
- Recusado: `4000 0000 0000 9995`

Use qualquer data futura e um CVC de três dígitos. Nunca use números de cartão reais para testes.

Antes do modo Live, confirme o preço recorrente, as chaves Live, o endpoint webhook de produção e a política de cancelamento/reembolso. O webhook atualiza o status da assinatura; o provisionamento detalhado de benefícios, order tracking e portal de gerenciamento ainda dependem das regras do produto.

Recursos: [Stripe Support](https://support.stripe.com), [Stripe Docs MCP](https://docs.stripe.com/mcp), [gerenciar produtos e preços](https://dashboard.stripe.com/prices).
