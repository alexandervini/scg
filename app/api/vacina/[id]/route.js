import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// Configuração do Pool de Conexões
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// PUT - Atualizar  vacina pelo NOME
export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Await necessário no Next.js 15+
    const nomeAntigo = decodeURIComponent(id);
    const data = await request.json();
    const { nome, periodicidade_dias } = data;

    if (!nome) {
      return NextResponse.json({ error: 'O nome da vacina é obrigatório' }, { status: 400 });
    }
    
    const result = await pool.query(
      `UPDATE vacinas 
       SET nome = $1, periodicidade_dias = $2
       WHERE nome = $3 RETURNING *`,
      [nome, periodicidade_dias || null, nomeAntigo]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vacina não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar vacina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao atualizar vacina' }, { status: 500 });
  }
}

// DELETE - Deletar vacina pelo NOME
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Na verdade será o nome codificado na URL
    const nomeVacina = decodeURIComponent(id);
    
    const result = await pool.query('DELETE FROM vacinas WHERE nome = $1 RETURNING *', [nomeVacina]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Vacina não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Vacina deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao deletar vacina' }, { status: 500 });
  }
}