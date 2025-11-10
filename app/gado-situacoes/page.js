'use client';
import { useState, useEffect } from 'react';
import DropdownMenu, { DropdownItem } from '../dropdown-menu'; // Ajuste o caminho se necessário

// Lista de condições possíveis
const CONDICOES = ['Descarte', 'Morto', 'Abatido', 'Vendido', 'Desaparecido'];

// Modal para Registrar/Editar Condição
const ModalCondicao = ({ isOpen, onClose, form, setForm, editando, loading, handleSubmit, gados }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {editando ? 'Editar Condição do Gado' : 'Registrar Condição do Gado'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selecionar Gado */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Selecione um gado *</label>
              <select
                required
                value={form.gado_id}
                onChange={(e) => setForm({ ...form, gado_id: e.target.value })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Escolha um gado</option>
                {gados.map(gado => (
                  <option key={gado.id} value={gado.id}>{gado.identificacao}</option>
                ))}
              </select>
            </div>

            {/* Selecionar Condição */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Selecione a condição *</label>
              <select
                required
                value={form.condicao}
                onChange={(e) => setForm({ ...form, condicao: e.target.value })}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Escolha uma condição</option>
                {CONDICOES.map(condicao => (
                  <option key={condicao} value={condicao}>{condicao}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 hover:bg-[#2d5016] bg-[#4a7c2c] text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? 'Processando...' : (editando ? 'Atualizar' : 'Registrar')}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Principal da Página
export default function GadoCondicaoPage() {
  const [situacoes, setSituacoes] = useState([]);
  const [gados, setGados] = useState([]);
  const [form, setForm] = useState({ gado_id: '', condicao: '' });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroCondicao, setFiltroCondicao] = useState('todas');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resSituacoes, resGados] = await Promise.all([
        fetch('/api/gado-situacao'),
        fetch('/api/gado')
      ]);

      const dataSituacoes = await resSituacoes.json();
      const dataGados = await resGados.json();

      if (Array.isArray(dataSituacoes)) {
        setSituacoes(dataSituacoes);
      } else {
        setSituacoes([]);
        console.error("A API de situações não retornou um array:", dataSituacoes);
      }
      
      if (Array.isArray(dataGados)) {
        setGados(dataGados);
      } else {
        setGados([]);
        console.error("A API de gado não retornou um array:", dataGados);
      }

    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editando ? `/api/gado-situacao/${editando}` : '/api/gado-situacao';
      const method = editando ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        alert(editando ? 'Condição atualizada!' : 'Condição registrada!');
        fecharModal();
        carregarDados();
      } else {
        alert('Erro: ' + (data.error || 'Ocorreu um erro.'));
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  const handleEditar = (situacao) => {
    setForm({
      gado_id: situacao.gado_id,
      condicao: situacao.condicao,
    });
    setEditando(situacao.id);
    setModalAberto(true);
  };

  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;
    try {
      const res = await fetch(`/api/gado-situacao/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Registro deletado!');
        carregarDados();
      } else {
        const error = await res.json();
        alert('Erro ao deletar: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  const limparForm = () => {
    setForm({ gado_id: '', condicao: '' });
    setEditando(null);
  };

  const abrirModalNovo = () => {
    limparForm();
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    limparForm();
  };

  const situacoesFiltradas = situacoes.filter(sit => {
    const matchBusca = sit.gado_identificacao?.toLowerCase().includes(busca.toLowerCase());
    const matchCondicao = filtroCondicao === 'todas' || sit.condicao === filtroCondicao;
    return matchBusca && matchCondicao;
  });

  const getCondicaoBadge = (condicao) => {
    const badges = {
      'Vendido': 'bg-blue-100 text-blue-800',
      'Abatido': 'bg-purple-100 text-purple-800',
      'Morto': 'bg-red-100 text-red-800',
      'Descarte': 'bg-yellow-100 text-yellow-800',
      'Desaparecido': 'bg-gray-100 text-gray-800'
    };
    return badges[condicao] || 'bg-gray-200 text-gray-900';
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#F7ECE1]">
      <header className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] w-full mb-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-4xl font-bold text-white">Sistema de Controle do Gado</h1>
          <button onClick={() => window.location.replace('/')} className="cursor-pointer text-white p-2 rounded-lg transition border border-white duration-200 ease-in-out  hover:ring-offset-1 hover:bg-white hover:text-black pl-4 pr-4">
            Sair
            </button>
        </div>
        <hr className="border-[#2d5016] flex"></hr>
        <nav className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] p-2 pl-1 pt-0">
          <div className="mx-auto flex space-x-1">
            <DropdownMenu title="Gado">
              <DropdownItem href="/gados">Cadastrar Gado</DropdownItem>
              <DropdownItem href="/gado-situacoes">Condição do Gado</DropdownItem>
            </DropdownMenu>
            <DropdownMenu title="Vacinas">
              <DropdownItem href="/vacinas">Vacinas</DropdownItem>
              <DropdownItem href="/gado-vacinados">Gados Vacinados</DropdownItem>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="flex-grow max-w-4xl mx-auto px-4 w-full">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Buscar por identificação do gado..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-700 outline-none"
            />
            <select
              value={filtroCondicao}
              onChange={(e) => setFiltroCondicao(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-700 outline-none"
            >
              <option value="todas">Todas as Condições</option>
              {CONDICOES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={abrirModalNovo} className="w-full md:w-auto bg-[#4a7c2c] hover:bg-[#2d5016] text-white font-bold py-2 px-6 rounded-lg whitespace-nowrap">
              + Registrar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-t from-[#2d5016] to-[#4a7c2c] text-white">
                <tr>
                  {/* Coluna Ações: 25% da largura */}
                  <th className="px-4 py-3 text-left w-1/4">AÇÕES</th>
                  
                  {/* Coluna Gado: 50% da largura e texto centralizado */}
                  <th className="px-4 py-3 text-center w-1/2">GADO</th> 
                  
                  {/* Coluna Condição: 25% da largura e texto centralizado */}
                  <th className="px-4 py-3 text-center w-1/4">CONDIÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {situacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  situacoesFiltradas.map((sit, index) => (
                    <tr key={sit.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3">
                        <div className="flex gap-4">
                          <button onClick={() => handleEditar(sit)} title="Editar"><img src="/lapis.png" alt="Editar" className="w-4 h-4 cursor-pointer" /></button>
                          <button onClick={() => handleDeletar(sit.id)} title="Deletar"><img src="/lixo.png" alt="Deletar" className="w-4 h-4 cursor-pointer" /></button>
                        </div>
                      </td>
                      {/* Célula Gado: texto centralizado */}
                      <td className="px-4 py-3 font-medium text-gray-800 text-center">{sit.gado_identificacao}</td>
                      
                      {/* Célula Condição: conteúdo centralizado */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getCondicaoBadge(sit.condicao)}`}>
                            {sit.condicao}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ModalCondicao
        isOpen={modalAberto}
        onClose={fecharModal}
        form={form}
        setForm={setForm}
        editando={editando}
        loading={loading}
        handleSubmit={handleSubmit}
        gados={gados}
      />

<footer className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] w-full">
		        <hr className="border-white/30" />
		        <div className="max-w-6xl mx-auto px-6 py-8">
		          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2 justify-items-center">
		            
		            
		            <div className="text-center md:text-left">
		              <h3 className="text-white font-semibold text-lg mb-4 border-b-2 border-white/30 pb-2 inline-block">Carlos Charles</h3>
		              <div className="flex flex-col gap-2">
		                <div className="flex items-center gap-2">
		                  <p className="text-white" title="Enviar email">
		                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
		                    </svg>
		                  </p>
		                  <span className="text-white text-sm">carloscharles1616@gmail.com</span>
		                </div>
		                <div className="flex items-center gap-2">
		                  <p className="text-white" title="Ligar">
		                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
		                    </svg>
		                  </p>
		                  <span className="text-white text-sm">(69) 99270-0080</span>
		                </div>
		              </div>
		            </div>
		            
		            
		            <div className="text-center md:text-left">
		              <h3 className="text-white font-semibold text-lg mb-4 border-b-2 border-white/30 pb-2 inline-block">Vinicius Alexander</h3>
		              <div className="flex flex-col gap-2">
		                <div className="flex items-center gap-2">
		                  <p className="text-white" title="Enviar email">
		                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
		                    </svg>
		                  </p>
		                  <span className="text-white text-sm">valexandersoares@gmail.com</span>
		                </div>
		                <div className="flex items-center gap-2">
		                  <p className="text-white" title="Ligar">
		                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
		                    </svg>
		                  </p>
		                  <span className="text-white text-sm">(69) 99207-7361</span>
		                </div>
		              </div>
		            </div>
		          </div>
		        </div>
		        
		        {/* Copyright */}
		        <div className="pt-4 mb-4 border-t border-[#2d5016] w-full">
		          <p className="text-white/70 text-sm text-center">
		            Copyright © 2025 Sistema de Controle do Gado. Todos os direitos reservados.
		          </p>
		        </div>
		      </footer>	
    </div>
  );
}
