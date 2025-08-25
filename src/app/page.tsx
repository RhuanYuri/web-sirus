// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// Ícones SVG como componentes para facilitar o uso
const RocketIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.87 12.87 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const BarChartIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

export default function SirusLandingPage() {
  const [page, setPage] = useState('/');

  // Este useEffect simula a navegação baseada na URL
  useEffect(() => {
    const handlePathChange = () => {
      setPage(window.location.pathname);
    };

    // Define a página inicial
    handlePathChange();

    // Adiciona um listener para o evento popstate (navegação do navegador)
    window.addEventListener('popstate', handlePathChange);

    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);
  
  // Função para mudar a página e atualizar o histórico do navegador
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setPage(path);
  };


  // --- Componente da Página de Login ---
  const LoginPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
        <div className="text-center mb-8">
          <RocketIcon className="mx-auto h-12 w-12 text-purple-400" />
          <h1 className="text-3xl font-bold mt-4">Bem-vindo de volta!</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta para continuar.</p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="seuemail@exemplo.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => e.preventDefault()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-transform transform hover:scale-105"
          >
            Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Não tem uma conta?{' '}
          <a
            href="/cadastro"
            onClick={(e) => {
              e.preventDefault();
              navigate('/cadastro');
            }}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Cadastre-se
          </a>
        </p>
      </div>
       <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="mt-8 text-purple-400 hover:text-purple-300 text-sm">
        &larr; Voltar para a página inicial
      </a>
    </div>
  );

  // --- Componente da Página de Cadastro ---
  const SignupPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
        <div className="text-center mb-8">
          <RocketIcon className="mx-auto h-12 w-12 text-purple-400" />
          <h1 className="text-3xl font-bold mt-4">Crie sua Conta na Sirus</h1>
          <p className="text-gray-400 mt-2">Comece a gerenciar seus testes hoje.</p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Seu Nome"
            />
          </div>
          <div>
            <label
              htmlFor="email-signup"
              className="block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email-signup"
              name="email"
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="seuemail@exemplo.com"
            />
          </div>
          <div>
            <label
              htmlFor="password-signup"
              className="block text-sm font-medium text-gray-300"
            >
              Senha
            </label>
            <input
              type="password"
              id="password-signup"
              name="password"
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="Crie uma senha forte"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => e.preventDefault()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-transform transform hover:scale-105"
          >
            Criar Conta
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Já possui uma conta?{' '}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="font-medium text-purple-400 hover:text-purple-300"
          >
            Faça login
          </a>
        </p>
      </div>
       <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="mt-8 text-purple-400 hover:text-purple-300 text-sm">
        &larr; Voltar para a página inicial
      </a>
    </div>
  );

  // --- Componente da Landing Page Principal ---
  const MainPage = () => (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <RocketIcon className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold">Sirus</span>
          </div>
          <nav className="space-x-4">
            <a
              href="/login"
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-500/10 transition"
            >
              Login
            </a>
            <a
              href="/cadastro"
              className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-700 transition"
            >
              Cadastre-se
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-gray-950 -z-10"></div>
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#800080] to-[#4B0082] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="container mx-auto px-6 pt-32 pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Gerenciamento de Testes para Foguetes de Alta Performance
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
            A plataforma definitiva para equipes universitárias de foguetes.
            Centralize dados, analise resultados e acelere a inovação com a
            Sirus.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/cadastro"
              className="rounded-md bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-transform transform hover:scale-105"
            >
              Comece Agora
            </a>
            <a
              href="#features"
              className="text-sm font-semibold leading-6"
            >
              Saiba mais <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-gray-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Tudo que sua equipe precisa para decolar
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Ferramentas poderosas para um fluxo de trabalho eficiente e
              seguro.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 border border-purple-500/20 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-500/10 p-4 rounded-full">
                <BarChartIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">Análise de Dados</h3>
              <p className="mt-2 text-gray-400">
                Visualize telemetria e resultados de testes em tempo real com
                dashboards intuitivos e personalizáveis.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-purple-500/20 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-500/10 p-4 rounded-full">
                <ShieldCheckIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                Segurança e Colaboração
              </h3>
              <p className="mt-2 text-gray-400">
                Mantenha seus dados seguros e gerencie permissões de acesso
                para cada membro da equipe de forma granular.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-purple-500/20 rounded-xl bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-purple-500/10 p-4 rounded-full">
                <RocketIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                Histórico de Lançamentos
              </h3>
              <p className="mt-2 text-gray-400">
                Acesse um registro completo de todos os testes e lançamentos,
                facilitando a iteração e o aprimoramento dos projetos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-purple-500/10">
        <div className="container mx-auto py-6 px-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Sirus. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );

  return <MainPage />;
}
