import {
  getAuthenticatedUser,
  hasDatabase,
  jsonResponse
} from "../_shared/auth.js";
import { expireExperienceIfNeeded } from "../_shared/experience.js";

export const RUBRICAS_POR_CASO = {
  'amigdalite-bacteriana-aguda': {
    caso: 'Faringoamigdalite aguda provável por estreptococo do grupo A em mulher de 19 anos, com febre, exsudato tonsilar e linfonodos cervicais dolorosos. Sem alergias conhecidas.',
    diretriz: `- Avalie a probabilidade de infecção estreptocócica e a necessidade de teste rápido/cultura conforme disponibilidade, protocolo local e critérios clínicos; não presuma que todo exsudato exige antibiótico.
- Se houver indicação de tratar provável infecção estreptocócica: amoxicilina 500 mg VO a cada 12 horas por 10 dias (ou esquema equivalente recomendado localmente).
- Analgesia/antitérmico: paracetamol ou dipirona em dose apropriada; considerar ibuprofeno se não houver contraindicação.
- Oriente hidratação, medidas de conforto e retorno se piora, dificuldade respiratória/deglutição importante, desidratação ou persistência da febre/sintomas.`
  },
  'hipertensao-inicio-tratamento': {
    caso: 'Homem de 52 anos, assintomático, sem comorbidades ou lesão de órgão-alvo, com média domiciliar de 148/92 mmHg por duas semanas e PA de consultório de 150/94 mmHg. Função renal e eletrólitos normais.',
    diretriz: `- Considere hipertensão estágio 1 e início de monoterapia associado a mudanças de estilo de vida.
- Opções iniciais: enalapril (por exemplo, 5 mg VO 1 vez ao dia), losartana (50 mg VO 1 vez ao dia) ou hidroclorotiazida (12,5 mg VO 1 vez ao dia), ajustando conforme diretriz local e perfil do paciente. Prescrever apenas uma opção.
- Para IECA/BRA, avaliar creatinina e potássio após início/ajuste; para tiazídico, monitorar eletrólitos e efeitos metabólicos. Reavaliar pressão, tolerabilidade e adesão em algumas semanas.
- Oriente redução de sal, atividade física, controle de peso, moderação de álcool e seguimento; não indicar combinação inicial automaticamente neste caso.`
  },
  'exacerbacao-leve-asma': {
    caso: 'Mulher de 24 anos com asma, sintomas leves de exacerbação após exposição a mofo, interrompeu o corticoide inalatório no último mês. SpO₂ 96%, FC 92 bpm, FR 22 irpm, sibilos expiratórios difusos, sem sinais de esforço respiratório.',
    diretriz: `- Avalie gravidade e resposta clínica; salbutamol inalatório 100 mcg, 2 a 4 jatos com espaçador como resgate, repetindo conforme resposta e plano de ação. Falha de resposta ou piora exige avaliação urgente.
- Oriente retomada imediata do corticoide inalatório de manutenção previamente prescrito e adesão contínua; confira técnica inalatória e plano de ação. Considere estratégia com corticoide-formoterol conforme o tratamento já indicado e protocolo vigente.
- Não recomendar SABA como único tratamento de manutenção. Oriente evitar o gatilho e procurar urgência se dispneia importante, dificuldade para falar, cianose, sonolência ou piora/saturação baixa.`
  },
  'gastroenterite-desidratacao-leve': {
    caso: 'Homem de 30 anos com cinco episódios de diarreia aquosa e dois de vômito em 24 horas, sede e cansaço. Mucosas levemente secas, turgor preservado, PA 110/70 mmHg, FC 88 bpm, sem peritonismo.',
    diretriz: `- Priorize solução de reidratação oral em pequenos volumes frequentes e reposição das perdas após evacuações; reavalie hidratação e tolerância oral.
- Antiemético, como ondansetrona, pode ser considerado por curto período se o vômito impedir hidratação, após avaliar contraindicações e risco de prolongamento do QT. Antiespasmódico não é de uso rotineiro; se considerado para cólica, avaliar contraindicações e não mascarar sinais de alarme.
- Oriente alimentação conforme tolerância, higiene das mãos e retorno se incapacidade de ingerir líquidos, redução importante da diurese, sangue nas fezes, febre alta, dor intensa/localizada ou sinais de desidratação. Não prescrever antibiótico empírico neste quadro sem indicação específica.`
  },
  'cistite-nao-complicada-28': {
    caso: 'Mulher de 28 anos com disúria, polaciúria, urgência e desconforto suprapúbico há três dias. Afebril, sem dor lombar ou corrimento vaginal, Giordano negativo.',
    diretriz: `- Opções para cistite não complicada incluem nitrofurantoína 100 mg VO a cada 6 horas por 5 dias (ou formulação de liberação modificada a cada 12 horas, conforme apresentação/protocolo), fosfomicina 3 g VO em dose única ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resistência local permitir.
- Verifique possibilidade de gestação, função renal, alergias, interações e fatores de complicação antes de escolher o antibiótico; evite quinolonas como primeira linha. Urocultura é indicada em situações selecionadas, não necessariamente em cistite típica não complicada.
- Fenazopiridina 100–200 mg VO a cada 8 horas por no máximo 2 dias pode ser considerada para disúria, observando contraindicações; analgésico simples é alternativa. Oriente hidratação conforme sede e retorno se febre, dor lombar, vômitos ou piora.`
  },
  'itu-nao-complicada': {
    caso: 'Cistite aguda não complicada em mulher hígida de 26 anos, com disúria, polaciúria e urgência há dois dias. Sem febre, dor lombar, Giordano negativo ou sintomas vaginais.',
    diretriz: `- Opções de primeira linha: nitrofurantoína 100 mg VO a cada 6 horas por 5 dias (ou formulação de liberação modificada a cada 12 horas, conforme apresentação), fosfomicina 3 g VO em dose única ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resistência local permitir.
- Evite fluoroquinolonas como primeira linha e tratamentos prolongados sem indicação. Considere fatores de complicação, alergias e contraindicações.
- Fenazopiridina 100–200 mg VO a cada 8 horas por no máximo 2 dias ou analgésico simples podem ser usados para alívio. Oriente hidratação conforme sede e sinais de alarme, como febre, dor lombar ou piora.`
  },
  'tep-tromboembolismo-pulmonar': {
    caso: 'Mulher de 45 anos, tabagista, no 10º dia após artroplastia de quadril, com dispneia súbita e dor pleurítica direita. PA 110/70 mmHg, FC 115 bpm, FR 28 irpm, SatO₂ 88%, panturrilha direita empastada. Wells alto e Angio-TC confirma TEP segmentar; hemodinamicamente estável.',
    diretriz: `- Priorize monitorização, acesso venoso, avaliação de gravidade e suporte de oxigênio devido à hipoxemia; reavalie sinais de instabilidade.
- Inicie anticoagulação se não houver contraindicação, escolhendo agente e dose conforme peso, função renal, risco hemorrágico, cirurgia recente e necessidade de procedimentos; a artroplastia recente exige avaliação explícita de sangramento.
- Não indique trombólise sistêmica de rotina em paciente estável; reserve reperfusão para deterioração/choque após avaliação especializada.
- Investigue risco de sangramento, contraindicações, função renal e sinais de TVP; documente plano de monitorização e escalonamento.`
  },
  'sincope': {
    caso: 'Homem de 72 anos, hipertenso, com perda súbita de consciência sem pródromos e recuperação rápida, precedida de palpitações. PA 130/80 mmHg, FC 52 bpm, FR 16 irpm, sem déficit neurológico. ECG com BAV de 1º grau e BRE novo.',
    diretriz: `- Trate como síncope de alto risco: monitorização cardíaca contínua, ECG seriado, acesso venoso e avaliação clínica/cardiológica urgente; não planeje alta sem esclarecer o risco arrítmico.
- Avalie glicemia, pressão ortostática quando seguro, eletrólitos, hemograma e biomarcadores conforme hipótese clínica; ecocardiograma e investigação de arritmia conforme avaliação especializada.
- Mantenha recursos para manejo de bradiarritmia e instabilidade disponíveis; não prescreva antiarrítmico ou marca-passo definitivo sem indicação estabelecida.
- Reavalie sinais vitais, recorrência, trauma e causas reversíveis, registrando critérios para escalonamento.`
  },
  'insuficiencia-cardiaca-aguda': {
    caso: 'Homem de 68 anos com IC prévia, dispneia noturna extrema, ortopneia e tosse espumosa rósea. PA 190/110 mmHg, FC 110 bpm, FR 32 irpm, SatO₂ 85%, sudoreico e agitado, estertores até os ápices.',
    diretriz: `- Priorize estabilização, posição sentada, monitorização e oxigênio titulado para hipoxemia; considere ventilação não invasiva precoce se não houver contraindicação e reavalie resposta.
- Em edema pulmonar hipertensivo, considere nitrato intravenoso/sublingual conforme protocolo e contraindicações; use diurético de alça intravenoso se houver congestão, ajustado ao uso prévio, função renal e resposta.
- Monitore pressão, ECG, diurese, eletrólitos e função renal; investigue e trate precipitantes (isquemia, arritmia, infecção, má adesão).
- Evite iniciar betabloqueador durante descompensação aguda e não use opioide rotineiramente; ajuste a conduta à resposta e ao protocolo institucional.`
  },
  'insuficiencia-cardiaca-cronica': {
    caso: 'Mulher de 60 anos com IC de fração de ejeção reduzida, FEVE 32% pós-infarto, NYHA II, fadiga aos médios esforços e sem congestão. PA 115/75 mmHg, FC 78 bpm, pulmões limpos.',
    diretriz: `- Proponha as quatro classes modificadoras de prognóstico na ICFEr: ARNI (ou IECA/BRA quando apropriado), betabloqueador com evidência, antagonista de receptor mineralocorticoide e inibidor de SGLT2.
- Inicie e titule conforme pressão, frequência cardíaca, função renal, potássio, tolerância e disponibilidade; não associe ARNI a IECA sem intervalo adequado.
- Planeje monitorização de creatinina e potássio após início/aumento de bloqueio do SRAA ou antagonista mineralocorticoide e acompanhamento para titulação.
- Reforce adesão, vacinação, atividade física individualizada, sinais de congestão e seguimento; considere prevenção secundária pós-infarto conforme histórico e contraindicações.`
  },
  'sindrome-coronariana-aguda': {
    caso: 'Homem de 55 anos, diabético e hipertenso, com dor retroesternal em aperto irradiada para mandíbula há 2 horas, náuseas e sudorese. PA 150/90 mmHg, FC 90 bpm, SatO₂ 96%; ECG com supra de ST em DII, DIII e aVF. Hemodinâmica disponível.',
    diretriz: `- Ative imediatamente o protocolo de IAM com supra e encaminhe para angioplastia primária sem atrasos; faça monitorização contínua, acesso venoso e ECGs seriados.
- Inclua antiagregação e anticoagulação conforme protocolo de intervenção, alergias, risco hemorrágico e estratégia escolhida; considere estatina de alta intensidade se não houver contraindicação.
- Oxigênio não é rotineiro com saturação normal; use se hipoxemia. Avalie derivações direitas e contraindicações antes de nitrato, especialmente hipotensão ou suspeita de acometimento de ventrículo direito.
- Analgesia e demais medidas devem seguir protocolo institucional; não substitua angioplastia por fibrinólise quando a intervenção primária está disponível em tempo adequado.`
  },
  'cardiomiopatia-hipertrofica': {
    caso: 'Atleta amador de 22 anos com dispneia aos esforços e tontura nos treinos. Ecocardiograma com hipertrofia septal assimétrica de 22 mm e obstrução da via de saída do VE. PA 120/70 mmHg, FC 85 bpm, sopro sistólico que aumenta com Valsalva.',
    diretriz: `- Para sintomas por obstrução, considere betabloqueador não vasodilatador como primeira linha, titulado pela resposta e tolerância; verapamil/diltiazem são alternativas selecionadas após avaliação especializada.
- Evite desidratação e fármacos que reduzam excessivamente a pré-carga/pós-carga quando houver obstrução; não recomende diurese agressiva sem congestão.
- Encaminhe para cardiologia especializada para estratificação de morte súbita, síncope, história familiar e decisão sobre investigação/terapia adicional; a espessura isolada não define automaticamente indicação de CDI.
- Oriente suspensão temporária de exercício intenso competitivo até avaliação individualizada e rastreamento familiar conforme protocolo.`
  },
  'cardiomiopatia-dilatada': {
    caso: 'Homem de 50 anos, ex-etilista grave, com cardiomiopatia dilatada e FEVE 25%, internado para compensação volêmica, agora euvolêmico e pronto para alta. PA 100/60 mmHg, FC 70 bpm, assintomático em repouso.',
    diretriz: `- Planeje alta após estabilidade clínica e euvolemia, sem manter diurético intravenoso; prescreva diurético oral apenas se necessário para controle de congestão.
- Inicie/retome as quatro classes fundamentais da ICFEr (ARNI/IECA/BRA, betabloqueador com evidência, antagonista mineralocorticoide e SGLT2) em doses toleradas, considerando PA limítrofe, função renal e potássio.
- Faça transição e reconciliação medicamentosa, monitorização laboratorial precoce e consulta de seguimento para titulação; inclua abstinência alcoólica e investigação de etiologia reversível.
- Oriente sinais de alarme, peso diário, adesão e retorno; não aumente doses agressivamente diante de hipotensão sintomática ou hipoperfusão.`
  },
  'endocardite-infecciosa': {
    caso: 'Mulher de 35 anos, usuária de drogas injetáveis, com febre diária de 39 °C há 2 semanas, astenia e emagrecimento. PA 110/65 mmHg, FC 105 bpm, sopro holossistólico novo em foco tricúspide e nódulos de Osler.',
    diretriz: `- Colete pelo menos três conjuntos de hemoculturas de punções periféricas distintas antes do antibiótico, se isso não atrasar o tratamento de paciente instável; solicite ecocardiograma e avaliação de complicações.
- Inicie antibioticoterapia intravenosa empírica após culturas, cobrindo patógenos prováveis conforme protocolo local e epidemiologia; ajuste após culturas, sensibilidade, função renal e avaliação de infectologia.
- Avalie sepse, insuficiência cardíaca, embolização pulmonar séptica e indicação de equipe multidisciplinar/cirurgia; não atrase antibiótico em choque ou deterioração clínica.
- Inclua monitorização clínica e laboratorial e planejamento de tratamento supervisionado; não fixe esquema/duração sem identificar agente, sensibilidade e complicações.`
  },
  'dislipidemia': {
    caso: 'Homem de 58 anos, tabagista, assintomático, com colesterol total 260 mg/dL, LDL 180 mg/dL, HDL 35 mg/dL, triglicerídeos 220 mg/dL, glicemia normal, PA 135/85 mmHg e IMC 29 kg/m².',
    diretriz: `- Estratifique risco cardiovascular global e considere estatina de alta intensidade conforme risco e diretriz vigente; confirme histórico de doença aterosclerótica, diabetes, doença renal e antecedentes familiares.
- Avalie causas secundárias, medicamentos, função hepática basal quando indicada, interações e preferência do paciente; discuta sintomas musculares e adesão.
- Oriente cessação do tabagismo, padrão alimentar cardioprotetor, atividade física e controle de peso; reavalie perfil lipídico e tolerância após início/ajuste.
- Se LDL permanecer acima da meta individual, considere intensificação/adjuvantes conforme risco e protocolo; não use fibrato automaticamente para triglicerídeos de 220 mg/dL.`
  },
  'hipertensao-arterial-pulmonar': {
    caso: 'Mulher de 32 anos com HAP idiopática (Grupo 1) confirmada por cateterismo direito, dispneia progressiva, pré-síncope, edema periférico, PA 100/65 mmHg, FC 92 bpm e SatO₂ 93%.',
    diretriz: `- Encaminhe/mantenha acompanhamento em centro especializado em hipertensão pulmonar e faça estratificação formal de risco; pré-síncope e sinais de falência direita exigem avaliação prioritária.
- Use oxigênio se houver hipoxemia documentada e diurético com cautela para congestão, monitorando pressão, função renal e eletrólitos; evite hipovolemia.
- Terapia específica (antagonista de receptor de endotelina e/ou inibidor de PDE5, ou estratégia mais intensiva conforme risco) deve ser definida por especialista, após avaliar interações, função hepática, gestação e contraindicações.
- Não inicie bloqueador de canal de cálcio sem teste de vasorreatividade positivo e indicação especializada; discuta monitorização e teratogenicidade dos fármacos.`
  },
  'asma-crise-aguda': {
    caso: 'Homem de 20 anos com asma e baixa adesão, dispneia intensa há 4 horas após exposição a poeira. PA 125/80 mmHg, FC 115 bpm, FR 28 irpm, SatO₂ 90%, fala entrecortada e sibilos difusos.',
    diretriz: `- Avalie gravidade repetidamente, monitorize e administre broncodilatador beta-2 de curta ação inalatório em doses repetidas; associe ipratrópio na exacerbação moderada/grave.
- Administre corticosteroide sistêmico precocemente e oxigênio titulado para corrigir hipoxemia, conforme protocolo; reavalie fala, esforço respiratório, saturação e resposta.
- Considere sulfato de magnésio intravenoso em crise grave com resposta insuficiente e escalone suporte/UTI diante de piora, exaustão, silêncio auscultatório ou alteração de consciência.
- Não use sedativos; após estabilização, revise tratamento controlador, técnica inalatória, adesão e plano de ação.`
  },
  'sara': {
    caso: 'Mulher de 65 anos com sepse abdominal, piora respiratória, infiltrados bilaterais e PaO₂/FiO₂ de 120 mmHg. PA 90/60 mmHg, FC 120 bpm, intubada de urgência.',
    diretriz: `- Inicie ventilação protetora com volume corrente baseado no peso corporal predito, pressão de platô abaixo de 30 cmH₂O e PEEP ajustada à gravidade; monitore mecânica, gases e hemodinâmica.
- Considere pronação prolongada em SDRA moderada/grave, especialmente com PaO₂/FiO₂ abaixo de 150, se não houver contraindicação; individualize sedação/analgesia para sincronia e segurança.
- Evite balanço hídrico positivo após ressuscitação adequada, mas trate choque/hipoperfusão; controle foco infeccioso e siga protocolo de sepse.
- Reavalie necessidade de bloqueio neuromuscular e outras terapias de resgate caso a caso; não prescreva doses de sedativos sem metas, peso, função orgânica e monitorização.`
  },
  'pneumonia-adquirida-comunidade': {
    caso: 'Homem de 70 anos com tosse produtiva, febre há 3 dias e confusão leve. Ureia 65 mg/dL, PA 100/60 mmHg, FC 105 bpm, FR 28 irpm, SatO₂ 92% e estertores na base direita; CURB-65 = 3.',
    diretriz: `- Indique internação e avalie gravidade, necessidade de unidade intensiva, estado mental, oxigenação e sepse; faça monitorização e acesso venoso.
- Inicie antibiótico empírico para pneumonia adquirida na comunidade em enfermaria conforme diretriz e resistência local (em geral, beta-lactâmico associado a macrolídeo ou alternativa institucional); colha culturas quando indicadas sem atrasar tratamento.
- Ofereça oxigênio se necessário, hidratação individualizada e profilaxia de tromboembolismo se indicada; ajuste antibiótico à função renal, alergias, culturas e evolução.
- Reavalie em 24–48 h e investigue deterioração, complicações ou diagnóstico alternativo.`
  },
  'dpoc-exacerbacao': {
    caso: 'Homem de 68 anos, tabagista ativo com carga de 50 anos-maço e DPOC, com piora de dispneia, aumento do volume e purulência do escarro há 2 dias. PA 140/90 mmHg, FC 100 bpm, FR 26 irpm, SatO₂ 86%, murmúrio vesicular diminuído e roncos.',
    diretriz: `- Titule oxigênio com alvo usual de SatO₂ 88–92% e avalie gasometria; use ventilação não invasiva se houver insuficiência respiratória hipercápnica com acidose e não houver contraindicação.
- Prescreva broncodilatadores de curta ação (beta-2 agonista e antimuscarínico), corticosteroide sistêmico por curso curto conforme protocolo e antibiótico considerando purulência e aumento de dispneia/volume do escarro.
- Ajuste antibiótico a alergias, risco de Pseudomonas, culturas e resistência local; monitore resposta, retenção de CO₂, glicemia e efeitos adversos.
- Trate fatores precipitantes e reforce cessação do tabagismo, técnica inalatória e plano de seguimento após estabilização.`
  },
  'tuberculose-pulmonar': {
    caso: 'Mulher de 35 anos, contato de TB, com tosse há 4 semanas, febre vespertina, sudorese noturna e perda de 5 kg. TRM-TB positivo no escarro, sem resistência detectada; PA 110/70 mmHg, emagrecida.',
    diretriz: `- Para TB sensível, considere o esquema básico com rifampicina, isoniazida, pirazinamida e etambutol na fase intensiva, seguido de rifampicina e isoniazida na fase de manutenção, conforme PCDT brasileiro vigente e dose por peso.
- Confirme peso, comorbidades, gestação, interações e avaliação basal antes de prescrever.
- Oriente adesão e tratamento diretamente observado quando indicado; notifique o caso, investigue contatos e avalie HIV e outras condições associadas conforme protocolo.
- Institua precaução para transmissão aérea até critérios locais de não infectividade e instrua etiqueta respiratória; organize seguimento e busca ativa de faltosos.
- Monitore hepatotoxicidade e eventos adversos do esquema; avalie acuidade visual/neuropatia conforme medicamentos e fatores de risco. Não extrapole este esquema para resistência ou situações especiais.`
  },
  'artrite-reumatoide': {
    caso: 'Mulher de 45 anos com dor, edema e calor simétricos em punhos e metacarpofalangeanas há 3 meses, rigidez matinal de 2 horas, fator reumatoide e anti-CCP positivos.',
    diretriz: `- Inicie DMARD precocemente, com metotrexato semanal como opção padrão se não houver contraindicação; enfatize que nunca deve ser tomado diariamente e associe ácido fólico.
- Antes do início, avalie gestação/planejamento reprodutivo, hemograma, função hepática e renal, hepatites, tuberculose/risco infeccioso e interações; programe monitorização laboratorial.
- Considere terapia de ponte por curto período para controle de sintomas, individualizando AINE ou glicocorticoide e avaliando riscos gastrointestinais, renais e cardiovasculares.
- Use estratégia treat-to-target com reavaliações e encaminhamento/reumatologia; oriente contracepção quando aplicável e suspensão/avaliação diante de toxicidade.`
  },
  'lupus-eritematoso-sistemico': {
    caso: 'Mulher de 24 anos com rash malar fotossensível, poliartralgia, fadiga, FAN 1:640 homogêneo, anti-DNA positivo, plaquetas 80.000 e proteinúria de 1,5 g/24 h; PA 130/85 mmHg e edema leve.',
    diretriz: `- Avalie atividade e gravidade com urgência, incluindo função renal, sedimento urinário, complemento, hemograma e investigação de causas de proteinúria/trombocitopenia; envolva reumatologia e nefrologia.
- Considere hidroxicloroquina para doença de base salvo contraindicação, com dose individualizada e avaliação oftalmológica; oriente fotoproteção e prevenção cardiovascular/infecciosa.
- Proteinúria significativa requer investigação de nefrite, geralmente com biópsia renal para classificar antes de escolher imunossupressão; corticosteroide e agente imunossupressor dependem da classe, gravidade, função renal e contexto.
- Avalie gestação/planejamento, infecções e citopenias antes de imunossuprimir; não proponha esquema de nefrite definitivo sem avaliação especializada e dados adicionais.`
  },
  'diabetes-mellitus-tipo-2': {
    caso: 'Homem de 52 anos, IMC 33, DM2 recém-diagnosticado, HbA1c 8,5%, glicemia de jejum 180 mg/dL e função renal normal. PA 125/80 mmHg, acantose nigricans.',
    diretriz: `- Considere terapia dupla com metformina e agonista de GLP-1 com benefício ponderal/cardiovascular quando apropriado e disponível; individualize conforme risco cardiovascular, preferências e acesso.
- Avalie eGFR, albuminúria, doença cardiovascular/renal, histórico de pancreatite, doença biliar, contraindicações e interações; considere inibidor de SGLT2 se houver indicação cardiorrenal específica.
- Inclua plano alimentar, atividade física, redução ponderal, educação sobre hipoglicemia quando aplicável e avaliação de vacinação/complicações.
- Planeje monitorização de HbA1c e tolerabilidade; não prescreva doses sem considerar apresentação, titulação e contraindicações individuais.`
  },
  'migranea-crise-aguda': {
    caso: 'Mulher de 30 anos com cefaleia latejante unilateral 9/10 há 6 horas, fotofobia, fonofobia e um episódio de vômito, sem resposta a paracetamol. Sinais vitais estáveis e exame neurológico sem sinais de alarme.',
    diretriz: `- Confirme ausência de sinais de cefaleia secundária e reavalie se surgirem déficit focal, início em trovoada, febre/meningismo, gestação/puerpério ou alteração de consciência.
- Ofereça ambiente com pouca luz/ruído; hidratação intravenosa apenas se houver desidratação ou incapacidade de ingerir líquidos.
- Considere analgésico/AINE parenteral e antiemético conforme contraindicações; triptano pode ser opção após avaliar doença vascular, hipertensão não controlada, gestação e outras contraindicações.
- Evite opioides e uso excessivo de medicação de resgate; reavalie resposta e oriente seguimento se crises recorrentes.`
  }
};

