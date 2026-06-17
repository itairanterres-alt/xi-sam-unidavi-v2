/* ============================================================
   XI SAM 2026 — DADOS.
   · PROGRAMA: cronograma oficial, mantido pelo coordenador AQUI.
     Cada item (oral ou pôster) aceita um campo OPCIONAL `id`
     (ex.: id:"T-0012") que liga manualmente ao trabalho liberado,
     vencendo o casamento automático por nome.
   · TRABALHOS: exemplos usados APENAS como fallback de
     desenvolvimento local (ver lib.jsx). Nunca aparecem ao público
     em produção — a lista real vem do backend (curadoria).
   Globais expostos em window para os scripts Babel.
   ============================================================ */

const C = {
  azul: "#023E88", azulEsc: "#01285A",
  ciano: "#00ADEF", cianoClaro: "#E5F6FE",
  tinta: "#0C1A2B", cinza: "#5B6B7E",
  cinzaClaro: "#EEF2F6", papel: "#F7F9FB", ambar: "#B07A18",
};

const AREA_COR = {
  "Educação Médica": "#5B6B7E", "Neurologia": "#6A4C93", "Neurocirurgia": "#5B3A82",
  "Geriatria": "#B07A18", "Psiquiatria": "#7A4D9C", "Medicina de Família e Comunidade": "#D38F00",
  "Ginecologia e Obstetrícia": "#B23A82", "Oncologia": "#2A8A5C", "Otorrinolaringologia": "#0080B7",
  "Endocrinologia": "#C4622D", "Infectologia": "#3D6E1B", "Pediatria": "#00ADEF",
  "Cardiologia": "#A23A1F", "Cirurgia Vascular": "#7A2616",
  "Anestesiologia": "#33658A", "Cirurgia Geral": "#7A4419", "Reumatologia": "#9C3D54",
  "Gastroenterologia": "#946B2D", "Dermatologia": "#2F7E78", "Ortopedia": "#46537A",
};

const DIAS = ["Seg · 22/06", "Ter · 23/06", "Qua · 24/06", "Qui · 25/06", "Sex · 26/06"];

