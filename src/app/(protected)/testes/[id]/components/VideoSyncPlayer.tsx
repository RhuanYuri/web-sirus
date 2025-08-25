// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { TestResultChart } from "@/components/chart-area-interactive";
// import { Button } from "@/components/ui/button";
// import { downloadTestData } from "@/utils/download"; // Importe a função de download

// // Supondo que o tipo 'test' seja importável ou definido
// type TestWithResults = {
//   id: string;
//   name: string;
//   videoUrl: string | null;
//   // ...outros campos do teste
//   results: { second: number; force: number }[];
// };

// interface VideoSyncPlayerProps {
//   testData: TestWithResults;
// }

// export function VideoSyncPlayer({ testData }: VideoSyncPlayerProps) {
//   const [currentTime, setCurrentTime] = useState(0);

//   // --- FUNÇÃO ADICIONADA ---
//   // Função chamada continuamente enquanto o vídeo é reproduzido
//   const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
//     setCurrentTime(event.currentTarget.currentTime);
//   };
//   // -------------------------

//   const handleDownload = () => {
//     downloadTestData(testData);
//   }

//   return (
//     <div className="space-y-6">
//       {/* Player de Vídeo */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>Vídeo do Teste 🎬</CardTitle>
//           <Button variant="outline" onClick={handleDownload}>
//             Baixar Dados do Teste (.csv)
//           </Button>
//         </CardHeader>
//         <CardContent>
//           <video
//             controls
//             width="100%"
//             src={testData.videoUrl!}
//             onTimeUpdate={handleTimeUpdate}
//             className="rounded-md"
//           >
//             Seu navegador não suporta o elemento de vídeo.
//           </video>
//         </CardContent>
//       </Card>

//       {/* Gráfico Interativo */}
//       <TestResultChart testData={testData}  />
//     </div>
//   );
  
// }