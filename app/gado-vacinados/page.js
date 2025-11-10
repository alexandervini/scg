'use client';
import { useState, useEffect } from 'react';
import DropdownMenu, { DropdownItem } from '../dropdown-menu';

// Modal para Registrar Vacinação
const ModalVacinacao = ({ isOpen, onClose, form, setForm, editando, loading, handleSubmit, gados, vacinas }) => {
  if (!isOpen) return null;

  // Calcular data de validade automaticamente
  const calcularDataValidade = (dataAplicacao, periodicidadeDias) => {
    if (!dataAplicacao || !periodicidadeDias) return '';
    const data = new Date(dataAplicacao);
    data.setDate(data.getDate() + parseInt(periodicidadeDias));
    return data.toISOString().split('T')[0];
  };

  const vacinaSelecionada = vacinas.find(v => v.id === parseInt(form.vacina_id));

  useEffect(() => {
    if (form.data_aplicacao && vacinaSelecionada?.periodicidade_dias) {
      const novaDataValidade = calcularDataValidade(form.data_aplicacao, vacinaSelecionada.periodicidade_dias);
      setForm(prev => ({ ...prev, data_validade: novaDataValidade }));
    }
  }, [form.data_aplicacao, form.vacina_id]);

  return (
    <div className="fixed inset-0 bg-black bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] text-white px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-semibold">
            {editando ? 'Editar Vacinação' : 'Registrar Vacinação'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selecionar Gado */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Selecionar Gado *
              </label>
              <select
                required
                value={form.gado_id}
                onChange={(e) => setForm({...form, gado_id: e.target.value})}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              >
                <option value="">Escolha um gado</option>
                {gados.map(gado => (
                  <option key={gado.id} value={gado.id}>
                    {gado.identificacao} {gado.nome ? `- ${gado.nome}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selecionar Vacina */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Selecionar Vacina *
              </label>
              <select
                required
                value={form.vacina_id}
                onChange={(e) => setForm({...form, vacina_id: e.target.value})}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              >
                <option value="">Escolha uma vacina</option>
                {vacinas.map(vacina => (
                  <option key={vacina.id} value={vacina.id}>
                    {vacina.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data de Aplicação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Aplicação *
              </label>
              <input
                type="date"
                required
                value={form.data_aplicacao}
                onChange={(e) => setForm({...form, data_aplicacao: e.target.value})}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Validade
              </label>
              <input
                type="date"
                value={form.data_validade}
                onChange={(e) => setForm({...form, data_validade: e.target.value})}
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              />
              {vacinaSelecionada?.periodicidade_dias && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Calculado automaticamente: {vacinaSelecionada.periodicidade_dias} dias
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
              >
                <option value="aplicada">✅ Aplicada</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="vencida">❌ Vencida</option>
              </select>
            </div>

            {/* Info da Vacina Selecionada */}
            {vacinaSelecionada && (
              <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-1">📋 Informações da Vacina:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>Nome:</strong> {vacinaSelecionada.nome}</li>
                  {vacinaSelecionada.periodicidade_dias && (
                    <li>• <strong>Periodicidade:</strong> {vacinaSelecionada.periodicidade_dias} dias</li>
                  )}
                  {vacinaSelecionada.repeticoes_ano && (
                    <li>• <strong>Repetições:</strong> {vacinaSelecionada.repeticoes_ano}x por ano</li>
                  )}
                  {vacinaSelecionada.tem_reforco && (
                    <li>• <strong>Reforço:</strong> Sim, após {vacinaSelecionada.dias_reforco} dias</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 hover:bg-[#2d5016] bg-[#4a7c2c] text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400 cursor-pointer"
            >
              {loading ? 'Processando...' : (editando ? 'Atualizar' : 'Registrar')}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Principal
export default function GadosVacinadosPage() {
  const [vacinacoes, setVacinacoes] = useState([]);
  const [gados, setGados] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [form, setForm] = useState({
    gado_id: '',
    vacina_id: '',
    data_aplicacao: '',
    data_validade: '',
    status: 'aplicada'
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resVacinacoes, resGados, resVacinas] = await Promise.all([
        fetch('/api/gado-vacinas'),
        fetch('/api/gado'),
        fetch('/api/vacina')
      ]);

      const dataVacinacoes = await resVacinacoes.json();
      const dataGados = await resGados.json();
      const dataVacinas = await resVacinas.json();

      setVacinacoes(dataVacinacoes);
      setGados(dataGados);
      setVacinas(dataVacinas);
    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editando ? `/api/gado-vacinas/${editando}` : '/api/gado-vacinas';
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert(editando ? 'Vacinação atualizada!' : 'Vacinação registrada!');
        limparForm();
        setModalAberto(false);
        carregarDados();
      } else {
        const error = await res.json();
        alert('Erro: ' + (error.error || 'Erro desconhecido'));
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  const handleEditar = (vacinacao) => {
    setForm({
      gado_id: vacinacao.gado_id,
      vacina_id: vacinacao.vacina_id,
      data_aplicacao: vacinacao.data_aplicacao,
      data_validade: vacinacao.data_validade || '',
      status: vacinacao.status
    });
    setEditando(vacinacao.id);
    setModalAberto(true);
  };

  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;

    try {
      const res = await fetch(`/api/gado-vacinas/${id}`, { method: 'DELETE' });
      
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
    setForm({
      gado_id: '',
      vacina_id: '',
      data_aplicacao: '',
      data_validade: '',
      status: 'aplicada'
    });
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

  // Filtrar vacinações
  const vacinacoesFiltradas = vacinacoes.filter(vac => {
    const matchBusca = vac.gado_identificacao?.toLowerCase().includes(busca.toLowerCase()) ||
                       vac.gado_nome?.toLowerCase().includes(busca.toLowerCase()) ||
                       vac.vacina_nome?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || vac.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'aplicada': 'bg-green-100 text-green-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'vencida': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      'aplicada': '✅',
      'pendente': '⏳',
      'vencida': '❌'
    };
    return emojis[status] || '❓';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7ECE1]">
      <header className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] w-full mb-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-4xl font-bold text-white">
            Sistema de Controle do Gado
          </h1>
          <button onClick={() => window.location.replace('/')} className="cursor-pointer text-white p-2 rounded-lg transition border border-white duration-200 ease-in-out  hover:ring-offset-1 hover:bg-white hover:text-black pl-4 pr-4">
            Sair
          </button>
        </div>
        <hr className="border-[#2d5016] flex"></hr>
        <nav className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] p-2 pl-1 pt-0">
          <div className="mx-auto flex space-x-1">
            <DropdownMenu title="Gado">
              <DropdownItem href="/gados">Cadastrar Gado</DropdownItem>
              <DropdownItem href="/gado-situacoes">Situação Gado</DropdownItem>
            </DropdownMenu>
        
            <DropdownMenu title="Vacinas">
              <DropdownItem href="/vacinas">Vacinas</DropdownItem>
              <DropdownItem href="/gado-vacinados">Gados Vacinados</DropdownItem>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <div className="flex-grow">
        {/* Barra de Busca, Filtros e Botão */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por gado ou vacina..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-gray-700"
                />
              </div>
              
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-gray-700"
              >
                <option value="todos">Todos os Status</option>
                <option value="aplicada">✅ Aplicada</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="vencida">❌ Vencida</option>
              </select>

              <button
                onClick={abrirModalNovo}
                className="w-full md:w-auto bg-[#4a7c2c] hover:bg-[#2d5016] text-white font-bold py-2 px-6 rounded-lg transition whitespace-nowrap cursor-pointer"
              >
                + Registrar Vacinação
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-t from-[#2d5016] to-[#4a7c2c] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">AÇÕES</th>
                    <th className="px-4 py-3 text-left">GADO</th>
                    <th className="px-4 py-3 text-left">VACINA</th>
                    <th className="px-4 py-3 text-left">DATA APLICAÇÃO</th>
                    <th className="px-4 py-3 text-left">DATA VALIDADE</th>
                    <th className="px-4 py-3 text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {vacinacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        {busca || filtroStatus !== 'todos' 
                          ? 'Nenhum registro encontrado' 
                          : 'Nenhuma vacinação registrada ainda'}
                      </td>
                    </tr>
                  ) : (
                    vacinacoesFiltradas.map((vac, index) => (
                      <tr key={vac.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(vac)}
                              className="text-white px-3 py-1 rounded transition text-sm cursor-pointer"
                              title="Editar"
                            >
                              <img src="lapis.png" alt="Editar" className="w-4 h-4"></img>
                            </button>
                            <button
                              onClick={() => handleDeletar(vac.id)}
                              className="text-white px-3 py-1 rounded transition text-sm cursor-pointer cursor-pointer"
                              title="Deletar"
                            >
                              <img src="lixo.png" alt="Deletar" className="w-4 h-4"></img>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>
                            <p>{vac.gado_identificacao}</p>
                            {vac.gado_nome && <p className="text-sm text-gray-500">{vac.gado_nome}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{vac.vacina_nome}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(vac.data_aplicacao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {vac.data_validade ? new Date(vac.data_validade).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(vac.status)}`}>
                            {getStatusEmoji(vac.status)} {vac.status.charAt(0).toUpperCase() + vac.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalVacinacao
        isOpen={modalAberto}
        onClose={fecharModal}
        form={form}
        setForm={setForm}
        editando={editando}
        loading={loading}
        handleSubmit={handleSubmit}
        gados={gados}
        vacinas={vacinas}
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