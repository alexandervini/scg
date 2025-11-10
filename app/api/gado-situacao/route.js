import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003', // Lembre-se de usar variáveis de ambiente
});

// GET - Listar todas as condições de gado
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        gc.id,
        gc.gado_id,
        gc.condicao,
        g.identificacao as gado_identificacao
      FROM gado_condicao gc
      INNER JOIN gado g ON gc.gado_id = g.id
      ORDER BY gc.id DESC
    `);
    // Retorna as linhas encontradas, que será um array (pode ser vazio)
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar condições:', error);
    // Em caso de erro, retorna um objeto de erro e status 500
    return NextResponse.json({ error: 'Erro interno ao buscar dados.' }, { status: 500 });
  }
}

// POST - Registrar nova condição de gado
export async function POST(request) {
  try {
    const { gado_id, condicao } = await request.json();

    if (!gado_id || !condicao) {
      return NextResponse.json({ 
        error: 'O gado e a condição são obrigatórios.' 
      }, { status: 400 });
    }

    // Opcional: Verificar se o gado já tem uma condição para evitar duplicatas
    const check = await pool.query('SELECT id FROM gado_condicao WHERE gado_id = $1', [gado_id]);
    if (check.rows.length > 0) {
        return NextResponse.json({ error: 'Este gado já possui uma condição registrada. Edite a existente.' }, { status: 409 });
    }

    const result = await pool.query(
      `INSERT INTO gado_condicao (gado_id, condicao)
       VALUES ($1, $2) RETURNING *`,
      [gado_id, condicao]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar condição:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar a condição.' }, { status: 500 });
  }
}