/* TRABALHOS EXEMPLO — fallback de DESENVOLVIMENTO LOCAL apenas (nunca em produção) */
const TRABALHOS = [
  { id:"EX-01", fase:7, desenho:"Estudo transversal", area:"Ginecologia e Obstetrícia",
    titulo:"Adesão ao rastreamento de câncer de colo uterino em unidades de saúde da família do Alto Vale do Itajaí",
    autores:["A. Discente Exemplo","B. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"O câncer de colo uterino permanece como causa evitável de mortalidade feminina. O rastreamento citopatológico é a principal estratégia de detecção precoce na atenção primária.",
    objetivos:"Estimar a adesão ao rastreamento e identificar fatores associados à não realização do exame.",
    metodos:"Estudo transversal com 380 mulheres de 25–64 anos cadastradas em quatro ESF, por amostragem aleatória.",
    resultados:"Resultados esperados: estimativa de cobertura por faixa etária e identificação de barreiras de acesso.",
    conclusao:"O projeto deve orientar estratégias locais de ampliação da cobertura no território.",
    palavras:["Neoplasias do colo do útero","Atenção primária","Programas de rastreamento"],
    figuras:[ {ordem:1,secao:"Métodos",legenda:"Fluxo de seleção das ESF participantes",principal:false}, {ordem:2,secao:"Resultados",legenda:"Distribuição da amostra por faixa etária e ESF",principal:true} ] },
  { id:"EX-02", fase:7, desenho:"Revisão sistemática", area:"Endocrinologia",
    titulo:"Metformina versus intervenção dietética isolada na progressão do pré-diabetes: revisão sistemática",
    autores:["C. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"O pré-diabetes representa janela de oportunidade para prevenção. Há debate sobre a melhor estratégia inicial.",
    objetivos:"Comparar a eficácia da metformina e da intervenção dietética isolada na progressão para diabetes tipo 2.",
    metodos:"Revisão sistemática em MEDLINE, Embase e Cochrane seguindo PRISMA.",
    resultados:"Síntese qualitativa e, se houver homogeneidade, meta-análise dos desfechos.",
    conclusao:"A síntese deve orientar a conduta inicial no pré-diabetes na atenção primária.",
    palavras:["Estado pré-diabético","Metformina","Dieta"],
    figuras:[ {ordem:1,secao:"Métodos",legenda:"Fluxograma PRISMA da seleção dos estudos",principal:true} ] },
  { id:"EX-03", fase:7, desenho:"Estudo ecológico", area:"Infectologia",
    titulo:"Tendência temporal das internações por dengue no Alto Vale do Itajaí, 2015–2024",
    autores:["D. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"A dengue impõe carga crescente aos serviços de saúde. A análise de tendências apoia o planejamento.",
    objetivos:"Descrever a tendência temporal das internações por dengue na microrregião em dez anos.",
    metodos:"Estudo ecológico de séries temporais com dados do SIH/SUS, com regressão de Prais-Winsten.",
    resultados:"Resultados esperados: identificação de tendência e padrão sazonal das internações.",
    conclusao:"Os achados devem subsidiar o cronograma de ações de controle vetorial.",
    palavras:["Dengue","Séries temporais","Hospitalização"],
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Série temporal das internações por mês (2015–2024)",principal:true} ] },
  { id:"EX-04", fase:8, desenho:"Relato de caso", area:"Pediatria",
    titulo:"Apresentação atípica de lúpus eritematoso sistêmico de início juvenil: relato de caso",
    autores:["E. Discente Exemplo","F. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"O LES juvenil pode cursar com apresentações inespecíficas, retardando o diagnóstico.",
    objetivos:"Relatar caso de LES juvenil com apresentação atípica e revisar a literatura pertinente.",
    metodos:"Caso de adolescente com febre prolongada, poliartralgia e citopenias. Consentimento obtido.",
    resultados:"A investigação evidenciou critérios diagnósticos de LES, com boa resposta ao tratamento.",
    conclusao:"O reconhecimento de apresentações atípicas reduz o atraso diagnóstico.",
    palavras:["Lúpus eritematoso sistêmico","Adolescente","Diagnóstico tardio"],
    resumo_completo:"Introdução: o lúpus eritematoso sistêmico de início juvenil pode cursar com apresentações inespecíficas, retardando o diagnóstico. Objetivo: relatar caso de LES juvenil com apresentação atípica e revisar a literatura pertinente. Método: relato de caso de adolescente com febre prolongada, poliartralgia e citopenias, com consentimento obtido. Resultados: a investigação evidenciou critérios diagnósticos de LES, com boa resposta ao tratamento instituído. Conclusão: o reconhecimento de apresentações atípicas reduz o atraso diagnóstico e melhora o prognóstico.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Linha do tempo clínica e laboratorial do caso",principal:true} ] },
  { id:"EX-05", fase:8, desenho:"Estudo transversal", area:"Psiquiatria",
    titulo:"Sintomas de ansiedade e qualidade do sono entre estudantes de Medicina: estudo transversal",
    autores:["G. Discente Exemplo"], orientador:"Orientadora Exemplo",
    intro:"A formação médica é reconhecida fonte de sofrimento psíquico.",
    objetivos:"Estimar a prevalência de sintomas de ansiedade e sua associação com a qualidade do sono.",
    metodos:"Estudo transversal com instrumentos validados (GAD-7 e Pittsburgh) aplicados aos estudantes.",
    resultados:"Prevalência elevada de sintomas ansiosos, com associação significativa à má qualidade do sono.",
    conclusao:"Os achados reforçam a necessidade de programas institucionais de apoio à saúde mental.",
    palavras:["Ansiedade","Sono","Estudantes de medicina"],
    resumo_completo:"Introdução: a formação médica é reconhecida fonte de sofrimento psíquico. Objetivo: estimar a prevalência de sintomas de ansiedade e sua associação com a qualidade do sono entre estudantes de Medicina. Método: estudo transversal com instrumentos validados (GAD-7 e índice de Pittsburgh) aplicados aos estudantes. Resultados: observou-se prevalência elevada de sintomas ansiosos, com associação significativa à má qualidade do sono. Conclusão: os achados reforçam a necessidade de programas institucionais de apoio à saúde mental.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Distribuição dos escores de ansiedade (GAD-7)",principal:false}, {ordem:2,secao:"Resultados",legenda:"Associação entre ansiedade e qualidade do sono",principal:true} ] },
  { id:"EX-06", fase:8, desenho:"Estudo de coorte", area:"Cardiologia",
    titulo:"Fatores associados à reinternação em 30 dias após insuficiência cardíaca descompensada",
    autores:["H. Discente Exemplo"], orientador:"Orientador Exemplo",
    intro:"A reinternação precoce por IC é marcador de qualidade assistencial e desfecho evitável.",
    objetivos:"Identificar fatores associados à reinternação em 30 dias após internação por IC descompensada.",
    metodos:"Coorte retrospectiva de pacientes internados por IC, com seguimento de 30 dias.",
    resultados:"Fatores como classe funcional avançada e ausência de conciliação medicamentosa associaram-se a maior risco.",
    conclusao:"Intervenções na transição de cuidado podem reduzir reinternações precoces.",
    palavras:["Insuficiência cardíaca","Readmissão","Transição de cuidado"],
    resumo_completo:"Introdução: a reinternação precoce por insuficiência cardíaca é marcador de qualidade assistencial e desfecho evitável. Objetivo: identificar fatores associados à reinternação em 30 dias após internação por IC descompensada. Método: coorte retrospectiva de pacientes internados por IC, com seguimento de 30 dias. Resultados: fatores como classe funcional avançada e ausência de conciliação medicamentosa associaram-se a maior risco. Conclusão: intervenções na transição de cuidado podem reduzir reinternações precoces.",
    figuras:[ {ordem:1,secao:"Resultados",legenda:"Curva de risco de reinternação em 30 dias",principal:true} ] },
];

/* PROGRAMA REAL — cronograma provisório XI SAM (mantido pelo coordenador).
   Item oral:   { tc, hora, area, ap, titulo, uc, id? }
   Item pôster: { n, ap, id? }
   `id` (opcional) = override manual: liga o item exatamente àquele trabalho.
   `youtube` (por dia) = URL FIXA da transmissão ao vivo daquele dia (transmissões
   oficiais da XI SAM); com link, aparece o botão “▶ Assistir ao vivo” no cabeçalho
   do dia; vazio = sem botão. NÃO esvaziar estes links em regenerações. */
const PROGRAMA = {
  "Seg · 22/06": { sci:"16h45–17h45", abertura:{ hora:"17h45–18h00", label:"Abertura da XI SAM" }, youtube:"https://www.youtube.com/watch?v=1QSae8MBEvc",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Educação Médica", ap:"Edson Mendes de Oliveira Filho", titulo:"Educação em medicina baseada em evidências e pensamento crítico frente às pseudociências na formação médica", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC2", hora:"18h40", area:"Neurologia", ap:"Julia Leticia Dutra", titulo:"Metilfenidato para síndrome de desregulação dopaminérgica na doença de Parkinson: uma série de casos", uc:"Samantha Cristiane Lopes" },
      { tc:"TC3", hora:"19h20", area:"Neurologia", ap:"Ana Clara Esser", titulo:"Preditores de gravidade e desfechos clínicos em crianças com traumatismo cranioencefálico atendidas em um hospital terciário do Alto Vale do Itajaí: uma coorte retrospectiva", uc:"Alinne Petris" },
      { tc:"TC4", hora:"20h00", area:"Geriatria", ap:"Letícia Ellen dos Santos", titulo:"Evolução dos indicadores de sarcopenia em idosos participantes de um Centro de Convivência de Santa Catarina: estudo de coorte retrospectivo", uc:"Alinne Petris" },
      { tc:"TC5", hora:"20h40", area:"Neurocirurgia", ap:"Angelina Castagna Corrêa", titulo:"Instabilidade da coluna cervical em paciente após tétano generalizado: um relato de caso com abordagem neurocirúrgica", uc:"Samantha Cristiane Lopes" },
      { tc:"TC6", hora:"21h20", area:"Psiquiatria", ap:"Maria Eduarda Coelho", titulo:"Depressão perinatal e seus impactos para o desenvolvimento neuropsicomotor infantil: uma revisão sistemática", uc:"Franciani Rodrigues da Rocha" },
    ],
    posteres:[
      { n:1, area:"Cardiologia", ap:"Milena Goedert", titulo:"Hipotireoidismo como possível fator associado à progressão da aterosclerose grave: um relato de caso" },
      { n:2, area:"Psiquiatria", ap:"Ana Luíza Tenfen", titulo:"Perfil clínico e sociodemográfico de pacientes com transtorno do jogo em um CAPS do Alto Vale do Itajaí: uma série de relatos de caso" },
      { n:3, area:"Anestesiologia", ap:"Antonella Gubert Verch", titulo:"Anestesia livre de opioides em cirurgia cardíaca com circulação extracorpórea: uma revisão sistemática e meta-análise" },
      { n:4, area:"Dermatologia", ap:"Augusto Henrique Gamba", titulo:"A viabilização da disponibilização gratuita de protetor solar pelo SUS como medida preventiva ao câncer de pele: uma revisão literária integrativa" },
      { n:5, area:"Ginecologia e Obstetrícia", ap:"Bruna Gonzales Nejm", titulo:"Eficácia comparativa dos agonistas do receptor de GLP-1 em mulheres com sobrepeso ou obesidade e SOP: uma revisão sistemática com network meta-analyses" },
      { n:6, area:"Neurocirurgia", ap:"Carl Zolet Jonck", titulo:"Doença de Lhermitte-Duclos: apresentação clínica, diagnóstico e abordagem neurocirúrgica" },
    ] },
  "Ter · 23/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=pc-VW8XK82Y",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Medicina de Família e Comunidade", ap:"Larissa Yamaoka Piske", titulo:"Avaliação das modificações clínico-laboratoriais após a introdução de dapagliflozina em pacientes com DM2 atendidos em uma UBS do Alto Vale do Itajaí: uma coorte retrospectiva", uc:"Samantha Cristiane Lopes" },
      { tc:"TC2", hora:"18h40", area:"Psiquiatria", ap:"Kadyuél Mariano", titulo:"Intervenções psiquiátricas multidisciplinares em detentos com transtornos mentais: impactos na reintegração social e redução da reincidência criminal — uma revisão integrativa", uc:"Alinne Petris" },
      { tc:"TC3", hora:"19h20", area:"Ginecologia e Obstetrícia", ap:"Kauana Decker", titulo:"Desafios diagnósticos na determinação do sexo fetal frente discordância entre USG e NIPT: um relato de caso", uc:"Samantha Cristiane Lopes" },
      { tc:"TC4", hora:"20h00", area:"Oncologia", ap:"Clarice Grasmück", titulo:"Perfil epidemiológico e qualidade de vida de pacientes com carcinoma mamário ductal invasivo em um ambulatório de oncologia no Alto Vale do Itajaí", uc:"Alinne Petris" },
      { tc:"TC5", hora:"20h40", area:"Otorrinolaringologia", ap:"Yasmim de Abreu Heinz", titulo:"Impacto da adenotonsilectomia versus conduta expectante em crianças com apneia obstrutiva do sono: uma revisão sistemática", uc:"Alinne Petris" },
      { tc:"TC6", hora:"21h20", area:"Psiquiatria", ap:"Gabriel Kummrow Lauer", titulo:"Entre o ensino e o cuidado: avaliação da qualidade de vida e do risco de suicídio em médicos professores em uma IES de Santa Catarina", uc:"Alinne Petris" },
    ],
    posteres:[
      { n:1, area:"Cirurgia Torácica", ap:"Élton Léo Junglos", titulo:"Hemotórax retido no trauma torácico: incidência, fatores preditores e desenvolvimento da escala THOR para estratificação da necessidade de cirurgia torácica precoce" },
      { n:2, area:"Cirurgia Geral", ap:"Emanuela Tenfen", titulo:"Câncer de cólon como causa de abdome agudo grave: análise comparativa entre quadros obstrutivos e perfurativos (2023–2025) em um hospital do Alto Vale do Itajaí" },
      { n:3, area:"Cardiologia", ap:"Emily Martins Arruda", titulo:"Eficácia e segurança da dexmedetomidina em pacientes submetidos a TAVR: uma revisão sistemática e metanálise" },
      { n:4, area:"Gastroenterologia", ap:"Graciane Zemke", titulo:"Migração intrabiliar de clipes cirúrgicos como complicação rara pós-colecistectomia laparoscópica: relato de caso e revisão da literatura" },
      { n:5, area:"Ortopedia", ap:"Gabriel Borella Rosado", titulo:"Associação entre tempo de internação hospitalar e mortalidade em até um ano em idosos com fraturas proximais de fêmur: estudo de coorte retrospectiva" },
      { n:6, area:"Gastroenterologia", ap:"Gabriela Lucia Imhoff", titulo:"Abdome agudo obstrutivo por melanoma metastático: um relato de caso" },
    ] },
  "Qua · 24/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=WGu-ALY8jBM",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Endocrinologia", ap:"Beatriz Meinicke da Silva", titulo:"Internações por cetoacidose diabética em um hospital terciário do sul do Brasil: perfil clínico e epidemiológico, manejo e desfechos em uma coorte retrospectiva", uc:"Samantha Cristiane Lopes" },
      { tc:"TC2", hora:"18h40", area:"Endocrinologia", ap:"Isabella Schiestl Grudtner", titulo:"Manejo terapêutico e desfechos materno-fetais associados ao diabetes mellitus gestacional: estudo de coorte retrospectiva", uc:"Samantha Cristiane Lopes" },
      { tc:"TC3", hora:"19h20", area:"Endocrinologia", ap:"Nicolas Vendrame Crippa", titulo:"Apresentação síncrona de três subtipos distintos de carcinoma tireoidiano: um relato de caso", uc:"Samantha Cristiane Lopes" },
      { tc:"TC4", hora:"20h00", area:"Endocrinologia", ap:"Yasmim Antunes Rodrigues", titulo:"Deficiência isolada de GH diagnosticada precocemente e evolução terapêutica: um relato de caso", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h40", area:"Endocrinologia", ap:"Laila Maria Longen", titulo:"Terapia combinada com linagliptina, verapamil e vitamina D para preservar a reserva pancreática no diabetes autoimune latente do adulto (LADA): relato de caso", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC6", hora:"21h20", area:"Endocrinologia", ap:"Maiara Letícia Willers Carrard", titulo:"Inteligência artificial na classificação de nódulos tireoidianos indeterminados: revisão sistemática de evidências ultrassonográficas e multimodais", uc:"Samantha Cristiane Lopes" },
    ],
    posteres:[
      { n:1, area:"Endocrinologia", ap:"Gabriela Luiza Cezar", titulo:"Caracterização clínica e desfechos hospitalares de pacientes com hipoglicemia internados em enfermaria: uma coorte retrospectiva" },
      { n:2, area:"Endocrinologia", ap:"Gabriela Tambosi Catafesta", titulo:"Diabetes atípico com resposta à abordagem terapêutica direcionada para MODY: relato de caso" },
      { n:3, area:"Infectologia", ap:"Fernando Lima Nogueira", titulo:"Perfil epidemiológico e microbiológico da endocardite infecciosa e proposta de antibioticoterapia empírica em um hospital do Alto Vale do Itajaí: um estudo retrospectivo" },
      { n:4, area:"Endocrinologia", ap:"Gercino de Matos Neto", titulo:"Agonorexia induzida por agonistas do receptor de GLP-1: transtornos alimentares restritivos como evento adverso emergente avaliado por metanálise" },
      { n:5, area:"Infectologia", ap:"Henrique de Moraes Andrade", titulo:"Valor prognóstico de biomarcadores inflamatórios na predição de mortalidade e falha terapêutica na osteomielite vertebral piogênica: uma revisão sistemática e meta-análise" },
      { n:6, area:"Obstetrícia", ap:"Íris Lyra Martendal", titulo:"Perfil epidemiológico e fatores associados ao aborto espontâneo em um hospital regional do sul do Brasil: análise por idade gestacional e comorbidades maternas" },
      { n:7, area:"Dermatologia", ap:"Jaqueline Klagemberg", titulo:"Segurança e desfechos cicatriciais de procedimentos dermatológicos em pacientes em uso de isotretinoína: uma revisão sistemática da literatura" },
    ] },
  "Qui · 25/06": { sci:"17h00–18h00", youtube:"https://www.youtube.com/watch?v=SowwQ5Z28Ow",
    orais:[
      { tc:"TC1", hora:"18h00", area:"Infectologia", ap:"Luísa Rodrigues Bagatoli", titulo:"Fatores associados à mortalidade em pacientes oncológicos com neutropenia febril internados em um hospital do interior de Santa Catarina (2020–2025): estudo de coorte retrospectiva", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC2", hora:"18h40", area:"Pediatria", ap:"Ana Julia Barpi", titulo:"Fatores de risco maternos, neonatais e assistenciais para o desenvolvimento de sepse neonatal em um hospital terciário: análise e prevenção", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC3", hora:"19h20", area:"Pediatria", ap:"Isadora Rosa Mergener de Bortolo", titulo:"Perfil epidemiológico das internações por bronquiolite aguda no Alto Vale do Itajaí entre 2020 e 2025: um estudo transversal", uc:"Alinne Petris" },
      { tc:"TC4", hora:"20h00", area:"Infectologia", ap:"Joana Rosa de Jesus", titulo:"Além da tríade de OMS: meta-análise bivariada de acurácia diagnóstica de biomarcadores moleculares, sorológicos inovadores e ultrassonográficos para a lacuna diagnóstica na hanseníase", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h40", area:"Infectologia", ap:"Gabriela Luiza de Andrade Muller", titulo:"Infecções bacterianas em pacientes hospitalizados: perfil microbiológico, sensibilidade antimicrobiana e desfecho clínico em hospital terciário de Santa Catarina, Brasil", uc:"Alinne Petris" },
      { tc:"TC6", hora:"21h20", area:"Pediatria", ap:"Yasmin dos Prazeres Araujo", titulo:"Síndrome DRESS induzida por antibióticos no tratamento de pneumonia necrotizante em paciente pediátrico: um relato de caso", uc:"Alinne Petris" },
    ],
    posteres:[
      { n:1, area:"Psiquiatria", ap:"Jaqueline Vansuita", titulo:"Perfil clínico de adultos com TDAH atendidos no sistema público de saúde de um município de médio porte no sul do Brasil" },
      { n:2, area:"Pediatria", ap:"Kalessa Pereira Menegusse", titulo:"Comparação entre a vacinação particular e do SUS contra pneumococo em crianças de 0–10 anos hospitalizadas com pneumonia adquirida na comunidade em estágio grave" },
      { n:3, area:"Neurologia", ap:"Kaylaine Rodrigues Almeida Andrade", titulo:"Fatores associados à mortalidade intra-hospitalar em pacientes internados com acidente vascular cerebral" },
      { n:4, area:"Medicina do Estilo de Vida", ap:"Leandro Iomes de Souza", titulo:"CARMEN 2.0: calendário autoavaliativo para reforço e monitoramento de estilo de vida e novos hábitos — um estudo clínico" },
      { n:5, area:"Psiquiatria", ap:"Luísa Fronza Gomes", titulo:"Comparação dos antecedentes pré-natais, perinatais e pós-natais entre crianças com e sem o diagnóstico de transtorno do espectro autista: estudo caso-controle" },
      { n:6, area:"Reumatologia", ap:"Manuella Knop dos Passos", titulo:"Granulomatose com poliangeíte associada a serosite unilateral: um relato de caso" },
      { n:7, area:"Otorrinolaringologia", ap:"Maria Luísa Ceolin Xavier da Silveira", titulo:"Profilaxia antibiótica de curta versus longa duração na prevenção de infecção de sítio cirúrgico em implante coclear: uma revisão sistemática e metanálise" },
    ] },
  "Sex · 26/06": { sci:"16h20–17h20", youtube:"https://www.youtube.com/watch?v=KfSxB-WxbVw",
    orais:[
      { tc:"TC1", hora:"17h20", area:"Medicina de Família e Comunidade", ap:"Isabela Lamin Klegin", titulo:"Internações por acidente vascular cerebral no Brasil antes, durante e após a pandemia de Covid-19: estudo ecológico de série temporal", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC2", hora:"18h00", area:"Cirurgia Vascular", ap:"Rafaela Fritsche", titulo:"Fatores associados e desfechos clínicos de pacientes com doença arterial obstrutiva periférica em um hospital do Alto Vale do Itajaí", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC3", hora:"18h40", area:"Cardiologia", ap:"Ana Paula Deluca", titulo:"Preditores clínicos e laboratoriais de disfunção ventricular em pacientes com infarto agudo do miocárdio: uma coorte prospectiva", uc:"Cristina Bichels Hebeda" },
      { tc:"TC4", hora:"19h20", area:"Cardiologia", ap:"Carlos Gabriel Maiberg", titulo:"Comparação das internações e óbitos por infarto agudo do miocárdio no Brasil antes, durante e após a pandemia de covid-19: um estudo ecológico de séries temporais", uc:"Franciani Rodrigues da Rocha" },
      { tc:"TC5", hora:"20h00", area:"Cardiologia", ap:"Milena Dal Witt de Souza", titulo:"Revisitando a terapia com betabloqueadores para insuficiência cardíaca com fração de ejeção preservada: uma revisão sistemática e meta-análise", uc:"Samantha Cristiane Lopes" },
      { tc:"TC6", hora:"20h40", area:"Cardiologia", ap:"Marcel Felipe Alves", titulo:"Avaliação ecocardiográfica da disfunção diastólica do ventrículo esquerdo induzida por quimioterapia: uma revisão sistemática e meta-análise", uc:"Alinne Petris" },
      { tc:"TC7", hora:"21h20", area:"Neurologia", ap:"Fábio Valerio Borelli", titulo:"Uso adjunto de tirofiban e efeito de primeira passagem durante trombectomia endovascular para oclusão de grandes vasos: uma revisão sistemática e metanálise", uc:"Samantha Cristiane Lopes" },
    ],
    posteres:[
      { n:1, area:"Oncologia", ap:"Milena Ferreira de Souza", titulo:"Prevalência e perfil epidemiológico de pacientes com câncer de mama submetidos a tratamento cirúrgico (2023–2025) em um hospital do Alto Vale do Itajaí" },
      { n:2, area:"Ginecologia e Obstetrícia", ap:"Abraham Lincoln Galdino Costa", titulo:"Fluxo assistencial em obstetrícia hospitalar: avaliação do perfil das pacientes e dos indicadores de ocupação para planejamento em saúde" },
      { n:3, area:"Cardiologia", ap:"Millena Laurindo", titulo:"Da assistolia ao ritmo estimulado: Holter 24 horas documenta reanimação cardiopulmonar e recuperação circulatória em paciente sem cardiopatia estrutural — um relato de caso" },
      { n:4, area:"Cardiologia", ap:"Rodrigo Voigt Filho", titulo:"Associação entre o uso de benzodiazepínicos e desfechos clínicos adversos em pacientes com insuficiência cardíaca: revisão sistemática e meta-análise" },
      { n:5, area:"Psiquiatria", ap:"Sofia Venturi", titulo:"Efeitos psiquiátricos dos análogos de GLP-1 em adultos: uma revisão sistemática" },
      { n:6, area:"Cardiologia", ap:"Suelen Dias Clasen", titulo:"Origem da artéria circunflexa coronária a partir da artéria descendente posterior: um relato de caso" },
      { n:7, area:"Pediatria", ap:"Victória Gabriela Wetzstein", titulo:"Internações neonatais em unidades de cuidados intermediários e terapia intensiva: investigação do perfil epidemiológico e fatores de risco materno-neonatais" },
    ] },
};

/* trabalhoById: resolve nos EXEMPLOS — uso interno/dev. As telas públicas
   resolvem na lista real via useTrabalhos()/trabalhoNaLista (lib.jsx). */
const trabalhoById = (id) => TRABALHOS.find((t) => t.id === id);
const go = (h) => { window.location.hash = h; };

Object.assign(window, { C, AREA_COR, DIAS, TRABALHOS, PROGRAMA, trabalhoById, go });
