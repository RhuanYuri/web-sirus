// src/utils/download.ts
export function downloadTestData(testData: any) {
  if (!testData.results || testData.results.length === 0) {
    alert("Nenhum dado de teste para baixar.");
    return;
  }

  // Cria o cabeçalho do arquivo CSV
  const header = "tempo (s),forca (N)\n";
  
  // Converte os resultados para linhas de CSV
  const csvContent = testData.results.map((item: any) => `${item.second},${item.force}`).join("\n");

  const fullContent = header + csvContent;

  // Cria um objeto Blob e um link para download
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${testData.name}_resultados.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}