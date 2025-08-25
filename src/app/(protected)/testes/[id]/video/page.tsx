// app/page.tsx

'use client';

import { useState, ChangeEvent, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useParams } from 'next/navigation';
import { getTest } from '@/actions/test/get-test';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Tipos para os dados que vêm da Server Action
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

  const params = useParams();
  const id = params.id as string | undefined; 
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) { 
        const { test } = await getTest({ id: id });
        
        // Verifica se o teste e os resultados existem
        if (test && test.results) {
          // Converte os dados para o formato numérico que o gráfico precisa
          const formattedResults = test.results.map((result: TestResult) => ({
            second: parseFloat(String(result.second)),
            force: parseFloat(String(result.force)),
          }));
          setChartData(formattedResults);
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
      alert('Por favor, selecione um arquivo de vídeo válido.');
    }
  };

  /**
   * Desenha o gráfico diretamente no canvas, sincronizado com o tempo.
   */
  const drawDynamicChart = (
    ctx: CanvasRenderingContext2D,
    data: ChartPoint[],
    videoTime: number,
    chartArea: { x: number; y: number; width: number; height: number }
  ) => {
    if (data.length === 0) return;

    const filteredData = data.filter((point) => point.second <= videoTime);
    if (filteredData.length < 2) return;

    const { x, y, width, height } = chartArea;
    
    const maxForce = Math.max(...data.map((p) => p.force));
    const maxTime = Math.max(...data.map((p) => p.second));
    const minForce = Math.min(...data.map((p) => p.force));

    // Fundo do gráfico (branco semitransparente)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#e0e0e0';
    ctx.strokeRect(x,y,width,height);

    const forceScale = (v: number) => y + height * (1 - (v - minForce) / (maxForce - minForce));
    const timeScale = (t: number) => x + width * (t / maxTime);

    ctx.beginPath();
    ctx.strokeStyle = '#2563eb'; // Cor da linha (azul)
    ctx.lineWidth = 2;
    ctx.moveTo(timeScale(filteredData[0].second), forceScale(filteredData[0].force));
    for (let i = 1; i < filteredData.length; i++) {
      const point = filteredData[i];
      ctx.lineTo(timeScale(point.second), forceScale(point.force));
    }
    ctx.stroke();

    // Labels do gráfico
    ctx.fillStyle = '#333333';
    ctx.font = '10px sans-serif';
    ctx.fillText('Força (N)', x + 5, y + 12);
    ctx.fillText('Tempo (s)', x + width - 40, y + height - 5);
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const stream = canvas.captureStream(25);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'video-com-grafico-dinamico.webm';
      a.click();
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
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const chartWidth = canvas.width * 0.4;
      const chartHeight = canvas.height * 0.35;
      const margin = canvas.width * 0.02;
      const chartArea = { 
        x: margin, 
        y: canvas.height - chartHeight - margin, 
        width: chartWidth, 
        height: chartHeight 
      };

      drawDynamicChart(ctx, chartData, video.currentTime, chartArea);
      
      setProgress((video.currentTime / video.duration) * 100);
      
      requestAnimationFrame(processFrame);
    };

    video.play();
    processFrame();
  };

  const chartConfig = {
    force: {
      label: 'Força (N)',
      color: 'hsl(var(--primary))',
    },
    second: {
      label: 'Segundos (s)',
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem', backgroundColor: '#ffffff', color: '#1a1a1a', minHeight: '100vh' }}>
      <header className="items-left mb-5">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={`/testes/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar teste</Link>
        </Button>
      </header>
      
      <h1>Visualizador de Vídeo com Gráfico Dinâmico</h1>
      <p>O gráfico será renderizado em tempo real e incluído no vídeo baixado.</p>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        style={{ display: 'block', margin: '2rem auto', padding: '10px 15px', border: '1px solid #cccccc', borderRadius: '5px', backgroundColor: '#f0f0f0', color: '#1a1a1a' }}
      />

      {isProcessing && (
        <div>
          <p>Processando vídeo... {progress.toFixed(1)}%</p>
          <progress value={progress} max="100" style={{ width: '50%' }}></progress>
        </div>
      )}

      {videoSrc && (
        <div style={{ maxWidth: '800px', margin: '0 auto', border: '2px solid #dddddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', padding: '1rem' }}>
          <div style={{position: 'relative'}}>
            {/* Vídeo para pré-visualização */}
            <video src={videoSrc} controls width="100%" style={{ borderRadius: '6px' }} />
            
            {/* Vídeo fonte para gravação (oculto) */}
            <video ref={videoRef} src={videoSrc} muted style={{ display: 'none' }} />

            {/* Container do gráfico para exibição */}
            <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                width: '40%',
                height: '35%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                padding: '10px',
                borderRadius: '8px',
                boxSizing: 'border-box',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <ChartContainer config={chartConfig} style={{ height: '100%', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid vertical={false} strokeOpacity={0.4} />
                    <XAxis
                      dataKey="second"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toFixed(1)}s`}
                      style={{ fontSize: 10, fill: '#333' }}
                    />
                    <YAxis 
                      dataKey="force"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      style={{ fontSize: 10, fill: '#333' }}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey="force"
                      type="monotone"
                      stroke="var(--color-force)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <button
            onClick={handleDownloadWithChart}
            disabled={isProcessing}
            style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer', marginTop: '1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: '500' }}
          >
            {isProcessing ? 'Processando...' : 'Baixar Vídeo com Gráfico'}
          </button>
        </div>
      )}
    </main>
  );
}