function getSubscriptionPlan(account) {
  const tierStatuses = new Set(["free", "prescription_only", "pro"]);
  if (tierStatuses.has(account.subscription_status)) {
    return account.subscription_status;
  }
  if (["active", "trialing"].includes(account.subscription_status) &&
      tierStatuses.has(account.subscription_plan)) {
    return account.subscription_plan;
  }
  return "free";
}

function getPlanCondition(account, plan) {
  if (["free", "prescription_only", "pro"].includes(account.subscription_status)) {
    return {
      sql: "subscription_status = ?",
      value: account.subscription_status
    };
  }
  if (["active", "trialing"].includes(account.subscription_status)) {
    return {
      sql: "subscription_status IN ('active', 'trialing') AND subscription_plan = ?",
      value: plan
    };
  }
  return {
    sql: "subscription_status = ? AND subscription_plan = 'free'",
    value: account.subscription_status
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  let user;
  let account;
  try {
    user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para usar o treino de prescrição." }, 401);
    }

    await expireExperienceIfNeeded(env, user.email);
    account = await env.DB.prepare(`
      SELECT subscription_status, subscription_plan,
             prescriptions_today_count, last_prescription_date
      FROM users
      WHERE email = ?
    `).bind(user.email).first();
  } catch (error) {
    console.error("Falha ao validar acesso ao treino de prescrição:", error);
    return jsonResponse({ error: "Não foi possível validar seu acesso agora." }, 500);
  }

  if (!account) {
    return jsonResponse({ error: "Conta não encontrada." }, 401);
  }
  if (!user.hasCpf) {
    return jsonResponse({
      error: "Informe seu CPF na página de assinatura antes de usar o treino.",
      requiresCpf: true
    }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
  }

  const prescricaoAluno = typeof body?.prescricaoAluno === "string"
    ? body.prescricaoAluno.trim()
    : "";
  const casoId = typeof body?.casoId === "string" ? body.casoId : "";
  const caso = Object.prototype.hasOwnProperty.call(RUBRICAS_POR_CASO, casoId)
    ? RUBRICAS_POR_CASO[casoId]
    : null;
  if (!caso) {
    return jsonResponse({ error: "Selecione um caso clínico válido." }, 400);
  }
  if (!prescricaoAluno) {
    return jsonResponse({ error: "Informe a prescrição para análise." }, 400);
  }

  const baseUrl = context.env?.BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/";
  const apiKey = context.env?.API_KEY;
  const model = context.env?.MODEL || "gemini-3.8-flash";
  if (!apiKey) {
    return jsonResponse({ error: "API_KEY não está configurada como segredo no ambiente do Cloudflare Pages." }, 500);
  }

  const systemPrompt = `
Você é um preceptor médico sênior avaliando a prescrição de um interno de medicina.

CASO CLÍNICO:
${caso.caso}

PRESCRIÇÃO DO ALUNO:
${prescricaoAluno}

DIRETRIZES DE REFERÊNCIA:
${caso.diretriz}

SUA TAREFA:
Analise a prescrição do aluno considerando o caso e as diretrizes acima. Não invente dados ausentes; quando dose ou conduta depender de peso, gestação, função renal/hepática, alergias ou outro dado não fornecido, indique o que precisa ser avaliado antes de prescrever. Sinalize contraindicações e ressalte que a decisão deve seguir protocolos locais e supervisão clínica. Este é um exercício educacional, não uma prescrição para paciente real. Responda exatamente nesta estrutura em Markdown:

### 1. Classificação Geral
[Adequada | Parcialmente Adequada | Incorreta]

### 2. Análise da Conduta Principal
- **Escolha e indicação:** [Avalie a adequação da conduta ao caso]
- **Posologia e duração:** [Avalie dose, via, frequência e duração quando aplicável]

### 3. Sintomáticos e Orientação
- **Alívio sintomático:** [Avalie medicamentos sintomáticos e segurança]
- **Medidas gerais e segurança:** [Cheque seguimento, monitorização e sinais de alarme]

### 4. Prescrição Modelo Recomendada
[Apresente uma sugestão educacional de prescrição baseada nas diretrizes, incluindo medidas não farmacológicas e ressalvas relevantes.]
`;

  let endpoint;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("Protocolo inválido.");
  } catch {
    return jsonResponse({ error: "A URL da API de IA não é válida." }, 500);
  }

  const today = new Date().toISOString().split("T")[0];
  const plan = getSubscriptionPlan(account);
  const isFree = plan === "free";
  if (!isFree && plan !== "prescription_only" && plan !== "pro") {
    return jsonResponse({
      requiresUpgrade: true,
      message: "Limite diário atingido. Assine um plano para uso ilimitado."
    }, 403);
  }
  if (isFree &&
      account.last_prescription_date === today &&
      account.prescriptions_today_count >= 1) {
    return jsonResponse({
      requiresUpgrade: true,
      message: "Limite diário atingido. Assine um plano para uso ilimitado."
    }, 403);
  }

  const planCondition = getPlanCondition(account, plan);

  try {
    const update = await env.DB.prepare(`
      UPDATE users
      SET prescriptions_today_count = CASE
            WHEN last_prescription_date = ? THEN prescriptions_today_count + 1
            ELSE 1
          END,
          last_prescription_date = ?
      WHERE email = ?
        AND (${planCondition.sql})
        AND (
          ? != 'free' OR
          (CASE WHEN last_prescription_date = ? THEN prescriptions_today_count ELSE 0 END) < 1
        )
    `).bind(today, today, user.email, planCondition.value, plan, today).run();

    if (update.meta?.changes !== 1) {
      return jsonResponse({
        requiresUpgrade: true,
        message: "Limite diário atingido. Assine um plano para uso ilimitado."
      }, 403);
    }
  } catch (error) {
    console.error("Falha ao atualizar o limite diário de prescrição:", error);
    return jsonResponse({ error: "Não foi possível registrar seu uso agora." }, 500);
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.1
      })
    });
  } catch {
    return new Response(JSON.stringify({ error: "Não foi possível conectar à API de IA." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return new Response(JSON.stringify({ error: "O serviço de análise retornou uma resposta inválida." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!response.ok) {
    return new Response(JSON.stringify({ error: `A API de IA retornou um erro (${response.status}).` }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  const analiseTexto = data.choices?.[0]?.message?.content;
  if (typeof analiseTexto !== "string" || !analiseTexto.trim()) {
    return new Response(JSON.stringify({ error: "O serviço de análise não retornou um feedback válido." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ analise: analiseTexto }), {
    headers: { "Content-Type": "application/json" }
  });
}
