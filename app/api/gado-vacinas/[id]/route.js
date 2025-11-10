import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// PUT - Atualizar registro de vacinação
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { gado_id, vacina_id, data_aplicacao, data_validade, status } = data;

    if (!gado_id || !vacina_id || !data_aplicacao) {
      return NextResponse.json({ 
        error: 'Gado, vacina e data de aplicação são obrigatórios' 
      }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE gado_vacinas 
       SET gado_id = $1, vacina_id = $2, data_aplicacao = $3, 
           data_validade = $4, status = $5
       WHERE id = $6 RETURNING *`,
      [gado_id, vacina_id, data_aplicacao, data_validade || null, status || 'aplicada', id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar vacinação' }, { status: 500 });
  }
}

// DELETE - Deletar registro de vacinação
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const result = await pool.query(
      'DELETE FROM gado_vacinas WHERE id = $1 RETURNING *', 
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vacinação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao deletar vacinação' }, { status: 500 });
  }
}