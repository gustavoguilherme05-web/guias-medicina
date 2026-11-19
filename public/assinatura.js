const statusElement = document.getElementById('subscriptionStatus');
const planList = document.getElementById('plan-list');
const checkoutStep = document.getElementById('checkout-step');
const checkoutContainer = document.getElementById('checkout-form');
const errorElement = document.getElementById('checkoutError');
const cpfStep = document.getElementById('cpf-step');
const cpfForm = document.getElementById('cpf-form');
const cpfInput = document.getElementById('accountCpf');
const checkoutCard = planList.closest('.checkout-card');
const planButtons = [...document.querySelectorAll('.plan-select')];
const selectedPlanSummary = document.getElementById('selectedPlanSummary');
const changePlanButton = document.getElementById('changePlan');
const requestedPlan = new URLSearchParams(window.location.search).get('plan');
const planLabels = {
  prescricao_mensal: 'Pega a Diretriz LITE — R$ 19,90/mês',
  pro_mensal: 'Pega a Diretriz PRO — R$ 29,90/mês',
  experience: 'EXPERIÊNCIA — R$ 14,90 por 7 dias (pagamento único)'
};
const checkoutReturned = new URLSearchParams(window.location.search).get('checkout') === 'return';

function mostrarErro(mensagem){
  errorElement.textContent = mensagem;
  errorElement.hidden = false;
}

async function lerRespostaJson(response, acao){
  try{
    return await response.json();
  }catch{
    throw new Error(`${acao}: o servidor retornou uma resposta inválida (HTTP ${response.status}). Atualize a página e tente novamente.`);
  }
}

function aguardarComLimite(promise, duracao, mensagem){
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(mensagem)), duracao);
    Promise.resolve(promise).then(
      resultado => {
        window.clearTimeout(timeoutId);
        resolve(resultado);
      },
      erro => {
        window.clearTimeout(timeoutId);
        reject(erro);
      }
    );
  });
}

async function consultarAssinatura(){
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  try{
    const response = await fetch('/api/billing/status', {
      credentials: 'same-origin',
      signal: controller.signal
    });
    const data = await lerRespostaJson(response, 'Não foi possível consultar sua assinatura');
    if(response.status === 401){
      return { status: 'unauthenticated', canStartCheckout: true };
    }
    if(!response.ok) throw new Error(data?.error || 'Não foi possível consultar sua assinatura.');
    return data;
  }catch(error){
    if(error.name === 'AbortError'){
      throw new Error('A consulta da assinatura excedeu o tempo limite.');
    }
    throw error;
  }finally{
    window.clearTimeout(timeoutId);
  }
}

async function atualizarStatus(){
  const data = await consultarAssinatura();
  if(!data) return;

  if(data.status === 'unauthenticated'){
    statusElement.textContent = 'Entre na sua conta ao selecionar um plano para continuar.';
    cpfStep.hidden = true;
    planList.hidden = false;
    checkoutStep.hidden = true;
    checkoutCard.classList.add('has-plans');
    return null;
  }

  if(data.requiresCpf){
    statusElement.textContent = 'Informe seu CPF para proteger sua conta e continuar.';
    planList.hidden = true;
    checkoutStep.hidden = true;
    cpfStep.hidden = false;
    checkoutCard.classList.remove('has-plans');
    return false;
  }

  cpfStep.hidden = true;
  if(data.status === 'active' || data.status === 'trialing'){
    statusElement.textContent = data.experienceExpiresAt
      ? `Seu plano EXPERIÊNCIA está ativo até ${new Date(data.experienceExpiresAt).toLocaleString('pt-BR')}.`
      : (data.status === 'trialing'
        ? 'Sua assinatura está em período de avaliação.'
        : 'Sua assinatura está ativa.');
    planList.hidden = true;
    checkoutCard.classList.remove('has-plans');
    return true;
  }

  const statusLabels = {
    past_due: 'O pagamento da assinatura precisa de atenção.',
    incomplete: 'O pagamento ainda está pendente.',
    unpaid: 'Sua assinatura está com pagamento pendente.',
    paused: 'Sua assinatura está pausada.',
    canceled: 'Sua assinatura está cancelada.',
    incomplete_expired: 'A tentativa anterior de pagamento expirou.',
    free: 'Você ainda não possui uma assinatura ativa.'
  };
  statusElement.textContent = checkoutReturned
    ? 'Pagamento recebido. Aguardando a confirmação segura da Stripe...'
    : (statusLabels[data.status] || 'Consulte o status da sua assinatura.');
  planList.hidden = !data.canStartCheckout;
  checkoutCard.classList.toggle('has-plans', data.canStartCheckout);
  return false;
}

