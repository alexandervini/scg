import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// GET - Listar todos os registros de vacinação
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        gv.id,
        gv.gado_id,
        gv.vacina_id,
        gv.data_aplicacao,
        gv.data_validade,
        gv.status,
        g.identificacao as gado_identificacao,
        v.nome as vacina_nome,
        v.periodicidade_dias,
        v.tem_reforco,
        v.dias_reforco
      FROM gado_vacinas gv
      INNER JOIN gado g ON gv.gado_id = g.id
      INNER JOIN vacinas v ON gv.vacina_id = v.id
      ORDER BY gv.data_aplicacao DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar vacinações:', error);
    return NextResponse.json({ error: 'Erro ao listar vacinações' }, { status: 500 });
  }
}

// POST - Registrar nova vacinação
export async function POST(request) {
  try {
    const data = await request.json();
    const { gado_id, vacina_id, data_aplicacao, data_validade, status } = data;

    if (!gado_id || !vacina_id || !data_aplicacao) {
      return NextResponse.json({ 
        error: 'Gado, vacina e data de aplicação são obrigatórios' 
      }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO gado_vacinas (gado_id, vacina_id, data_aplicacao, data_validade, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [gado_id, vacina_id, data_aplicacao, data_validade || null, status || 'aplicada']
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar vacinação:', error);
    return NextResponse.json({ error: 'Erro ao registrar vacinação' }, { status: 500 });
  }
}