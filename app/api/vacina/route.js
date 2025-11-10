import { Pool } from 'pg';
import { NextResponse } from 'next/server';

// Configuração do Pool de Conexões (usando as credenciais do usuário)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// GET - Listar todas as vacinas
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM vacinas ORDER BY id DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar vacinas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao listar vacinas' }, { status: 500 });
  }
}

// POST - Criar nova vacina
export async function POST(request) {
  try {
    const data = await request.json();
    const { nome, periodicidade_dias } = data;

    if (!nome) {
      return NextResponse.json({ error: 'O nome da vacina é obrigatório' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO vacinas (nome, periodicidade_dias) VALUES ($1, $2) RETURNING *',
      [nome, periodicidade_dias || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vacina:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao criar vacina' }, { status: 500 });
  }
}