async function iniciarCheckout(plan){
  const selectedButton = planButtons.find(button => button.dataset.plan === plan);
  if(!selectedButton) return;

  planButtons.forEach(button => {
    button.disabled = true;
  });
  selectedButton.textContent = 'Preparando checkout...';
  statusElement.textContent = 'Preparando seu pagamento com segurança...';
  errorElement.hidden = true;

  try{
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    let response;
    let data;
    try{
      response = await fetch('/api/billing/checkout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
        signal: controller.signal
      });
      data = await lerRespostaJson(response, 'Não foi possível iniciar o checkout');
    }finally{
      window.clearTimeout(timeoutId);
    }
    if(response.status === 401){
      const destino = encodeURIComponent(`assinatura.html?plan=${encodeURIComponent(plan)}`);
      window.location.replace('login.html?redirect=' + destino);
      return;
    }
    if(data?.requiresCpf){
      cpfStep.hidden = false;
      planList.hidden = true;
      checkoutStep.hidden = true;
      checkoutCard.classList.remove('has-plans');
      statusElement.textContent = 'Informe seu CPF para proteger sua conta e continuar.';
      planButtons.forEach(button => {
        button.disabled = false;
        button.textContent = 'Selecionar plano';
      });
      return;
    }
    if(!response.ok) throw new Error(data?.error || 'Não foi possível iniciar o checkout.');
    if(typeof window.Stripe !== 'function') throw new Error('O formulário de pagamento não carregou. Atualize a página e tente novamente.');

    selectedPlanSummary.textContent = planLabels[plan];
    const stripe = window.Stripe(data.publishable_key);
    const checkout = stripe.initCheckoutFormSdk({
      clientSecret: data.client_secret,
      appearance: {
        theme: 'stripe',
        inputs: 'spaced',
        labels: 'auto',
        variables: {
          borderRadius: '4px',
          colorBackground: '#ffffff',
          colorDanger: '#df1b41',
          colorPrimary: '#0570de',
          colorSuccess: '#00c853',
          colorText: '#30313d',
          fontFamily: 'default',
          fontSizeBase: '16px',
          spacingUnit: '4px'
        }
      }
    });
    const checkoutForm = checkout.createForm({ layout: 'expanded' });
    planList.hidden = true;
    checkoutStep.hidden = false;
    checkoutCard.classList.remove('has-plans');
    statusElement.textContent = 'Carregando o formulário seguro de pagamento...';
    checkoutForm.mount('#checkout-form');
    checkoutStep.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const actionsResult = await aguardarComLimite(
      checkout.loadActions(),
      15000,
      'O formulário de pagamento demorou para carregar. Tente novamente.'
    );
    if(actionsResult.type !== 'success'){
      throw new Error('Não foi possível carregar as ações de pagamento.');
    }
    statusElement.textContent = 'Preencha os dados abaixo para concluir a assinatura.';
    checkoutForm.on('confirm', async (event) => {
      try{
        const result = await actionsResult.actions.confirm({ formConfirmEvent: event });
        if(result?.type === 'error'){
          mostrarErro(result.error?.message || 'Não foi possível confirmar o pagamento.');
        }else if(result?.type === 'success'){
          statusElement.textContent = 'Pagamento confirmado. Ativando seu acesso...';
          let acessoAtivado = false;
          for(let tentativa = 0; tentativa < 6; tentativa += 1){
            await new Promise(resolve => setTimeout(resolve, 1500));
            const ativa = await atualizarStatus();
            if(ativa){
              checkoutContainer.replaceChildren();
              checkoutStep.hidden = true;
              acessoAtivado = true;
              break;
            }
          }
          if(!acessoAtivado){
            statusElement.textContent = 'Pagamento confirmado. A ativação segura ainda está em processamento; atualize esta página em instantes.';
          }
        }
      }catch(error){
        mostrarErro(error.message || 'Não foi possível confirmar o pagamento.');
      }
    });
  }catch(error){
    const mensagem = error.name === 'AbortError'
      ? 'A preparação do checkout excedeu o tempo limite. Tente novamente.'
      : (error.message || 'Não foi possível iniciar o checkout agora.');
    mostrarErro(mensagem);
    checkoutContainer.replaceChildren();
    checkoutStep.hidden = true;
    planList.hidden = false;
    cpfStep.hidden = true;
    checkoutCard.classList.add('has-plans');
    statusElement.textContent = 'Não foi possível abrir o checkout. Confira a mensagem abaixo e tente novamente.';
    planButtons.forEach(button => {
      button.disabled = false;
      button.textContent = 'Selecionar plano';
    });
  }
}

planList.addEventListener('click', (event) => {
  const button = event.target.closest('.plan-select');
  if(button) iniciarCheckout(button.dataset.plan);
});

cpfInput.addEventListener('input', () => {
  cpfInput.value = formatarCpf(cpfInput.value);
});

cpfForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = cpfForm.querySelector('button[type="submit"]');
  button.disabled = true;
  errorElement.hidden = true;
  try{
    const response = await fetch('/api/auth/cpf', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpfInput.value })
    });
    const data = await lerRespostaJson(response, 'Não foi possível salvar seu CPF');
    if(!response.ok) throw new Error(data?.error || 'Não foi possível salvar seu CPF.');
    cpfStep.hidden = true;
    await atualizarStatus();
    if(requestedPlan && planButtons.some(button => button.dataset.plan === requestedPlan)){
      await iniciarCheckout(requestedPlan);
    }
  }catch(error){
    mostrarErro(error.message || 'Não foi possível salvar seu CPF agora.');
  }finally{
    button.disabled = false;
  }
});

changePlanButton.addEventListener('click', () => {
  checkoutContainer.replaceChildren();
  checkoutStep.hidden = true;
  cpfStep.hidden = true;
  planList.hidden = false;
  checkoutCard.classList.add('has-plans');
  statusElement.textContent = 'Escolha o plano ideal para seus estudos.';
  planButtons.forEach(button => {
    button.disabled = false;
    button.textContent = 'Selecionar plano';
  });
});

(async function iniciarPaginaAssinatura(){
  try{
    const ativa = await atualizarStatus();
    if(requestedPlan &&
       planButtons.some(button => button.dataset.plan === requestedPlan) &&
       ativa === false && cpfStep.hidden){
      await iniciarCheckout(requestedPlan);
      return;
    }
    if(checkoutReturned && ativa === false){
      for(let tentativa = 0; tentativa < 5; tentativa += 1){
        await new Promise(resolve => setTimeout(resolve, 2000));
        if(await atualizarStatus()) break;
      }
    }
  }catch(error){
    statusElement.textContent = 'Não foi possível confirmar sua assinatura. Os planos continuam disponíveis abaixo.';
    mostrarErro(error.message || 'Tente novamente em instantes.');
    planList.hidden = false;
    checkoutCard.classList.add('has-plans');
  }
})();
