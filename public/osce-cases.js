window.OSCE_CASES = [
  {
    id: 'icc-cronica-otimizacao',
    station: 'ESTAÇÃO 01',
    specialty: 'CARDIOLOGIA',
    title: 'Insuficiência cardíaca crônica — otimização terapêutica',
    setting: 'Ambulatório de Cardiologia',
    patientName: 'Sr. Antônio',
    age: 70,
    initials: 'SA',
    summary: 'Consulta de rotina para acompanhamento cardiológico. O paciente relata estar bem e sem queixas no momento.',
    scenario: 'Você atende Sr. Antônio, 70 anos, em consulta ambulatorial de rotina na Cardiologia. Ele veio para acompanhamento do problema cardíaco e diz estar se sentindo muito bem.',
    checklist: [
      { id: 'communication', label: 'Cumprimentou e se apresentou com acolhimento, empatia e linguagem acessível' },
      { id: 'congestion', label: 'Investigou sinais de congestão e baixo débito, incluindo ortopneia, DPN, dispneia e edema' },
      { id: 'adherence', label: 'Investigou adesão, efeitos adversos, peso diário e cuidados com sal e líquidos' },
      { id: 'exam', label: 'Avaliou sinais vitais e exame físico, classificando o paciente como compensado, perfil Stevenson A' },
      { id: 'sglt2', label: 'Propôs um inibidor de SGLT2, como dapagliflozina ou empagliflozina' },
      { id: 'arni', label: 'Discutiu troca do enalapril por sacubitril/valsartana e intervalo de 36 horas' },
      { id: 'diureticSafety', label: 'Justificou não iniciar diurético de alça sem congestão e orientou sinais de alerta, como ganho > 2 kg em 3 dias ou piora da falta de ar' }
    ]
  },
  {
    id: 'icc-aguda-perfil-b',
    station: 'ESTAÇÃO 02',
    specialty: 'CARDIOLOGIA · EMERGÊNCIA',
    title: 'Insuficiência cardíaca aguda descompensada — Perfil B',
    setting: 'Sala de emergência / Pronto-Socorro',
    patientName: 'Sr. Antônio',
    age: 70,
    initials: 'SA',
    summary: 'Dispneia intensa com piora súbita, ortopneia, tosse produtiva e febre baixa em paciente com insuficiência cardíaca crônica.',
    scenario: 'Você atende Sr. Antônio, 70 anos, trazido por familiares ao Pronto-Socorro com falta de ar intensa há dois dias, muito pior nesta noite. Há esfigmomanômetro, estetoscópio, oxímetro e dispositivos de oxigenoterapia/VNI disponíveis. Avalie e inicie o manejo de emergência.',
    checklist: [
      { id: 'initialApproach', label: 'Solicitou monitorização e acesso venoso e comunicou-se de forma clara e tranquilizadora' },
      { id: 'oxygenation', label: 'Iniciou suporte ventilatório imediato, preferindo VNI (CPAP/BiPAP) diante da hipoxemia' },
      { id: 'profile', label: 'Avaliou congestão e perfusão e classificou o quadro como Perfil B de Stevenson (quente e congesto)' },
      { id: 'trigger', label: 'Investigou e identificou infecção respiratória como possível fator de descompensação' },
      { id: 'diuretic', label: 'Indicou furosemida intravenosa, considerando dose inicial de 20 a 40 mg' },
      { id: 'vasodilator', label: 'Considerou vasodilatador intravenoso diante da pressão sistólica de 145 mmHg' },
      { id: 'urgentWorkup', label: 'Solicitou ECG, troponina, radiografia de tórax, gasometria, hemograma, PCR, função renal e eletrólitos' }
    ]
  },
  {
    id: 'edema-doenca-renal-cronica',
    station: 'ESTAÇÃO 03',
    specialty: 'CLÍNICA MÉDICA · NEFROLOGIA',
    title: 'Edema e doença renal crônica',
    setting: 'Ambulatório de Atenção Primária ou Especializada',
    patientName: 'Seu Sebastião Silva',
    age: 63,
    initials: 'SS',
    summary: 'Inchaço nas duas pernas há três semanas, acompanhado de cansaço, redução do volume urinário e urina espumosa.',
    scenario: 'Você atende Seu Sebastião Silva, 63 anos, em consulta ambulatorial. Ele procura atendimento por inchaço progressivo nas duas pernas há cerca de três semanas.',
    checklist: [
      { id: 'communication', label: 'Cumprimentou e se apresentou com acolhimento, empatia e postura profissional' },
      { id: 'edemaHistory', label: 'Caracterizou o edema: tempo de evolução, acometimento bilateral e fatores de melhora ou piora' },
      { id: 'comorbidities', label: 'Investigou tempo de diagnóstico e controle do diabetes e da hipertensão' },
      { id: 'generalExam', label: 'Solicitou sinais vitais, pressão arterial e peso, investigando retenção hídrica' },
      { id: 'segmentalExam', label: 'Avaliou cacifo/Godet e edema, além das auscultas cardíaca e pulmonar' },
      { id: 'differentials', label: 'Pesquisou sinais para diferenciais cardíacos, tireoidianos e hepáticos, incluindo turgência jugular, tireoide, ascite e fígado' },
      { id: 'diagnosis', label: 'Levantou síndrome edemigênica de provável origem renal e classificou a DRC como G3bA3, considerando nefropatia diabética ou hipertensiva' },
      { id: 'renalWorkup', label: 'Solicitou creatinina, ureia, potássio, EAS e UACR ou proteinúria de 24 horas' },
      { id: 'initialManagement', label: 'Orientou restrição de sal e propôs diurético de alça para o edema, evitando poupador de potássio diante do potássio no limite alto' }
    ]
  },
  {
    id: 'cirrose-hepatica-ascite',
    station: 'ESTAÇÃO 04',
    specialty: 'CLÍNICA MÉDICA · HEPATOLOGIA',
    title: 'Cirrose hepática com ascite volumosa',
    setting: 'Atendimento de urgência / emergência',
    patientName: 'L.S.M.',
    age: 50,
    initials: 'LSM',
    summary: 'Homem de 50 anos com aumento progressivo do abdômen há duas semanas, dispneia em repouso e histórico de etilismo crônico.',
    scenario: 'Você atende L.S.M., 50 anos, com aumento progressivo do volume abdominal há duas semanas e dificuldade respiratória mesmo em repouso. Investigue a causa e conduza a avaliação inicial.',
    checklist: [
      { id: 'communication', label: 'Cumprimentou e se apresentou com acolhimento, empatia e postura profissional' },
      { id: 'symptoms', label: 'Caracterizou o aumento abdominal de duas semanas e investigou sintomas associados, como dispneia, fadiga e icterícia' },
      { id: 'history', label: 'Investigou antecedentes, medicações, alergias, diabetes, hipertensão, tabagismo e etilismo' },
      { id: 'exam', label: 'Solicitou sinais vitais e avaliou estado geral, pele, auscultas cardíaca e respiratória, abdômen e fígado' },
      { id: 'ascites', label: 'Pesquisou ascite com piparote, macicez móvel e semicírculo de Skoda' },
      { id: 'initialWorkup', label: 'Solicitou exames de função hepática e decidiu por paracentese diagnóstica e de alívio' },
      { id: 'childPughAndSaag', label: 'Solicitou bilirrubina, albumina sérica e TP/INR para permitir o Child-Pugh, sem precisar calcular o escore, e calculou GASA de 1,2 g/dL' },
      { id: 'albuminPbeSodium', label: 'Reconheceu ausência de PBE, indicou albumina 6–8 g por litro drenado após paracentese volumosa e orientou dieta com pouco sódio sem restrição hídrica' },
      { id: 'diagnosis', label: 'Considerou cirrose hepática como hipótese diagnóstica final' }
    ]
  },
  {
    id: 'erisipela-mid',
    station: 'ESTAÇÃO 05',
    specialty: 'CLÍNICA MÉDICA · DERMATOLOGIA',
    title: 'Erisipela de membro inferior direito',
    setting: 'Ambulatório de Atenção Primária ou Especializada',
    patientName: 'M.A.S.',
    age: 28,
    initials: 'MAS',
    summary: 'Edema doloroso, quente e eritematoso na perna direita, em progressão há cinco dias, sem febre.',
    scenario: 'Você atende M.A.S., 28 anos, com edema doloroso e eritematoso na porção distal da perna direita há cinco dias. O quadro começou após jogar futebol. Investigue a história, examine o paciente e conduza a avaliação.',
    checklist: [
      { id: 'communication', label: 'Cumprimentou e se apresentou com acolhimento, empatia e postura profissional' },
      { id: 'symptoms', label: 'Caracterizou o edema doloroso, unilateral e progressivo há cinco dias e investigou sintomas sistêmicos' },
      { id: 'history', label: 'Investigou antecedentes, medicações, hábitos, alergias e uso recente de antibióticos' },
      { id: 'triggers', label: 'Perguntou sobre trauma, feridas, uso de drogas injetáveis e outros fatores de ruptura da barreira cutânea' },
      { id: 'exam', label: 'Solicitou sinais vitais e realizou exame físico geral, avaliando gravidade, perfusão e sinais de síndrome compartimental' },
      { id: 'localFindings', label: 'Identificou edema unilateral, quente, eritematoso, doloroso e bem delimitado; a consistência é descrita como elástica no exame físico fornecido' },
      { id: 'doppler', label: 'Solicitou Doppler venoso do membro inferior direito para investigar/excluir TVP' },
      { id: 'diagnosis', label: 'Após o Doppler, considerou erisipela do membro inferior direito como hipótese diagnóstica final' },
      { id: 'management', label: 'Propôs tratamento ambulatorial com antibioticoterapia adequada aos patógenos prováveis, considerando a alergia relatada, além de cuidados locais e orientações de retorno' }
    ]
  }
];
