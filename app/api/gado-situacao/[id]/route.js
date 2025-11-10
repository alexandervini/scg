import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003', // Lembre-se de usar variáveis de ambiente
});

// PUT - Atualizar uma condição de gado
export async function PUT(request, { params }) {
  try {
    // CORREÇÃO AQUI: Adicionado 'await' para resolver a Promise de params
    const { id } = await params; 
    const { gado_id, condicao } = await request.json();

    if (!gado_id || !condicao) {
      return NextResponse.json({ 
        error: 'O gado e a condição são obrigatórios.' 
      }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE gado_condicao 
       SET gado_id = $1, condicao = $2
       WHERE id = $3 RETURNING *`,
      [gado_id, condicao, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Registro de condição não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar condição:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar a condição.' }, { status: 500 });
  }
}

// DELETE - Deletar uma condição de gado
export async function DELETE(request, { params }) {
  try {
    // CORREÇÃO AQUI: Adicionado 'await' para resolver a Promise de params
    const { id } = await params;
    
    const result = await pool.query(
      'DELETE FROM gado_condicao WHERE id = $1 RETURNING *', 
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Registro de condição não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Condição deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar condição:', error);
    return NextResponse.json({ error: 'Erro interno ao deletar a condição.' }, { status: 500 });
  }
}
