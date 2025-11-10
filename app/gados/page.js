'use client';
import { useState, useEffect } from 'react';
import DropdownMenu, { DropdownItem } from '../dropdown-menu';


export default function Home() {
  const [gados, setGados] = useState([]);
  const [form, setForm] = useState({
    identificacao: '',
    sexo: 'M',
    raca: '',
    data_nascimento: '',
    qualidade: 'D', // Valor inicial 'Desconhecido'
    pai_identificador: '',
    mae_identificador: '',
    peso: ''
  });
  const [editando, setEditando] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarGados();
  }, []);

  const carregarGados = async () => {
    try {
      const res = await fetch('/api/gado');
      const data = await res.json();
      setGados(data);
    } catch (error) {
      alert('Erro ao carregar gados: ' + error.message);
    }
  };

  // Criar ou atualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editando ? `/api/gado/${editando}` : '/api/gado';
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert(editando ? 'Gado atualizado!' : 'Gado cadastrado!');
        setModalAberto(false); // Fecha a modal após sucesso
        limparForm();
        carregarGados();
      } else {
        const error = await res.json();
        alert('Erro: ' + error.error);
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  // Função auxiliar para formatar a data para YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return '';
  // Se a data já for YYYY-MM-DD (como no caso de um campo de data vazio), retorna
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
  
  // Converte para objeto Date
  const date = new Date(dateString);
  
  // Verifica se a data é válida
  if (isNaN(date.getTime())) return '';

  // Formata para YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Editar
  const handleEditar = (gado) => {
    const formattedDate = formatDate(gado.data_nascimento);
    
    setForm({
      identificacao: gado.identificacao,
      sexo: gado.sexo,
      raca: gado.raca || '',
      data_nascimento: formattedDate, // Usa a data formatada
      qualidade: gado.qualidade || 'D', // Preenche a qualidade
      pai_identificador: gado.pai_identificador || '',
      mae_identificador: gado.mae_identificador || '',
      peso: gado.peso || ''
    });
    setEditando(gado.id);
    setModalAberto(true); // Abre a modal ao editar
  };

  // Deletar
  const handleDeletar = async (id) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    try {
      const res = await fetch(`/api/gado/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Gado deletado!');
        carregarGados();
      }
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  const limparForm = () => {
    setModalAberto(false); // Fecha a modal ao limpar o formulário
    setForm({
      identificacao: '',
      sexo: 'M',
    raca: '',
    data_nascimento: '',
    qualidade: 'D', // Valor inicial 'Desconhecido'
    pai_identificador: '',
      mae_identificador: '',
    peso: ''
    });
    setEditando(null);
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

		      {/* Formulário */}
		      
		      <div className="flex-grow">
		      <div className="max-w-6xl mx-auto">
	        {/* Barra de Busca e Botão Nova Vacina (Adaptado para Gado) */}
	        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
	          <div className="flex gap-4 items-center">
	            <div className="flex-1">
	              <div className="relative">
		                <input
		                  type="text"
		                  placeholder="Buscar gado..."
		                  value={busca}
		                  onChange={(e) => setBusca(e.target.value)}
		                  className="w-full px-4 py-2 pl-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none text-gray-700"
		                />
	              </div>
	            </div>
	            <button
	              onClick={() => { limparForm(); setModalAberto(true); }}
	              className="bg-[#4a7c2c] hover:bg-[#2d5016] text-white font-bold py-2 px-6 rounded-lg transition whitespace-nowrap cursor-pointer"
	            >
	              + Novo Gado
	            </button>
	          </div>
	        </div>

        {/* Tabela */}
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-t from-[#2d5016] to-[#4a7c2c] text-white">
	                <tr>
	                  <th className="px-4 py-3 text-center">Ações</th>
	                  <th className="px-4 py-3 text-left">Identificação</th>
	                  <th className="px-4 py-3 text-left">Sexo</th>
		                  <th className="px-4 py-3 text-left">Raça</th>
		                  <th className="px-4 py-3 text-left">Peso (kg)</th>
		                  <th className="px-4 py-3 text-left">Qualidade</th>
		                  <th className="px-4 py-3 text-left">Nascimento</th>
	                  <th className="px-4 py-3 text-left">Pai</th>
		                  <th className="px-4 py-3 text-left">Mãe</th>
	                </tr>
              </thead>
	              <tbody>
	                {/* Filtrar gados pela identificação */}
	                {gados
	                  .filter(gado => gado.identificacao.toLowerCase().startsWith(busca.toLowerCase()))
	                  .length === 0 ? (
	                  <tr>
	                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
	                      {busca ? 'Nenhum gado encontrado com essa identificação' : 'Nenhum gado cadastrado ainda'}
	                    </td>
	                  </tr>
	                ) : (
	                  gados
	                    .filter(gado => gado.identificacao.toLowerCase().startsWith(busca.toLowerCase()))
	                    .map((gado, index) => (
                    
	                    <tr key={gado.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
			                      <td className="px-4 py-3">
			                        <div className="flex gap-2 justify-center">
			                          <button
			                            onClick={() => handleEditar(gado)}
			                            className="text-white px-3 py-1 rounded transition text-sm cursor-pointer"
			                            title="Editar"
			                          >
			                            <img src="lapis.png" alt="Editar" className="w-4 h-4"></img>
			                          </button>
			                          <button
			                            onClick={() => handleDeletar(gado.id)}
			                            className="text-white px-3 py-1 rounded transition text-sm cursor-pointer cursor-pointer"
			                            title="Deletar"
			                          >
			                            <img src="lixo.png" alt="Deletar" className="w-4 h-4"></img>
			                          </button>
			                        </div>
			                      </td>
		                      <td className="px-4 py-3 text-gray-700">{gado.identificacao}</td>
		                      <td className="px-4 py-3 text-gray-700">{gado.sexo === 'M' ? '♂️' : '♀️'}</td>
			                      <td className="px-4 py-3 text-gray-700">{gado.raca || '-'}</td>
			                      <td className="px-4 py-3 text-gray-700">{gado.peso ? `${gado.peso}` : '-'}</td>
			                      <td className="px-4 py-3 text-gray-700">{gado.qualidade_extenso || '-'}</td>
			                      <td className="px-4 py-3 text-gray-700">
			                        {gado.data_nascimento ? new Date(gado.data_nascimento).toLocaleDateString('pt-BR') : '-'}
			                      </td>
		                      <td className="px-4 py-3 text-gray-700">{gado.pai_identificador || '-'}</td>
					                      <td className="px-4 py-3 text-gray-700">{gado.mae_identificador || '-'}</td>
		                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div> 
	        
		      </div>
		      </div>
		
		      {/* Modal de Cadastro/Edição de Gado */}
{/* Modal de Cadastro/Edição de Gado */}
		        {modalAberto && (
		          <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] bg-opacity-50 flex items-center justify-center z-50 p-4">
		            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
		              <div className="bg-gradient-to-r from-[#2d5016] to-[#4a7c2c] text-white px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
		                <h2 className="text-2xl font-semibold">
		                  {editando ? 'Editar Gado' : 'Cadastrar Novo Gado'}
		                </h2>
		                <button 
		                  onClick={() => { setModalAberto(false); limparForm(); }}
		                  className="text-white hover:text-gray-200 text-2xl font-bold cursor-pointer"
		                >
		                  ×
		                </button>
		              </div>
		
		              <form onSubmit={handleSubmit} className="p-6">
		                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
		                  {/* Identificação */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-800 mb-1">
		                      Identificação *
		                    </label>
		                    <input 
		                      type="text"
		                      required
		                      value={form.identificacao}
		                      onChange={(e) => setForm({...form, identificacao: e.target.value})}
		                      className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
		                    />
		                  </div>
		
		                  {/* Sexo */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Sexo *
		                    </label>
		                    <select
		                      required
		                      value={form.sexo}
		                      onChange={(e) => setForm({...form, sexo: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none">
		                      <option value="M" className='text-gray-700'>Macho</option>
		                      <option value="F" className='text-gray-700'>Fêmea</option>
		                    </select>
		                  </div>
		
		                  {/* Raça */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Raça
		                    </label>
		                    <select
		                      value={form.raca}
		                      onChange={(e) => setForm({...form, raca: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none">
		                      <option value="" className='text-gray-700'></option>
		                      <option value="Nelore" className='text-gray-700'>Nelore</option>
		                      <option value="Angus" className='text-gray-700'>Angus</option>
		                      {/* Adicione mais opções de raça conforme necessário */}
		                    </select>
		                  </div>
		
		                  {/* Data de nascimento */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Data de nascimento *
		                    </label>
		                    <input
		                      required
		                      type="date"
		                      value={form.data_nascimento}
		                      onChange={(e) => setForm({...form, data_nascimento: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
		                    />
		                  </div>
		                  
		                  {/* Qualidade */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Qualidade *
		                    </label>
		                    <select
		                      required
		                      value={form.qualidade}
		                      onChange={(e) => setForm({...form, qualidade: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none">
		                      <option value="B" className='text-gray-700'>Bom</option>
		                      <option value="N" className='text-gray-700'>Neutra</option>
		                      <option value="R" className='text-gray-700'>Ruim</option>
		                      <option value="D" className='text-gray-700'>Desconhecido</option>
		                    </select>
		                  </div>

						  	{/* Peso */}
			            	<div>
			                    <label className="block text-sm font-medium text-gray-700 mb-1">
			                      Peso (kg)
			                    </label>
			                    <input
			                      type="number"
			                      step="0.01"
			                      value={form.peso}
			                      onChange={(e) => setForm({...form, peso: e.target.value})}
			                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
			                      placeholder="Ex: 500.75"
			                    />
			                  </div>
		
		                  {/* Identificação do pai - SELECT com filtro de machos */}
		                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Identificação do pai (Macho)
		                    </label>
		                    <select
		                      value={form.pai_identificador}
		                      onChange={(e) => setForm({...form, pai_identificador: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
		                    >
		                      <option value="" className='text-gray-700'></option>
		                      {gados.filter(g => g.sexo === 'M' && g.id !== Number(editando)).map((gado) => (
		                        <option key={gado.id} value={gado.identificacao} className='text-gray-700'>
		                          {gado.identificacao} {gado.raca ? `- ${gado.raca}` : ''}
		                        </option>
		                      ))}
		                    </select>
		                  </div>
		
			                  {/* Identificação da mãe - SELECT com filtro de fêmeas */}
			                  <div>
		                    <label className="block text-sm font-medium text-gray-700 mb-1">
		                      Identificação da mãe (Fêmea)
		                    </label>
		                    <select
		                      value={form.mae_identificador}
		                      onChange={(e) => setForm({...form, mae_identificador: e.target.value})}
		                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none"
		                    >
		                      <option value="" className='text-gray-700'></option>
		                      {gados.filter(g => g.sexo === 'F' && g.id !== Number(editando)).map((gado) => (
		                        <option key={gado.id} value={gado.identificacao} className='text-gray-700'>
		                          {gado.identificacao} {gado.raca ? `- ${gado.raca}` : ''}
		                        </option>
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
		                    {loading ? 'Processando...' : (editando ? 'Atualizar' : 'Cadastrar')}
		                  </button>
		                  
		                  <button
		                    type="button"
		                    onClick={() => { setModalAberto(false); limparForm(); }}
		                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition cursor-pointer"
		                  >
		                    Cancelar
		                  </button>	
		                </div>
		              </form>
		            </div>
		          </div>
		        )
		      }

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