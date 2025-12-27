function calcular() {
  // Validações iniciais
  const anoSelecionado = document.getElementById("anoCalculo").value;
  const tipoDeducao = document.getElementById("tipoDeducao").value;

  if (!anoSelecionado) {
    alert("Selecione o ano do cálculo (2025 ou 2026).");
    return;
  }
  if (!tipoDeducao) {
    alert("Selecione o tipo de dedução de IR (Deduções legais ou Desconto simplificado).");
    return;
  }

  // Entradas
  const salario = parseFloat(document.getElementById("salario").value) || 0;
  const horaExtra = parseFloat(document.getElementById("horaExtra").value) || 0;
  const dsrHoraExtra = parseFloat(document.getElementById("dsrHoraExtra").value) || 0;
  const comissao = parseFloat(document.getElementById("comissao").value) || 0;
  const tarefa = parseFloat(document.getElementById("tarefa").value) || 0;
  const dsrTarefa = parseFloat(document.getElementById("dsrTarefa").value) || 0;
  const premio = parseFloat(document.getElementById("premio").value) || 0;
  const faltas = parseFloat(document.getElementById("faltas").value) || 0;
  const afastamento = parseFloat(document.getElementById("afastamento").value) || 0;
  const dsrFalta = parseFloat(document.getElementById("dsrFalta").value) || 0;

  // const premio = parseFloat(document.getElementById("premio").value) || 0;
  const dependentes = parseInt(document.getElementById("dependentes").value) || 0;
  const pensao = parseFloat(document.getElementById("pensao").value) || 0;

  const ferias = parseFloat(document.getElementById("ferias")?.value) || 0;
  const umTerco = parseFloat(document.getElementById("umTerco")?.value) || 0;
  const pensaoFerias = parseFloat(document.getElementById("pensaoFerias")?.value) || 0;
  
  const decimoTerceiro = parseFloat(document.getElementById("decimoTerceiro")?.value) || 0;
  const pensao13 = parseFloat(document.getElementById("pensao13")?.value) || 0;
  const plr = parseFloat(document.getElementById("plr")?.value) || 0;

  // Base de proventos e descontos (INSS não inclui prêmio)
  const proventosTributaveis = salario + horaExtra + dsrHoraExtra + comissao + tarefa + dsrTarefa;
  const descontos = faltas + afastamento + dsrFalta;

  let baseINSS = proventosTributaveis - descontos;
  if (baseINSS < 0) baseINSS = 0;

  // Cálculo INSS progressivo Faixas oficiais de 2025
  const faixasINSS = [
    { min: 0.00,     max: 1518.00, aliquota: 0.075 },
    { min: 1518.01,  max: 2793.88, aliquota: 0.09  },
    { min: 2793.89,  max: 4190.83, aliquota: 0.12 },
    { min: 4190.84,  max: 8157.14, aliquota: 0.14 }
  ];
  const TETO_INSS = 951.62;

  function calcularINSS(base) {
    if (base <= 0) return 0;
    let contribuicao = 0;
    for (const faixa of faixasINSS) {
      const tetoFaixa = Math.min(base, faixa.max);
      const pisoFaixa = faixa.min;
      if (tetoFaixa > pisoFaixa) {
        const valorNaFaixa = tetoFaixa - pisoFaixa;
        contribuicao += valorNaFaixa * faixa.aliquota;
      }
    }
    return Math.min(contribuicao, TETO_INSS);
  }

  const DEDUCAO_SIMPLIFICADA = 607.20;
  const DEDUCAO_DEPENDENTE = 189.59;

  function calcularIRRF(baseIR) {
    if (baseIR <= 2428.80) return 0;
    else if (baseIR <= 2826.65) return baseIR * 0.075 - 182.16;
    else if (baseIR <= 3751.05) return baseIR * 0.15 - 394.16;
    else if (baseIR <= 4664.68) return baseIR * 0.225 - 675.49;
    else return baseIR * 0.275 - 908.73;
  }

  // Resultado Mensal
  const inssMensal = calcularINSS(baseINSS);
  const abatimentoDependentes = dependentes * DEDUCAO_DEPENDENTE;

  let baseIRMensal;
  let modoDescricaoMensal = "";

  if (tipoDeducao === "legais") {
    baseIRMensal = (baseINSS + premio) - inssMensal - abatimentoDependentes - pensao;
    modoDescricaoMensal = "deduções legais";
  } else {
    baseIRMensal = (baseINSS + premio) - DEDUCAO_SIMPLIFICADA;
    modoDescricaoMensal = "desconto simplificado";
  }

  if (baseIRMensal < 0) baseIRMensal = 0;

  let irMensal = calcularIRRF(baseIRMensal);
  let irMensalAntesRedutor = irMensal;
  let redutorMensal = 0;

if (anoSelecionado === "2026") {
  const baseTotalTributavel = baseINSS + premio;
  redutorMensal = 978.62 - (baseTotalTributavel * 0.133145);
  if (redutorMensal < 0) redutorMensal = 0; // Não considerar quando for negativo
  irMensal = Math.max(irMensal - redutorMensal, 0);
}


  const liquidoMensal = proventosTributaveis - inssMensal - irMensal - pensao - faltas - dsrFalta - afastamento + premio - descontos;

document.getElementById("resultadoMensal").innerHTML = `
  <strong>Mensal</strong><br>
  Proventos tributáveis: R$ ${proventosTributaveis.toFixed(2)}<br>
  Descontos: R$ ${descontos.toFixed(2)}<br>
  Base INSS: R$ ${baseINSS.toFixed(2)}<br>
  INSS: R$ ${inssMensal.toFixed(2)}<br>
  Prêmio (só IRRF): R$ ${premio.toFixed(2)}<br>
  Base IRRF (${modoDescricaoMensal}): R$ ${baseIRMensal.toFixed(2)}<br>
  ${
    tipoDeducao === "legais"
      ? `Dependentes (${dependentes}): R$ ${abatimentoDependentes.toFixed(2)}<br>
         <span style="color:red;">Pensão alimentícia: R$ ${pensao.toFixed(2)}</span><br>`
      : `Desconto simplificado aplicado: R$ ${DEDUCAO_SIMPLIFICADA.toFixed(2)}<br>`
  }
  ${
    anoSelecionado === "2026"
      ? `IRRF (antes do redutor): R$ ${irMensalAntesRedutor.toFixed(2)}<br>
         Redução aplicada: R$ ${redutorMensal.toFixed(2)}<br>`
      : ``
  }
  <span style="color: blue;">
    IRRF final: R$ ${irMensal.toFixed(2)}<br>
    Salário líquido: R$ ${liquidoMensal.toFixed(2)}
  </span>
`;

// Resultado Férias
let resultadoFeriasHTML = "";
if (ferias > 0) {
  const dependentesFerias = parseInt(document.getElementById("dependentesFerias").value) || 0;
  const abatimentoDependentesFerias = dependentesFerias * DEDUCAO_DEPENDENTE;

  // usa o valor digitado no campo "umTerco"
  const baseFeriasINSS = ferias + umTerco; // INSS incide sobre férias + 1/3 informado
  const inssFerias = calcularINSS(baseFeriasINSS);

  let baseIRFerias;
  let modoFerias = "";

  if (tipoDeducao === "legais") {
    baseIRFerias = baseFeriasINSS - inssFerias - pensaoFerias - abatimentoDependentesFerias;
    modoFerias = "deduções legais";
  } else {
    baseIRFerias = baseFeriasINSS - DEDUCAO_SIMPLIFICADA;
    modoFerias = "desconto simplificado";
  }

  if (baseIRFerias < 0) baseIRFerias = 0;

  let irFerias = calcularIRRF(baseIRFerias);
  const irFeriasAntesRedutor = irFerias;
  let redutorFerias = 0;

  if (anoSelecionado === "2026") {
    redutorFerias = 978.62 - (baseFeriasINSS * 0.133145);
    if (redutorFerias < 0) redutorFerias = 0;
    irFerias = Math.max(irFerias - redutorFerias, 0);
  }

  const liquidoFerias = baseFeriasINSS - inssFerias - irFerias - pensaoFerias;

  resultadoFeriasHTML = `
    <strong>Férias</strong><br>
    Valor das férias: R$ ${ferias.toFixed(2)}<br>
    1/3 de férias: R$ ${umTerco.toFixed(2)}<br>
    Base INSS férias: R$ ${baseFeriasINSS.toFixed(2)}<br>
    INSS sobre férias: R$ ${inssFerias.toFixed(2)}<br>
    Base IRRF férias (${modoFerias}): R$ ${baseIRFerias.toFixed(2)}<br>
    ${
      tipoDeducao === "legais"
        ? `<span style="color:red;">Pensão sobre férias: R$ ${pensaoFerias.toFixed(2)}</span><br>
           Dependentes nas férias (${dependentesFerias}): R$ ${abatimentoDependentesFerias.toFixed(2)}<br>`
        : `Desconto simplificado aplicado nas férias: R$ ${DEDUCAO_SIMPLIFICADA.toFixed(2)}<br>`
    }
    ${anoSelecionado === "2026"
      ? `IRRF férias (antes do redutor): R$ ${irFeriasAntesRedutor.toFixed(2)}<br>
         Redução aplicada nas férias: R$ ${redutorFerias.toFixed(2)}<br>`
      : ``
    }
    <span style="color: blue;">
      IRRF férias final: R$ ${irFerias.toFixed(2)}<br>
      Férias líquidas: R$ ${liquidoFerias.toFixed(2)}
    </span>
  `;
}
document.getElementById("resultadoFerias").innerHTML = resultadoFeriasHTML;


// Resultado 13º 
let resultado13HTML = "";
if (decimoTerceiro > 0) {
  const dependentes13 = parseInt(document.getElementById("dependentes13").value) || 0;
  const abatimentoDependentes13 = dependentes13 * DEDUCAO_DEPENDENTE;

  // INSS incide sobre o valor integral do 13º
  const inss13 = calcularINSS(decimoTerceiro);

  // Base IRRF: respeita o tipo de dedução selecionado
  let baseIR13;
  let modo13 = "";

  if (tipoDeducao === "legais") {
    baseIR13 = decimoTerceiro - inss13 - abatimentoDependentes13 - pensao13;
    modo13 = "deduções legais";
  } else {
    baseIR13 = decimoTerceiro - DEDUCAO_SIMPLIFICADA;
    modo13 = "desconto simplificado";
  }

  if (baseIR13 < 0) baseIR13 = 0;

  let ir13 = calcularIRRF(baseIR13);
  const ir13AntesRedutor = ir13;
  let redutor13 = 0;

  // Redução 2026: zera se negativa
  if (anoSelecionado === "2026") {
    redutor13 = 978.62 - (decimoTerceiro * 0.133145);
    if (redutor13 < 0) redutor13 = 0;
    ir13 = Math.max(ir13 - redutor13, 0);
  }

  const liquido13 = decimoTerceiro - inss13 - ir13 - pensao13;

  resultado13HTML = `
    <strong>13º Salário</strong><br>
    Base INSS 13º: R$ ${decimoTerceiro.toFixed(2)}<br>
    INSS 13º: R$ ${inss13.toFixed(2)}<br>
    Base IRRF 13º (${modo13}): R$ ${baseIR13.toFixed(2)}<br>
    ${
      tipoDeducao === "legais"
        ? `Dependentes no 13º (${dependentes13}): R$ ${abatimentoDependentes13.toFixed(2)}<br>
           <span style="color:red;">Pensão sobre 13º: R$ ${pensao13.toFixed(2)}</span><br>`
        : `Desconto simplificado aplicado no 13º: R$ ${DEDUCAO_SIMPLIFICADA.toFixed(2)}<br>`
    }
    ${
      anoSelecionado === "2026"
        ? `IRRF 13º (antes do redutor): R$ ${ir13AntesRedutor.toFixed(2)}<br>
           Redução aplicada (2026): R$ ${redutor13.toFixed(2)}<br>`
        : ``
    }
    <span style="color: blue;">
      IRRF 13º: R$ ${ir13.toFixed(2)}<br>
      13º líquido: R$ ${liquido13.toFixed(2)}
    </span>
  `;
}
document.getElementById("resultado13").innerHTML = resultado13HTML;



// Resultado PLR (separado, tabela própria)
let resultadoPLRHTML = "";
if (plr > 0) {
  let irPLR = 0;
  if (plr <= 8214.40) irPLR = 0;
  else if (plr <= 9922.28) irPLR = plr * 0.075 - 616.08;
  else if (plr <= 13167.00) irPLR = plr * 0.15 - 1360.25;
  else if (plr <= 16380.38) irPLR = plr * 0.225 - 2347.78;
  else irPLR = plr * 0.275 - 3166.80;

  if (irPLR < 0) irPLR = 0; // segurança para não negativo
  const liquidoPLR = plr - irPLR;

  resultadoPLRHTML = `
    <strong>PLR</strong><br>
    Valor bruto: R$ ${plr.toFixed(2)}<br>
    Faixa exclusiva PLR aplicada<br>
    <span style="color: blue;">
      IRRF PLR: R$ ${irPLR.toFixed(2)}<br>
      PLR líquido: R$ ${liquidoPLR.toFixed(2)}
    </span>
  `;
}
document.getElementById("resultadoPLR").innerHTML = resultadoPLRHTML;
}
