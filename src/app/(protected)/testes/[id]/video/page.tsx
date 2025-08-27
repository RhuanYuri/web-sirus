// app/page.tsx

'use client';

import { useState, ChangeEvent, useRef, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useParams } from 'next/navigation';
import { getTest } from '@/actions/test/get-test';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Tipos para os dados
interface TestResult {
  second: string | number;
  force: string | number;
}

interface ChartPoint {
  second: number;
  force: number;
}

export default function VideoProcessorPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [peakForce, setPeakForce] = useState(0);
  const [totalImpulse, setTotalImpulse] = useState(0);

  const params = useParams();
  const id = params.id as string | undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efeito para buscar os dados do teste e calcular as métricas
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const { test } = await getTest({ id: id });
        if (test && test.results) {
          const formattedResults: ChartPoint[] = test.results.map((result: TestResult) => ({
            second: parseFloat(String(result.second)),
            force: parseFloat(String(result.force)),
          }));
          setChartData(formattedResults);

          // Calcular Pico de Força e Impulso Total
          if (formattedResults.length > 0) {
            const maxForce = Math.max(...formattedResults.map(p => p.force));
            setPeakForce(maxForce);

            let impulse = 0;
            for (let i = 1; i < formattedResults.length; i++) {
              const p1 = formattedResults[i - 1];
              const p2 = formattedResults[i];
              const avgForce = (p1.force + p2.force) / 2;
              const timeDiff = p2.second - p1.second;
              impulse += avgForce * timeDiff;
            }
            setTotalImpulse(impulse);
          }
        }
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setProgress(0);
    } else {
      setVideoSrc(null);
      console.error('Por favor, selecione um arquivo de vídeo válido.');
    }
  };

  /**
   * Desenha os dados de sobreposição (métricas) no canvas.
   */
  const drawDataOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const margin = canvas.width * 0.02;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(margin, margin, canvas.width - (margin * 2), 50);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      const textY = margin + 25;
      const textLeftMargin = margin * 2;
      
      ctx.fillText(`Impulso Total: ${totalImpulse.toFixed(2)} N·s`, textLeftMargin, textY);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Pico de Força: ${peakForce.toFixed(2)} N`, canvas.width - textLeftMargin, textY);
  };


  /**
   * Desenha o gráfico de área dinâmico no canvas.
   */
  const drawDynamicChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartPoint[],
    videoTime: number,
    chartArea: { x: number; y: number; width: number; height: number },
    peakForceValue: number
  ) => {
    if (data.length === 0) return;

    const { x, y, width, height } = chartArea;

    const maxForce = Math.max(...data.map((p) => p.force), 0);
    const maxTime = Math.max(...data.map((p) => p.second), 0);
    
    // Funções de escala
    const forceScale = (v: number) => y + height - (v / maxForce) * height;
    const timeScale = (t: number) => x + (t / maxTime) * width;

    // Fundo do gráfico
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + width - 8, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + 8);
    ctx.lineTo(x + width, y + height - 8);
    ctx.quadraticCurveTo(x + width, y + height, x + width - 8, y + height);
    ctx.lineTo(x + 8, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - 8);
    ctx.lineTo(x, y + 8);
    ctx.quadraticCurveTo(x, y, x + 8, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // **NOVO: Desenha a linha de pico de força**
    const peakForceY = forceScale(peakForceValue);
    ctx.strokeStyle = '#ef4444'; // Vermelho para a linha de pico
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Linha tracejada
    ctx.beginPath();
    ctx.moveTo(x, peakForceY);
    ctx.lineTo(x + width, peakForceY);
    ctx.stroke();
    ctx.setLineDash([]); // Reseta o tracejado para as próximas linhas

    // Rótulo da linha de pico
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Pico: ${peakForceValue.toFixed(2)} N`, x + width - 5, peakForceY - 5);

    // Filtra os dados até o tempo atual do vídeo
    const filteredData = data.filter((point) => point.second <= videoTime);
    if (filteredData.length < 2) return;

    // Gradiente da área
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.6)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.05)');
    
    // Desenha a área preenchida
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(timeScale(filteredData[0].second), y + height);
    ctx.lineTo(timeScale(filteredData[0].second), forceScale(filteredData[0].force));
    for (const point of filteredData) {
      ctx.lineTo(timeScale(point.second), forceScale(point.force));
    }
    ctx.lineTo(timeScale(filteredData[filteredData.length - 1].second), y + height);
    ctx.closePath();
    ctx.fill();

    // Desenha a linha principal
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(timeScale(filteredData[0].second), forceScale(filteredData[0].force));
    for (const point of filteredData) {
      ctx.lineTo(timeScale(point.second), forceScale(point.force));
    }
    ctx.stroke();

    // **NOVO: Desenha o indicador do valor atual**
    const lastPoint = filteredData[filteredData.length - 1];
    const currentX = timeScale(lastPoint.second);
    const currentY = forceScale(lastPoint.force);

    // Círculo na ponta da linha
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    // Texto com o valor da força
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${lastPoint.force.toFixed(2)} N`, currentX + 8, currentY - 8);

    // Rótulos dos eixos
    ctx.fillStyle = '#334155';
    ctx.font = '12px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Força (N)', x + 10, y + 15);
    ctx.textAlign = 'right';
    ctx.fillText('Tempo (s)', x + width - 10, y + height - 10);
  };

  const handleDownloadWithChart = async () => {
    if (!videoRef.current || !videoSrc || !chartData.length) return;

    setIsProcessing(true);
    setProgress(0);

    const video = videoRef.current;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.currentTime = 0;
        resolve();
      };
      if (video.readyState >= 1) resolve();
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const stream = canvas.captureStream(30);
    
    const options = { mimeType: 'video/mp4; codecs=avc1' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} não é suportado. Voltando para WebM.`);
      options.mimeType = 'video/webm; codecs=vp9';
    }

    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const fileExtension = options.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: `video/${fileExtension}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-com-grafico-e-dados.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    };

    recorder.start();

    const processFrame = () => {
      if (video.paused || video.ended) {
        recorder.stop();
        setProgress(100);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const chartWidth = canvas.width * 0.4;
      const chartHeight = canvas.height * 0.35;
      const margin = canvas.width * 0.02;
      const chartArea = {
        x: margin,
        y: canvas.height - chartHeight - margin,
        width: chartWidth,
        height: chartHeight,
      };

      // Passa o valor de peakForce para a função de desenho
      drawDynamicChart(ctx, chartData, video.currentTime, chartArea, peakForce);
      drawDataOverlay(ctx, canvas);

      setProgress((video.currentTime / video.duration) * 100);
      requestAnimationFrame(processFrame);
    };

    video.play();
    processFrame();
  };

  const chartConfig = {
    force: {
      label: 'Força (N)',
      color: 'hsl(221, 83%, 53%)',
    },
    second: {
      label: 'Segundos (s)',
    },
  };

  return (
    <main className="bg-gray-50 text-gray-800 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={`/testes/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o teste</Link>
          </Button>
        </header>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Processador de Vídeo e Gráfico
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Carregue um vídeo para mesclar com o gráfico de força em tempo real.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-4xl mx-auto">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 text-base"
            variant="outline"
          >
            <Upload className="mr-3 h-5 w-5" />
            {videoSrc ? 'Trocar Vídeo' : 'Selecionar Vídeo'}
          </Button>

          {isProcessing && (
            <div className="mt-6 text-center">
              <p className="font-medium">Processando vídeo... {progress.toFixed(0)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {videoSrc && (
            <div className="mt-6">
              <div className="relative aspect-video w-full max-w-full mx-auto bg-black rounded-lg overflow-hidden shadow-inner">
                <video src={videoSrc} controls className="w-full h-full" />
                
                <video ref={videoRef} src={videoSrc} muted className="hidden" />

                <div className="absolute top-3 left-3 right-3 bg-black bg-opacity-60 text-white p-3 rounded-lg flex justify-between items-center text-sm sm:text-base pointer-events-none">
                  <span className="font-semibold">Impulso Total: <span className="font-mono">{totalImpulse.toFixed(2)} N·s</span></span>
                  <span className="font-semibold">Pico de Força: <span className="font-mono">{peakForce.toFixed(2)} N</span></span>
                </div>

                <div className="absolute bottom-3 left-3 w-[40%] h-[35%] bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/50 pointer-events-none">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer>
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorForce" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-force)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-force)" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="second"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => `${value}s`}
                          style={{ fontSize: 10, fill: '#475569' }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          style={{ fontSize: 10, fill: '#475569' }}
                        />
                        <Tooltip
                          cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        {/* **NOVO: Linha de referência para o pico de força no gráfico de preview** */}
                        <ReferenceLine 
                          y={peakForce} 
                          label={{ value: `Pico (${peakForce.toFixed(2)} N)`, position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} 
                          stroke="#ef4444" 
                          strokeDasharray="4 4" 
                        />
                        <Area
                          dataKey="force"
                          type="monotone"
                          fill="url(#colorForce)"
                          stroke="var(--color-force)"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <Button
                onClick={handleDownloadWithChart}
                disabled={isProcessing}
                className="w-full mt-6 py-6 text-base font-bold"
              >
                {isProcessing
                  ? 'Processando...'
                  : <> <Download className="mr-3 h-5 w-5" /> Baixar Vídeo com Gráfico </>
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
