function calcular() {
  // --- Validações iniciais ---
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

  // --- Entradas ---
  const salario = parseFloat(document.getElementById("salario").value) || 0;
  const horaExtra = parseFloat(document.getElementById("horaExtra").value) || 0;
  const dsrHoraExtra = parseFloat(document.getElementById("dsrHoraExtra").value) || 0;
  const comissao = parseFloat(document.getElementById("comissao").value) || 0;
  const tarefa = parseFloat(document.getElementById("tarefa").value) || 0;
  const dsrTarefa = parseFloat(document.getElementById("dsrTarefa").value) || 0;

  const faltas = parseFloat(document.getElementById("faltas").value) || 0;
  const afastamento = parseFloat(document.getElementById("afastamento").value) || 0;
  const dsrFalta = parseFloat(document.getElementById("dsrFalta").value) || 0;

  const premio = parseFloat(document.getElementById("premio").value) || 0;
  const dependentes = parseInt(document.getElementById("dependentes").value) || 0;
  const pensao = parseFloat(document.getElementById("pensao").value) || 0;

  // --- Base de proventos e descontos (INSS não inclui prêmio) ---
  const proventosTributaveis = salario + horaExtra + dsrHoraExtra + comissao + tarefa + dsrTarefa;
  const descontos = faltas + afastamento + dsrFalta;

  let baseINSS = proventosTributaveis - descontos;
  if (baseINSS < 0) baseINSS = 0;

  // --- Cálculo INSS progressivo ---
  const faixasINSS = [
    { limite: 1518.00, aliquota: 0.075 },
    { limite: 2793.88, aliquota: 0.09 },
    { limite: 4000.03, aliquota: 0.12 },
    { limite: 7786.02, aliquota: 0.14 }
  ];

  let inss = 0;
  let restante = baseINSS;
  let anterior = 0;

  for (const faixa of faixasINSS) {
    if (restante <= 0) break;
    const tetoFaixa = faixa.limite - anterior;
    const faixaValor = Math.min(restante, Math.max(tetoFaixa, 0));
    if (faixaValor > 0) {
      inss += faixaValor * faixa.aliquota;
      restante -= faixaValor;
      anterior = faixa.limite;
    }
  }

  // --- Base IR e deduções ---
  const DEDUCAO_SIMPLIFICADA = 607.20;
  const DEDUCAO_DEPENDENTE = 189.59;

  let baseIR = 0;
  let abatimentoDependentes = 0;
  let modoDescricao = "";

  if (tipoDeducao === "legais") {
    abatimentoDependentes = dependentes * DEDUCAO_DEPENDENTE;
    const baseBrutaIR = baseINSS + premio;
    baseIR = baseBrutaIR - inss - abatimentoDependentes - pensao;
    modoDescricao = "deduções legais";
  } else if (tipoDeducao === "simplificado") {
    const baseBrutaIR = baseINSS + premio;
    baseIR = baseBrutaIR - DEDUCAO_SIMPLIFICADA;
    modoDescricao = "desconto simplificado";
  }

  if (baseIR < 0) baseIR = 0;

  // --- IRRF por faixas ---
  let ir = 0;
  if (baseIR <= 2428.80) ir = 0;
  else if (baseIR <= 2826.65) ir = baseIR * 0.075 - 182.16;
  else if (baseIR <= 3751.05) ir = baseIR * 0.15 - 394.16;
  else if (baseIR <= 4664.68) ir = baseIR * 0.225 - 675.49;
  else ir = baseIR * 0.275 - 908.73;

  // --- Redutor (somente 2026) ---
  let redutor = 0;
  const irAntesRedutor = ir;

  if (anoSelecionado === "2026") {
    redutor = 978.62 - (baseIR * 0.133145);
    ir = ir - redutor;
    if (ir < 0) ir = 0;
  }

  // --- Resultado ---
  let resultadoHTML = `
    Proventos tributáveis: R$ ${proventosTributaveis.toFixed(2)}<br>
    Descontos: R$ ${descontos.toFixed(2)}<br>
    Base INSS: R$ ${baseINSS.toFixed(2)}<br>
    INSS: R$ ${inss.toFixed(2)}<br>
    Prêmio (só IRRF): R$ ${premio.toFixed(2)}<br>
    Base IRRF líquida (${modoDescricao}): R$ ${baseIR.toFixed(2)}<br>
  `;

  if (tipoDeducao === "legais") {
    resultadoHTML += `
      Dependentes (${dependentes}): R$ ${abatimentoDependentes.toFixed(2)}<br>
      Pensão alimentícia: R$ ${pensao.toFixed(2)}<br>
    `;
  } else {
    resultadoHTML += `Desconto simplificado aplicado: R$ ${DEDUCAO_SIMPLIFICADA.toFixed(2)}<br>`;
  }

  if (anoSelecionado === "2026") {
    resultadoHTML += `
      IRRF (antes do redutor): R$ ${irAntesRedutor.toFixed(2)}<br>
      Redução aplicada: R$ ${redutor.toFixed(2)}<br>
    `;
  }

  resultadoHTML += `
    IRRF final: R$ ${ir.toFixed(2)}<br>
    Salário líquido: R$ ${(proventosTributaveis + premio - descontos - inss - ir).toFixed(2)}
  `;

  document.getElementById("resultado").innerHTML = resultadoHTML;
}